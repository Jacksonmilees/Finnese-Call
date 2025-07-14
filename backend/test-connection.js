require('dotenv').config();
const { connectDB } = require('./db');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
        
        await connectDB();
        console.log('✅ MongoDB connection successful!');
        
        // Test basic operations
        const mongoose = require('mongoose');
        const db = mongoose.connection;
        
        console.log('Database name:', db.name);
        console.log('Collections:', Object.keys(db.collections));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

testConnection(); 