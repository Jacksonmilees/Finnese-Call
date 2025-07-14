require('dotenv').config();
const { sequelize } = require('./db');

async function verifyColumn() {
  try {
    console.log('🔍 Verifying sessionId column in calls table...');
    
    // Check if the column exists by trying to select it
    const [results] = await sequelize.query(`
      SELECT id, sessionId FROM calls LIMIT 1;
    `);
    
    console.log('✅ sessionId column exists and is accessible!');
    console.log('Sample query result:', results);
    
  } catch (error) {
    console.error('❌ Error verifying column:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

verifyColumn(); 