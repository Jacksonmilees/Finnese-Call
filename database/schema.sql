-- Finnese-call Database Schema

-- Organizations table
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add organization_id to agents
ALTER TABLE agents ADD COLUMN organization_id INTEGER REFERENCES organizations(id) DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(organization_id);

-- Add organization_id to calls
ALTER TABLE calls ADD COLUMN organization_id INTEGER REFERENCES organizations(id) DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_calls_org ON calls(organization_id);

-- Add organization_id to call_queues
ALTER TABLE call_queues ADD COLUMN organization_id INTEGER REFERENCES organizations(id) DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_queues_org ON call_queues(organization_id);

-- Add organization_id to voicemails
ALTER TABLE voicemails ADD COLUMN organization_id INTEGER REFERENCES organizations(id) DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_voicemails_org ON voicemails(organization_id);

-- Add organization_id to crm_integrations
ALTER TABLE crm_integrations ADD COLUMN organization_id INTEGER REFERENCES organizations(id) DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_crm_org ON crm_integrations(organization_id);

-- Audit log table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES agents(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_log(organization_id);

-- Analytics views
CREATE VIEW calls_per_day AS
SELECT organization_id, DATE(created_at) AS day, COUNT(*) AS total_calls, COUNT(CASE WHEN status = 'answered' THEN 1 END) AS answered, COUNT(CASE WHEN status = 'missed' THEN 1 END) AS missed
FROM calls
GROUP BY organization_id, day
ORDER BY day DESC;

CREATE VIEW agent_leaderboard AS
SELECT organization_id, agent_id, COUNT(*) AS total_calls, COUNT(CASE WHEN status = 'answered' THEN 1 END) AS answered, AVG(duration) AS avg_duration
FROM calls
GROUP BY organization_id, agent_id
ORDER BY total_calls DESC;

CREATE VIEW queue_stats AS
SELECT organization_id, queue_id, COUNT(*) AS total_calls, AVG(duration) AS avg_duration, AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) AS avg_wait_time
FROM calls
WHERE queue_id IS NOT NULL
GROUP BY organization_id, queue_id;

-- Agents table
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    extension VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    max_concurrent_calls INTEGER DEFAULT 1,
    current_call_count INTEGER DEFAULT 0,
    last_call_time TIMESTAMP,
    last_status_change TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Calls table
CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) NOT NULL,
    agent_id INTEGER REFERENCES agents(id),
    contact_id INTEGER, -- CRM contact ID
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status VARCHAR(50) DEFAULT 'initiated',
    at_call_id VARCHAR(255), -- Africa's Talking call ID
    duration INTEGER, -- Call duration in seconds
    recording_url TEXT,
    source VARCHAR(50) DEFAULT 'manual', -- manual, crm, api
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Call logs table (for detailed call events)
CREATE TABLE call_logs (
    id SERIAL PRIMARY KEY,
    call_id INTEGER REFERENCES calls(id),
    event_type VARCHAR(50) NOT NULL, -- dialing, answered, transferred, ended, etc.
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Custom messages table
CREATE TABLE custom_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    voice VARCHAR(50) DEFAULT 'woman',
    language VARCHAR(10) DEFAULT 'en-US',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Queue configuration
CREATE TABLE call_queues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    welcome_message_id INTEGER REFERENCES custom_messages(id),
    hold_message_id INTEGER REFERENCES custom_messages(id),
    max_wait_time INTEGER DEFAULT 300, -- 5 minutes
    overflow_action VARCHAR(50) DEFAULT 'voicemail',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Queue members (agents assigned to queues)
CREATE TABLE queue_members (
    id SERIAL PRIMARY KEY,
    queue_id INTEGER REFERENCES call_queues(id),
    agent_id INTEGER REFERENCES agents(id),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(queue_id, agent_id)
);

-- Voicemail table
CREATE TABLE voicemails (
    id SERIAL PRIMARY KEY,
    caller_number VARCHAR(50) NOT NULL,
    recording_url TEXT NOT NULL,
    duration INTEGER,
    transcription TEXT,
    is_read BOOLEAN DEFAULT false,
    assigned_to INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- System settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRM Integration settings
CREATE TABLE crm_integrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_endpoint TEXT,
    api_key TEXT,
    webhook_url TEXT,
    field_mappings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Call recordings metadata
CREATE TABLE call_recordings (
    id SERIAL PRIMARY KEY,
    call_id INTEGER REFERENCES calls(id),
    recording_url TEXT NOT NULL,
    file_size INTEGER,
    duration INTEGER,
    format VARCHAR(10) DEFAULT 'mp3',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent performance metrics
CREATE TABLE agent_metrics (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    date DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    answered_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    total_talk_time INTEGER DEFAULT 0, -- in seconds
    average_call_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(agent_id, date)
);

-- Indexes for performance
CREATE INDEX idx_calls_agent_id ON calls(agent_id);
CREATE INDEX idx_calls_created_at ON calls(created_at);
CREATE INDEX idx_calls_phone_number ON calls(phone_number);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX idx_voicemails_is_read ON voicemails(is_read);

-- Insert default data
INSERT INTO custom_messages (name, message, voice) VALUES 
('Default Welcome', 'Thank you for calling. Please hold while we connect you to the next available agent.', 'woman'),
('Default Hold', 'You are currently in a queue. Please continue to hold and your call will be answered shortly.', 'woman'),
('Default Voicemail', 'All our agents are currently busy. Please leave a detailed message after the beep and we will get back to you soon.', 'woman'),
('After Hours', 'Thank you for calling. Our office hours are Monday to Friday, 9 AM to 6 PM. Please call back during business hours or leave a message.', 'woman');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('max_call_duration', '3600', 'Maximum call duration in seconds'),
('recording_enabled', 'true', 'Enable call recording by default'),
('voicemail_enabled', 'true', 'Enable voicemail functionality'),
('business_hours_start', '09:00', 'Business hours start time'),
('business_hours_end', '18:00', 'Business hours end time'),
('timezone', 'Africa/Nairobi', 'System timezone'),
('default_caller_id', '+254XXXXXXXXX', 'Default caller ID for outbound calls');

-- Create a default queue
INSERT INTO call_queues (name, welcome_message_id, hold_message_id) VALUES 
('Default Queue', 1, 2);

-- Views for reporting
CREATE VIEW call_summary AS
SELECT 
    DATE(created_at) as call_date,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound_calls,
    COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound_calls,
    COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered_calls,
    COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed_calls,
    AVG(duration) as avg_duration
FROM calls
GROUP BY DATE(created_at)
ORDER BY call_date DESC;

CREATE VIEW agent_performance AS
SELECT 
    a.name as agent_name,
    a.extension,
    a.status,
    COUNT(c.id) as total_calls_today,
    COUNT(CASE WHEN c.status = 'answered' THEN 1 END) as answered_calls_today,
    AVG(c.duration) as avg_call_duration_today,
    a.last_call_time
FROM agents a
LEFT JOIN calls c ON a.id = c.agent_id AND DATE(c.created_at) = CURRENT_DATE
GROUP BY a.id, a.name, a.extension, a.status, a.last_call_time
ORDER BY total_calls_today DESC; 

-- Add authentication fields to agents table
ALTER TABLE agents ADD COLUMN password VARCHAR(255);
ALTER TABLE agents ADD COLUMN role VARCHAR(20) DEFAULT 'agent';
-- Add index for role
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role); 

-- Add call tagging, notes, callback scheduling
ALTER TABLE calls ADD COLUMN tag VARCHAR(100);
ALTER TABLE calls ADD COLUMN notes TEXT;
ALTER TABLE calls ADD COLUMN callback_time TIMESTAMP;
ALTER TABLE calls ADD COLUMN callback_status VARCHAR(50) DEFAULT 'pending';
CREATE INDEX IF NOT EXISTS idx_calls_callback_time ON calls(callback_time);

-- Ringtones and hold music
CREATE TABLE ringtones (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    queue_id INTEGER REFERENCES call_queues(id),
    agent_id INTEGER REFERENCES agents(id),
    type VARCHAR(20) NOT NULL, -- 'ringtone' or 'hold'
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ringtones_org ON ringtones(organization_id);

-- Language support
ALTER TABLE agents ADD COLUMN language VARCHAR(10) DEFAULT 'en';
ALTER TABLE organizations ADD COLUMN language VARCHAR(10) DEFAULT 'en';

-- Notification settings
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    type VARCHAR(50) NOT NULL, -- 'call', 'message', etc.
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Wallboard view for real-time stats
CREATE VIEW call_wallboard_view AS
SELECT organization_id, COUNT(*) FILTER (WHERE status = 'in_progress') AS active_calls, COUNT(*) FILTER (WHERE status = 'ringing') AS ringing_calls, COUNT(*) FILTER (WHERE status = 'on_hold') AS on_hold_calls, COUNT(*) FILTER (WHERE status = 'queued') AS queued_calls, COUNT(*) FILTER (WHERE status = 'answered' AND created_at > NOW() - INTERVAL '1 hour') AS answered_last_hour
FROM calls
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY organization_id; 