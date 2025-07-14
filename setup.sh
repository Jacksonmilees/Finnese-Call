#!/bin/bash

echo "🚀 Setting up FinesseCall - AI-Powered Call Center"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file. Please update it with your MongoDB URI."
    echo "   Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finnese_call"
fi

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install

# Test MongoDB connection
echo "🔍 Testing MongoDB connection..."
node test-connection.js

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd ../frontend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file. Please update it with your API URL."
fi

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install

echo ""
echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB URI"
echo "2. Update frontend/.env with your API URL"
echo "3. Run 'cd backend && node init-db.js' to initialize the database"
echo "4. Start the backend: 'cd backend && npm start'"
echo "5. Start the frontend: 'cd frontend && npm run dev'"
echo ""
echo "🔗 Default login: admin@finnese-call.com / admin1234"
echo "" 