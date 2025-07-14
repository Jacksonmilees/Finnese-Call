const fs = require('fs');
const path = require('path');

const envContent = `# PostgreSQL Configuration
DATABASE_URL=postgresql://neondb_owner:npg_zv70UqfedSkg@ep-bitter-truth-aetkbi0g-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
JWT_SECRET=finnese-call-super-secret-jwt-key-2024

# Server Configuration
PORT=3000

AT_API_KEY=atsk_ab58c3540f9d44f8f6ee76acf0d938ce8813a22fe9a214d988008dc3f67084ac536bb5b3
AT_USERNAME=jacksonmilees@gmail.com
CALLER_ID=+254711082321
Callback=https://api.africastalking.com/test/voice

# CRM Integration (Optional)
CRM_SALESFORCE_TOKEN=your-salesforce-token
CRM_HUBSPOT_TOKEN=your-hubspot-token
CRM_ZOHO_TOKEN=your-zoho-token
CRM_PIPEDRIVE_TOKEN=your-pipedrive-token

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the following Africa\'s Talking settings:');
  console.log('   - AT_API_KEY: Your Africa\'s Talking API Key');
  console.log('   - AT_USERNAME: Your Africa\'s Talking Username');
  console.log('   - CALLER_ID: Your test phone number');
  console.log('');
  console.log('🔗 Get these from your Africa\'s Talking dashboard');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 