-- Database schema for FinesseCall application

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    extension VARCHAR(50),
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'agent',
    status VARCHAR(50) DEFAULT 'offline',
    avatar_url TEXT,
    sip_username VARCHAR(255),
    sip_password VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    organization_id INTEGER REFERENCES organizations(id) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) NOT NULL,
    agent_id INTEGER REFERENCES agents(id),
    direction VARCHAR(20) NOT NULL, -- 'inbound' or 'outbound'
    status VARCHAR(50) NOT NULL, -- 'initiated', 'ringing', 'connected', 'ended', 'missed'
    duration INTEGER DEFAULT 0, -- in seconds
    recording_url TEXT,
    screen_recording_url TEXT,
    contact_id VARCHAR(255),
    disposition VARCHAR(255),
    notes TEXT,
    transcript TEXT,
    live_transcript TEXT,
    tag VARCHAR(100),
    callback_time TIMESTAMP,
    callback_status VARCHAR(50),
    organization_id INTEGER REFERENCES organizations(id) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call participants table (for conference calls)
CREATE TABLE IF NOT EXISTS call_participants (
    id SERIAL PRIMARY KEY,
    call_id INTEGER REFERENCES calls(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id),
    agent_name VARCHAR(255),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP
);

-- CRM Contacts table
CREATE TABLE IF NOT EXISTS crm_contacts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    last_interaction VARCHAR(255),
    notes TEXT,
    crm_type VARCHAR(50), -- 'Salesforce', 'HubSpot', 'Zoho'
    organization_id INTEGER REFERENCES organizations(id) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES agents(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, type)
);

-- Ringtones table
CREATE TABLE IF NOT EXISTS ringtones (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    queue_id INTEGER,
    agent_id INTEGER REFERENCES agents(id),
    type VARCHAR(50), -- 'ringtone', 'hold_music'
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call queues table
CREATE TABLE IF NOT EXISTS call_queues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization_id INTEGER REFERENCES organizations(id),
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default organization
INSERT INTO organizations (id, name) VALUES (1, 'Default Organization') ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id); 