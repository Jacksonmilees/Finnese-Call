require('dotenv').config();

console.log('🔧 Africa\'s Talking Configuration Test');
console.log('=====================================');

// Check environment variables
const config = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
  callerId: process.env.CALLER_ID
};

console.log('\n📋 Current Configuration:');
console.log(`API Key: ${config.apiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`Username: ${config.username ? '✅ Set' : '❌ Not set'}`);
console.log(`Caller ID: ${config.callerId ? '✅ Set' : '❌ Not set'}`);

if (!config.apiKey || !config.username || !config.callerId) {
  console.log('\n❌ Please update your .env file with:');
  console.log('AT_API_KEY=your-africa-talking-api-key');
  console.log('AT_USERNAME=your-africa-talking-username');
  console.log('CALLER_ID=your-test-phone-number');
  console.log('\n🔗 Get these from your Africa\'s Talking dashboard');
  process.exit(1);
}

console.log('\n✅ Configuration looks good!');
console.log('\n🧪 Test Endpoints:');
console.log('1. Check status: GET http://localhost:3000/api/at/status');
console.log('2. Test outgoing call: POST http://localhost:3000/api/at/test-call');
console.log('   Body: { "to": "+254700088271" }');
console.log('3. Incoming call webhook: POST http://localhost:3000/api/at/incoming-call');

console.log('\n📞 To test:');
console.log('1. Start your backend: npm start');
console.log('2. Use Postman or curl to test the endpoints');
console.log('3. Configure your Africa\'s Talking webhook URL to:');
console.log('   http://your-domain.com/api/at/incoming-call');

console.log('\n🔗 Africa\'s Talking Dashboard:');
console.log('https://account.africastalking.com/'); 