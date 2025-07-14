const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Africa\'s Talking Environment Setup');
console.log('=====================================');
console.log('');

const envPath = path.join(__dirname, '.env');

// Read current .env file
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ .env file not found. Creating new one...');
  envContent = `# PostgreSQL Configuration
DATABASE_URL=postgresql://neondb_owner:npg_zv70UqfedSkg@ep-bitter-truth-aetkbi0g-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
JWT_SECRET=finnese-call-super-secret-jwt-key-2024

# Server Configuration
PORT=3000

# Africa's Talking Configuration
AT_API_KEY=your-africa-talking-api-key-here
AT_USERNAME=your-africa-talking-username-here
CALLER_ID=your-test-phone-number-here

# CRM Integration (Optional)
CRM_SALESFORCE_TOKEN=your-salesforce-token
CRM_HUBSPOT_TOKEN=your-hubspot-token
CRM_ZOHO_TOKEN=your-zoho-token
CRM_PIPEDRIVE_TOKEN=your-pipedrive-token

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
`;
}

const updateEnv = (key, value) => {
  const lines = envContent.split('\n');
  let found = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`${key}=`)) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }
  
  if (!found) {
    lines.push(`${key}=${value}`);
  }
  
  return lines.join('\n');
};

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

async function main() {
  try {
    console.log('📋 Please provide your Africa\'s Talking credentials:');
    console.log('');
    
    const apiKey = await askQuestion('🔑 API Key: ');
    const username = await askQuestion('👤 Username: ');
    const callerId = await askQuestion('📞 Test Phone Number (Caller ID): ');
    
    if (apiKey && username && callerId) {
      envContent = updateEnv('AT_API_KEY', apiKey);
      envContent = updateEnv('AT_USERNAME', username);
      envContent = updateEnv('CALLER_ID', callerId);
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('');
      console.log('✅ Environment file updated successfully!');
      console.log('');
      console.log('📋 Updated values:');
      console.log(`   API Key: ${apiKey}`);
      console.log(`   Username: ${username}`);
      console.log(`   Caller ID: ${callerId}`);
      console.log('');
      console.log('🚀 You can now restart your backend and test the integration!');
    } else {
      console.log('❌ All fields are required. Please try again.');
    }
  } catch (error) {
    console.error('❌ Error updating environment file:', error.message);
  } finally {
    rl.close();
  }
}

main(); 