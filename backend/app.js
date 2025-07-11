require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AfricaTalkingIntegration = require('./africa-talking-integration');
const CRMIntegration = require('./crm-integration');
const db = require('./db');
const { setupWebSocket, broadcast } = require('./websocket');
const http = require('http');
const auth = require('./auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const atIntegration = new AfricaTalkingIntegration({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});
const crmIntegration = new CRMIntegration({
  salesforce: process.env.CRM_SALESFORCE_TOKEN,
  hubspot: process.env.CRM_HUBSPOT_TOKEN,
  zoho: process.env.CRM_ZOHO_TOKEN,
  pipedrive: process.env.CRM_PIPEDRIVE_TOKEN,
});

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM agents WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !user.password || !auth.comparePassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = auth.signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', auth.requireAuth, async (req, res) => {
  const result = await db.query('SELECT id, email, name, role FROM agents WHERE id = $1', [req.user.id]);
  res.json({ user: result.rows[0] });
});

app.post('/api/auth/logout', (req, res) => {
  // JWT logout is handled client-side (just delete token)
  res.json({ success: true });
});

// --- PROTECTED ROUTES ---
app.get('/api/agents', auth.requireAuth, async (req, res) => {
  const result = await db.query('SELECT id, name, email, extension, status, role FROM agents ORDER BY name');
  res.json({ data: result.rows });
});

app.post('/api/agents', auth.requireAuth, auth.requireRole('admin'), async (req, res) => {
  const { name, email, extension, password, role } = req.body;
  const hash = auth.hashPassword(password);
  const result = await db.query(
    'INSERT INTO agents (name, email, extension, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, extension, role',
    [name, email, extension, hash, role || 'agent']
  );
  res.json({ agent: result.rows[0] });
});

// --- AGENT CRUD ENDPOINTS ---
// List agents (already exists)
// Create agent (already exists)
// Update agent
app.put('/api/agents/:id', auth.requireAuth, auth.requireRole('admin'), async (req, res) => {
  const { name, email, extension, password, role } = req.body;
  const { id } = req.params;
  let query, params;
  if (password) {
    const hash = auth.hashPassword(password);
    query = 'UPDATE agents SET name=$1, email=$2, extension=$3, password=$4, role=$5 WHERE id=$6 RETURNING id, name, email, extension, role';
    params = [name, email, extension, hash, role, id];
  } else {
    query = 'UPDATE agents SET name=$1, email=$2, extension=$3, role=$4 WHERE id=$5 RETURNING id, name, email, extension, role';
    params = [name, email, extension, role, id];
  }
  const result = await db.query(query, params);
  res.json({ agent: result.rows[0] });
});
// Delete agent
app.delete('/api/agents/:id', auth.requireAuth, auth.requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM agents WHERE id = $1', [id]);
  res.json({ success: true });
});

// Calls (recent)
app.get('/api/calls/recent', async (req, res) => {
  const result = await db.query('SELECT * FROM calls ORDER BY created_at DESC LIMIT 50');
  res.json({ data: result.rows });
});

// Stats (dashboard)
app.get('/api/stats/dashboard', async (req, res) => {
  const stats = {};
  const totalCalls = await db.query('SELECT COUNT(*) FROM calls WHERE created_at > NOW() - INTERVAL \'1 day\'' );
  const recordedCalls = await db.query('SELECT COUNT(*) FROM calls WHERE recording_url IS NOT NULL AND created_at > NOW() - INTERVAL \'1 day\'' );
  const availableAgents = await db.query("SELECT COUNT(*) FROM agents WHERE status = 'available'");
  const avgCallDuration = await db.query('SELECT AVG(duration) FROM calls WHERE created_at > NOW() - INTERVAL \'1 day\'' );
  stats.totalCalls = parseInt(totalCalls.rows[0].count, 10) || 0;
  stats.recordedCalls = parseInt(recordedCalls.rows[0].count, 10) || 0;
  stats.availableAgents = parseInt(availableAgents.rows[0].count, 10) || 0;
  stats.avgCallDuration = parseInt(avgCallDuration.rows[0].avg, 10) || 0;
  res.json({ data: stats });
});

// Make call
app.post('/api/call/make', auth.requireAuth, async (req, res) => {
  try {
    const { to, agentId } = req.body;
    const agent = await db.query('SELECT * FROM agents WHERE id = $1', [agentId]);
    if (!agent.rows[0]) return res.status(400).json({ success: false, error: 'Agent not found' });
    if (agent.rows[0].status !== 'available') return res.status(400).json({ success: false, error: 'Agent not available' });
    // Log call
    const callResult = await db.query(
      'INSERT INTO calls (phone_number, agent_id, direction, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [to, agentId, 'outbound', 'initiated']
    );
    // Initiate call
    await atIntegration.makeCall(to, agent.rows[0].extension, process.env.CALLER_ID);
    // Update agent status
    await db.query('UPDATE agents SET status = $1 WHERE id = $2', ['busy', agentId]);
    broadcast('call_update', { callId: callResult.rows[0].id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update agent status
app.post('/api/agent/status', auth.requireAuth, async (req, res) => {
  try {
    const { agentId, status } = req.body;
    await db.query('UPDATE agents SET status = $1 WHERE id = $2', [status, agentId]);
    broadcast('agent_status_update', { agentId, status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download recording
app.get('/api/recording/:callId', async (req, res) => {
  const { callId } = req.params;
  const result = await db.query('SELECT recording_url FROM calls WHERE id = $1', [callId]);
  if (result.rows[0] && result.rows[0].recording_url) {
    res.redirect(result.rows[0].recording_url);
  } else {
    res.status(404).json({ success: false, error: 'Recording not found' });
  }
});

// CRM click-to-call
app.post('/api/crm/click-to-call', async (req, res) => {
  try {
    const result = await crmIntegration.handleClickToCall(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CALL SEARCH/FILTER ENDPOINT ---
// GET /api/calls/search?phone=...&agentId=...&from=...&to=...
app.get('/api/calls/search', auth.requireAuth, async (req, res) => {
  const { phone, agentId, from, to } = req.query;
  let query = 'SELECT * FROM calls WHERE 1=1';
  const params = [];
  if (phone) {
    params.push(`%${phone}%`);
    query += ` AND phone_number ILIKE $${params.length}`;
  }
  if (agentId) {
    params.push(agentId);
    query += ` AND agent_id = $${params.length}`;
  }
  if (from) {
    params.push(from);
    query += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    query += ` AND created_at <= $${params.length}`;
  }
  query += ' ORDER BY created_at DESC LIMIT 100';
  const result = await db.query(query, params);
  res.json({ data: result.rows });
});

// Africa's Talking webhook
app.post('/webhook/incoming-call', (req, res) => {
  atIntegration.handleIncomingCall(req, res);
});

// --- MULTI-TENANT MIDDLEWARE ---
function requireOrg(req, res, next) {
  // For super-admin, org can be in query/header; for others, use req.user.organization_id
  req.organization_id = req.user && req.user.organization_id ? req.user.organization_id : 1;
  next();
}

// --- ORGANIZATIONS CRUD ---
app.get('/api/organizations', auth.requireAuth, auth.requireRole('admin'), async (req, res) => {
  const result = await db.query('SELECT * FROM organizations ORDER BY name');
  res.json({ data: result.rows });
});
app.post('/api/organizations', auth.requireAuth, auth.requireRole('admin'), async (req, res) => {
  const { name } = req.body;
  const result = await db.query('INSERT INTO organizations (name) VALUES ($1) RETURNING *', [name]);
  // Audit log
  await db.query('INSERT INTO audit_log (organization_id, user_id, action, details) VALUES ($1, $2, $3, $4)', [req.organization_id, req.user.id, 'create_organization', JSON.stringify({ name })]);
  res.json({ organization: result.rows[0] });
});

// --- ANALYTICS ENDPOINTS ---
app.get('/api/analytics/calls-per-day', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM calls_per_day WHERE organization_id = $1 ORDER BY day DESC LIMIT 30', [req.organization_id]);
  res.json({ data: result.rows });
});
app.get('/api/analytics/agent-leaderboard', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM agent_leaderboard WHERE organization_id = $1 ORDER BY total_calls DESC LIMIT 20', [req.organization_id]);
  res.json({ data: result.rows });
});
app.get('/api/analytics/queue-stats', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM queue_stats WHERE organization_id = $1', [req.organization_id]);
  res.json({ data: result.rows });
});

// --- AUDIT LOG ENDPOINT ---
app.get('/api/audit-log', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM audit_log WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 100', [req.organization_id]);
  res.json({ data: result.rows });
});

// --- PBX EVENT STREAMING ---
const PBXIntegration = require('./pbx-integration');
const pbx = new PBXIntegration({});
pbx.listenForEvents(event => {
  broadcast('pbx_event', event);
});

// --- MEDIA (RINGTONE/HOLD MUSIC) ---
app.post('/api/media/upload', auth.requireAuth, auth.requireRole('admin'), upload.single('file'), async (req, res) => {
  const { type, organization_id, queue_id, agent_id } = req.body;
  const fileUrl = `/uploads/${req.file.filename}_${req.file.originalname}`;
  fs.renameSync(req.file.path, path.join('uploads', req.file.filename + '_' + req.file.originalname));
  await db.query('INSERT INTO ringtones (organization_id, queue_id, agent_id, type, url) VALUES ($1, $2, $3, $4, $5)', [organization_id || null, queue_id || null, agent_id || null, type, fileUrl]);
  res.json({ success: true, url: fileUrl });
});
app.get('/api/media/list', auth.requireAuth, async (req, res) => {
  const { type, organization_id, queue_id, agent_id } = req.query;
  let query = 'SELECT * FROM ringtones WHERE 1=1';
  const params = [];
  if (type) { params.push(type); query += ` AND type = $${params.length}`; }
  if (organization_id) { params.push(organization_id); query += ` AND organization_id = $${params.length}`; }
  if (queue_id) { params.push(queue_id); query += ` AND queue_id = $${params.length}`; }
  if (agent_id) { params.push(agent_id); query += ` AND agent_id = $${params.length}`; }
  const result = await db.query(query, params);
  res.json({ data: result.rows });
});

// --- LANGUAGE ---
app.get('/api/language', auth.requireAuth, async (req, res) => {
  const { level, id } = req.query; // level: agent/organization/queue
  let result;
  if (level === 'agent') result = await db.query('SELECT language FROM agents WHERE id = $1', [id]);
  else if (level === 'organization') result = await db.query('SELECT language FROM organizations WHERE id = $1', [id]);
  else if (level === 'queue') result = await db.query('SELECT language FROM call_queues WHERE id = $1', [id]);
  res.json({ language: result.rows[0]?.language || 'en' });
});
app.post('/api/language', auth.requireAuth, async (req, res) => {
  const { level, id, language } = req.body;
  if (level === 'agent') await db.query('UPDATE agents SET language = $1 WHERE id = $2', [language, id]);
  else if (level === 'organization') await db.query('UPDATE organizations SET language = $1 WHERE id = $2', [language, id]);
  else if (level === 'queue') await db.query('UPDATE call_queues SET language = $1 WHERE id = $2', [language, id]);
  res.json({ success: true });
});

// --- CALL TAGGING, NOTES, CALLBACK ---
app.put('/api/calls/:id/tag', auth.requireAuth, async (req, res) => {
  await db.query('UPDATE calls SET tag = $1 WHERE id = $2', [req.body.tag, req.params.id]);
  res.json({ success: true });
});
app.put('/api/calls/:id/notes', auth.requireAuth, async (req, res) => {
  await db.query('UPDATE calls SET notes = $1 WHERE id = $2', [req.body.notes, req.params.id]);
  res.json({ success: true });
});
app.put('/api/calls/:id/callback', auth.requireAuth, async (req, res) => {
  await db.query('UPDATE calls SET callback_time = $1, callback_status = $2 WHERE id = $3', [req.body.callback_time, req.body.callback_status || 'scheduled', req.params.id]);
  res.json({ success: true });
});

// --- WALLBOARD ---
app.get('/api/wallboard', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM call_wallboard_view WHERE organization_id = $1', [req.organization_id]);
  res.json({ data: result.rows[0] });
});

// --- NOTIFICATION SETTINGS ---
app.get('/api/notifications', auth.requireAuth, async (req, res) => {
  const result = await db.query('SELECT * FROM notification_settings WHERE agent_id = $1', [req.user.id]);
  res.json({ data: result.rows });
});
app.post('/api/notifications', auth.requireAuth, async (req, res) => {
  const { type, enabled } = req.body;
  await db.query('INSERT INTO notification_settings (agent_id, type, enabled) VALUES ($1, $2, $3) ON CONFLICT (agent_id, type) DO UPDATE SET enabled = $3', [req.user.id, type, enabled]);
  res.json({ success: true });
});

// --- EXPORT REPORTS ---
app.get('/api/reports/calls.csv', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM calls WHERE organization_id = $1', [req.organization_id]);
  const csvWriter = createObjectCsvWriter({
    path: 'calls_report.csv',
    header: Object.keys(result.rows[0] || {}).map(k => ({ id: k, title: k }))
  });
  await csvWriter.writeRecords(result.rows);
  res.download('calls_report.csv');
});
app.get('/api/reports/calls.pdf', auth.requireAuth, requireOrg, async (req, res) => {
  const result = await db.query('SELECT * FROM calls WHERE organization_id = $1', [req.organization_id]);
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);
  doc.fontSize(16).text('Calls Report', { align: 'center' });
  doc.moveDown();
  result.rows.forEach(row => {
    doc.fontSize(10).text(JSON.stringify(row));
    doc.moveDown(0.5);
  });
  doc.end();
});

// --- SCREEN POP, NOTIFICATIONS, PRESENCE (WebSocket stubs) ---
// To trigger a screen pop, send {type: 'screen_pop', data: {...}} to the agent's WebSocket
// To trigger a browser notification, send {type: 'notification', data: {...}}
// To update presence, send {type: 'presence', data: {...}}
// Wallboard updates: {type: 'wallboard', data: {...}}
// These are handled in the frontend WebSocket logic

// --- SERVER STARTUP ---
const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Finnese-call backend running on port ${PORT}`);
}); 