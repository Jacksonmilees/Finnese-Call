const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Call = sequelize.define('Call', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  callId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direction: {
    type: DataTypes.ENUM('inbound', 'outbound'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ringing', 'answered', 'completed', 'failed', 'busy', 'no-answer'),
    defaultValue: 'ringing'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recordingUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'agents',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  contactId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'contacts',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
    field: 'sessionid'
  }
}, {
  tableName: 'calls',
  timestamps: true
});

module.exports = Call; 