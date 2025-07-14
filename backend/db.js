require('dotenv').config();
const { Sequelize } = require('sequelize');

// Parse the PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_zv70UqfedSkg@ep-bitter-truth-aetkbi0g-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully.');
    
    // Import models to ensure they're registered
    require('./models/Organization');
    require('./models/Agent');
    require('./models/Call');
    require('./models/Contact');
    require('./models/AuditLog');
    
    // Set up associations
    const Organization = sequelize.models.Organization;
    const Agent = sequelize.models.Agent;
    const Call = sequelize.models.Call;
    const Contact = sequelize.models.Contact;
    const AuditLog = sequelize.models.AuditLog;
    
    // Define associations
    Organization.hasMany(Agent, { foreignKey: 'organizationId' });
    Agent.belongsTo(Organization, { foreignKey: 'organizationId' });
    
    Organization.hasMany(Call, { foreignKey: 'organizationId' });
    Call.belongsTo(Organization, { foreignKey: 'organizationId' });
    
    Agent.hasMany(Call, { foreignKey: 'agentId' });
    Call.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });
    
    Organization.hasMany(Contact, { foreignKey: 'organizationId' });
    Contact.belongsTo(Organization, { foreignKey: 'organizationId' });
    
    Agent.hasMany(Contact, { foreignKey: 'assignedAgentId' });
    Contact.belongsTo(Agent, { foreignKey: 'assignedAgentId' });
    
    Organization.hasMany(AuditLog, { foreignKey: 'organizationId' });
    AuditLog.belongsTo(Organization, { foreignKey: 'organizationId' });
    
    Agent.hasMany(AuditLog, { foreignKey: 'userId' });
    AuditLog.belongsTo(Agent, { foreignKey: 'userId' });
    
    // Sync all models with the database (force: false to preserve existing data)
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized.');
    
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize }; 