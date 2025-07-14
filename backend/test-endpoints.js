const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = null;

async function testEndpoints() {
  console.log('🧪 Testing Call Center API Endpoints...\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Set auth header for subsequent requests
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };

    // Test 2: Get Current User
    console.log('2. Testing Get Current User...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, config);
    console.log('✅ Current user:', userResponse.data.user.name, '\n');

    // Test 3: Get Dashboard Stats
    console.log('3. Testing Dashboard Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/stats/dashboard`, config);
    console.log('✅ Dashboard stats:', statsResponse.data.data, '\n');

    // Test 4: Get Agents
    console.log('4. Testing Get Agents...');
    const agentsResponse = await axios.get(`${BASE_URL}/agents`, config);
    console.log('✅ Agents count:', agentsResponse.data.data.length, '\n');

    // Test 5: Get Recent Calls
    console.log('5. Testing Get Recent Calls...');
    const callsResponse = await axios.get(`${BASE_URL}/calls/recent`, config);
    console.log('✅ Recent calls count:', callsResponse.data.data.length, '\n');

    // Test 6: Get Contacts
    console.log('6. Testing Get Contacts...');
    const contactsResponse = await axios.get(`${BASE_URL}/contacts`, config);
    console.log('✅ Contacts count:', contactsResponse.data.data.length, '\n');

    // Test 7: Analytics - Calls Per Day
    console.log('7. Testing Analytics - Calls Per Day...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/calls-per-day`, config);
    console.log('✅ Analytics data received\n');

    // Test 8: Analytics - Agent Leaderboard
    console.log('8. Testing Analytics - Agent Leaderboard...');
    const leaderboardResponse = await axios.get(`${BASE_URL}/analytics/agent-leaderboard`, config);
    console.log('✅ Leaderboard data received\n');

    // Test 9: Analytics - Disposition Breakdown
    console.log('9. Testing Analytics - Disposition Breakdown...');
    const dispositionResponse = await axios.get(`${BASE_URL}/analytics/disposition-breakdown`, config);
    console.log('✅ Disposition breakdown received\n');

    // Test 10: Personal Stats (if user is agent)
    if (userResponse.data.user.role === 'agent') {
      console.log('10. Testing Personal Stats...');
      const personalStatsResponse = await axios.get(`${BASE_URL}/agent/personal-stats`, config);
      console.log('✅ Personal stats:', personalStatsResponse.data.data, '\n');
    }

    console.log('🎉 All endpoint tests completed successfully!');
    console.log('\n📋 Implemented Endpoints Summary:');
    console.log('✅ Authentication: /auth/login, /auth/me, /auth/logout');
    console.log('✅ Agents: /agents (GET, POST, PUT, DELETE), /agent/status');
    console.log('✅ Calls: /calls/recent, /calls/search, /call/make, /calls/:id (PUT)');
    console.log('✅ Call Management: /calls/:id/tag, /calls/:id/notes, /calls/:id/callback');
    console.log('✅ Call Transfer/Conference: /calls/:id/transfer, /calls/:id/conference');
    console.log('✅ Call Monitoring: /calls/:id/monitor, /calls/:id/stop-monitor');
    console.log('✅ Stats: /stats/dashboard, /agent/personal-stats');
    console.log('✅ Analytics: /analytics/calls-per-day, /analytics/agent-leaderboard, /analytics/disposition-breakdown');
    console.log('✅ Contacts: /contacts (GET, POST, PUT, DELETE)');
    console.log('✅ CRM: /crm/click-to-call');
    console.log('✅ Recordings: /recording/:callId');
    console.log('✅ Organizations: /organizations (GET, POST)');
    console.log('✅ Audit Log: /audit-log');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testEndpoints(); 