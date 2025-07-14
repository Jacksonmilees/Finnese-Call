require('dotenv').config();
const { connectDB } = require('./db');
const auth = require('./auth');
const Organization = require('./models/Organization');
const Agent = require('./models/Agent');
const Call = require('./models/Call');
const Contact = require('./models/Contact');

async function initializeDatabase() {
    try {
        console.log('Initializing MongoDB database...');
        
        // Connect to MongoDB
        await connectDB();
        
        // Create default organization
        let defaultOrg = await Organization.findOne({ name: 'Default Organization' });
        if (!defaultOrg) {
            defaultOrg = new Organization({ name: 'Default Organization' });
            await defaultOrg.save();
            console.log('Default organization created');
        }
        
        // Create sample agents
        const sampleAgents = [
            {
                name: 'Alice Johnson',
                email: 'alice@finnese-call.com',
                extension: '101',
                password: 'password123',
                role: 'agent',
                status: 'available',
                avatarUrl: 'https://i.pravatar.cc/100?u=alice',
                sipUsername: 'alice_finesse',
                sipPassword: 'password123'
            },
            {
                name: 'Bob Williams',
                email: 'bob@finnese-call.com',
                extension: '102',
                password: 'password123',
                role: 'agent',
                status: 'busy',
                avatarUrl: 'https://i.pravatar.cc/100?u=bob',
                sipUsername: 'bob_finesse',
                sipPassword: 'password123'
            },
            {
                name: 'Charlie Brown',
                email: 'charlie@finnese-call.com',
                extension: '103',
                password: 'password123',
                role: 'agent',
                status: 'available',
                avatarUrl: 'https://i.pravatar.cc/100?u=charlie',
                sipUsername: 'charlie_finesse',
                sipPassword: 'password123'
            },
            {
                name: 'Diana Miller',
                email: 'diana@finnese-call.com',
                extension: '104',
                password: 'password123',
                role: 'agent',
                status: 'away',
                avatarUrl: 'https://i.pravatar.cc/100?u=diana',
                sipUsername: 'diana_finesse',
                sipPassword: 'password123'
            },
            {
                name: 'Ethan Davis',
                email: 'ethan@finnese-call.com',
                extension: '105',
                password: 'password123',
                role: 'agent',
                status: 'offline',
                avatarUrl: 'https://i.pravatar.cc/100?u=ethan',
                sipUsername: 'ethan_finesse',
                sipPassword: 'password123'
            },
            {
                name: 'Fiona Garcia',
                email: 'fiona@finnese-call.com',
                extension: '106',
                password: 'password123',
                role: 'agent',
                status: 'available',
                avatarUrl: 'https://i.pravatar.cc/100?u=fiona',
                sipUsername: 'fiona_finesse',
                sipPassword: 'password123'
            }
        ];
        
        for (const agentData of sampleAgents) {
            const existingAgent = await Agent.findOne({ email: agentData.email });
            if (!existingAgent) {
                const hash = auth.hashPassword(agentData.password);
                const agent = new Agent({
                    ...agentData,
                    password: hash,
                    organizationId: defaultOrg._id
                });
                await agent.save();
            }
        }
        console.log('Sample agents created');
        
        // Create sample CRM contacts
        const sampleContacts = [
            {
                contactId: 'ct101',
                name: 'John Doe',
                company: 'Acme Inc.',
                email: 'j.doe@acme.com',
                phone: '+1-202-555-0125',
                lastInteraction: '2 days ago',
                notes: 'Interested in enterprise plan. Follow up next week.',
                crmType: 'Salesforce'
            },
            {
                contactId: 'ct102',
                name: 'Jane Smith',
                company: 'Innovate LLC',
                email: 'j.smith@innovate.com',
                phone: '+1-202-555-0182',
                lastInteraction: '1 week ago',
                notes: 'Needs pricing details for new feature.',
                crmType: 'HubSpot'
            },
            {
                contactId: 'ct103',
                name: 'Peter Jones',
                company: 'Solutions Co.',
                email: 'p.jones@solutions.com',
                phone: '+1-202-555-0156',
                lastInteraction: '1 month ago',
                notes: 'Scheduled a demo for the 15th.',
                crmType: 'Zoho'
            },
            {
                contactId: 'ct104',
                name: 'Sam Wilson',
                company: 'Global Corp',
                email: 's.wilson@global.com',
                phone: '+1-202-555-0199',
                lastInteraction: '5 hours ago',
                notes: 'Has a critical support ticket open.',
                crmType: 'Salesforce'
            },
            {
                contactId: 'ct105',
                name: 'New Lead',
                company: 'Prospect Ltd',
                email: 'contact@prospect.com',
                phone: '+1-202-555-0144',
                lastInteraction: 'N/A',
                notes: 'First time caller.',
                crmType: 'HubSpot'
            }
        ];
        
        for (const contactData of sampleContacts) {
            const existingContact = await Contact.findOne({ contactId: contactData.contactId });
            if (!existingContact) {
                const contact = new Contact({
                    ...contactData,
                    organizationId: defaultOrg._id
                });
                await contact.save();
            }
        }
        console.log('Sample contacts created');
        
        // Get agent IDs for sample calls
        const agents = await Agent.findAll();
        
        // Create sample calls
        const dispositions = ["Sale Made", "Follow-up Required", "Resolved Issue", "Lead Generated", "Technical Support", "Billing Inquiry", "Information Requested", "Not Interested", "No Answer", "Wrong Number"];
        
        for (let i = 0; i < 50; i++) {
            const agent = agents[i % agents.length];
            const contactId = `ct${101 + (i % 5)}`;
            const duration = Math.floor(Math.random() * 500) + 30;
            const timestamp = new Date(Date.now() - (i * 3 * 60 * 60 * 1000 + Math.random() * 1000 * 60 * 60));
            const status = Math.random() > 0.1 ? 'ended' : 'missed';
            const direction = Math.random() > 0.5 ? 'inbound' : 'outbound';
            const disposition = status === 'ended' ? dispositions[Math.floor(Math.random() * dispositions.length)] : null;
            
            const call = new Call({
                phoneNumber: `+1-202-555-${String(1000 + i).padStart(4, '0')}`,
                agentId: agent._id,
                direction,
                status,
                duration: status === 'ended' ? duration : 0,
                recordingUrl: status === 'ended' ? `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3` : null,
                screenRecordingUrl: status === 'ended' ? 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : null,
                contactId,
                disposition,
                organizationId: defaultOrg._id,
                createdAt: timestamp
            });
            await call.save();
        }
        console.log('Sample calls created');
        
        console.log('Database initialization completed successfully!');
        console.log('\nDefault login credentials:');
        console.log('Admin: admin@finnese-call.com / admin1234');
        console.log('Agent: alice@finnese-call.com / password123');
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase(); 