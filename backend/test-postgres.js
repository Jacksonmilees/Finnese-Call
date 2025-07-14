require('dotenv').config();
const { connectDB, sequelize } = require('./db');
const auth = require('./auth');

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    await connectDB();
    
    // Test creating a simple table
    console.log('✅ PostgreSQL connection successful!');
    console.log('✅ Database models synchronized!');
    
    // Test creating a default organization
    const Organization = require('./models/Organization');
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({
        name: 'Test Organization',
        domain: 'test.com'
      });
      console.log('✅ Created test organization:', org.name);
    } else {
      console.log('✅ Found existing organization:', org.name);
    }
    
    // Create main admin user if not exists
    const Agent = require('./models/Agent');
    const adminEmail = 'finnese@gmail.com';
    const adminPassword = 'finnese2025';
    let admin = await Agent.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await Agent.create({
        username: 'finnese_admin',
        firstName: 'Finnese',
        lastName: 'Admin',
        email: adminEmail,
        phone: '0700000000',
        password: auth.hashPassword(adminPassword),
        role: 'admin',
        status: 'available',
        organizationId: org.id
      });
      console.log('✅ Created main admin:', admin.email);
    } else {
      console.log('✅ Main admin already exists:', admin.email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
}

testConnection(); 