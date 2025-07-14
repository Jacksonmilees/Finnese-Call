const axios = require('axios');

// Test inbound call simulation
async function testInboundCall() {
  try {
    console.log('Testing inbound call webhook...');
    
    // Simulate Africa's Talking webhook payload for inbound call
    const webhookPayload = {
      isActive: '1', // Call is active
      callerNumber: '+254700088271', // Test caller number
      dtmfDigits: '', // No DTMF digits
      recordingUrl: '', // No recording URL
      sessionId: `session_${Date.now()}`,
      callSessionState: 'Started',
      callerCarrierName: 'Safaricom',
      destinationNumber: '+254711082321', // Your Africa's Talking number
      durationInSeconds: '0',
      currencyCode: 'KES',
      amount: '0'
    };

    console.log('Sending webhook payload:', webhookPayload);
    
    const response = await axios.post('http://localhost:3000/api/at/incoming-call', webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Webhook response status:', response.status);
    console.log('Webhook response:', response.data);
    
  } catch (error) {
    console.error('Error testing inbound call:', error.response?.data || error.message);
  }
}

// Test call end simulation
async function testCallEnd() {
  try {
    console.log('\nTesting call end webhook...');
    
    const webhookPayload = {
      isActive: '0', // Call ended
      callerNumber: '+254700088271',
      dtmfDigits: '',
      recordingUrl: 'https://example.com/recording.mp3',
      sessionId: `session_${Date.now()}`,
      callSessionState: 'Completed',
      callerCarrierName: 'Safaricom',
      destinationNumber: '+254711082321',
      durationInSeconds: '30',
      currencyCode: 'KES',
      amount: '0'
    };

    console.log('Sending call end payload:', webhookPayload);
    
    const response = await axios.post('http://localhost:3000/api/at/incoming-call', webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Call end response status:', response.status);
    console.log('Call end response:', response.data);
    
  } catch (error) {
    console.error('Error testing call end:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('=== Africa\'s Talking Inbound Call Test ===\n');
  
  await testInboundCall();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  await testCallEnd();
  
  console.log('\n=== Test Complete ===');
}

runTests(); 