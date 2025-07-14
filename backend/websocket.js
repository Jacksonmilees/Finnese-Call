const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws, req) => {
    // Extract token from query parameters
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'No token provided');
      return;
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;
      ws.userRole = decoded.role;
      ws.organizationId = decoded.organization_id;
      
      console.log(`WebSocket connected: User ${decoded.id} (${decoded.role})`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Invalid token');
      return;
    }
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log(`WebSocket disconnected: User ${ws.userId}`);
    });
  });
}

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;
    case 'subscribe':
      // Handle subscription to specific events
      ws.subscriptions = ws.subscriptions || [];
      ws.subscriptions.push(data.channel);
      break;
    default:
      console.log('Unknown WebSocket message type:', data.type);
  }
}

function broadcast(type, data, filter = null) {
  if (!wss) {
    console.log('❌ WebSocket server not initialized');
    return;
  }
  
  const message = JSON.stringify({ type, data });
  let sentCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Apply filter if provided
      if (filter && !filter(client)) {
        return;
      }
      client.send(message);
      sentCount++;
    }
  });
  
  console.log(`📤 Sent ${type} message to ${sentCount} clients`);
}

// Specific broadcast functions for different events
function broadcastToOrganization(organizationId, type, data) {
  console.log(`📡 Broadcasting ${type} to organization ${organizationId}:`, data);
  broadcast(type, data, (client) => client.organizationId === organizationId);
}

function broadcastToAgent(agentId, type, data) {
  broadcast(type, data, (client) => client.userId === agentId);
}

function broadcastToAdmins(type, data) {
  broadcast(type, data, (client) => client.userRole === 'admin');
}

module.exports = { 
  setupWebSocket, 
  broadcast, 
  broadcastToOrganization, 
  broadcastToAgent, 
  broadcastToAdmins 
}; 