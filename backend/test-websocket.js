const WebSocket = require('ws');

// Test WebSocket connection
function testWebSocket() {
  console.log('Testing WebSocket connection...');
  
  // Create a test token (you'll need to get a real one by logging in)
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJmaW5uZXNlQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDk5OTk5OSwiZXhwIjoxNzM1MDg2Mzk5fQ.test';
  
  const ws = new WebSocket(`ws://localhost:3000?token=${testToken}`);
  
  ws.on('open', () => {
    console.log('✅ WebSocket connected successfully');
    
    // Send a test message
    ws.send(JSON.stringify({ type: 'ping' }));
  });
  
  ws.on('message', (data) => {
    console.log('📨 Received WebSocket message:', data.toString());
  });
  
  ws.on('close', (code, reason) => {
    console.log('❌ WebSocket closed:', code, reason.toString());
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
  
  // Close after 5 seconds
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 5000);
}

testWebSocket(); 