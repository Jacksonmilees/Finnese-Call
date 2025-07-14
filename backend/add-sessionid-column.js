require('dotenv').config();
const { sequelize } = require('./db');

async function addSessionIdColumn() {
  try {
    console.log('🔧 Adding sessionId column to calls table...');
    
    // Add the sessionId column
    await sequelize.query('ALTER TABLE calls ADD COLUMN IF NOT EXISTS sessionId VARCHAR(255);');
    
    console.log('✅ sessionId column added successfully!');
    
    // Verify the column was added
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'calls' AND column_name = 'sessionId';
    `);
    
    if (results.length > 0) {
      console.log('✅ Column verification successful:', results[0]);
    } else {
      console.log('❌ Column was not added properly');
    }
    
  } catch (error) {
    console.error('❌ Error adding sessionId column:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addSessionIdColumn(); 