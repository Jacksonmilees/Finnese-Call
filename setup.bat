@echo off
echo 🚀 Setting up FinesseCall - AI-Powered Call Center
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Backend setup
echo.
echo 📦 Setting up backend...
cd backend

REM Copy environment file if it doesn't exist
if not exist .env (
    copy env.example .env
    echo 📝 Created .env file. Please update it with your MongoDB URI.
    echo    Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finnese_call
)

REM Install dependencies
echo 📥 Installing backend dependencies...
call npm install

REM Test MongoDB connection
echo 🔍 Testing MongoDB connection...
node test-connection.js

REM Frontend setup
echo.
echo 📦 Setting up frontend...
cd ..\frontend

REM Copy environment file if it doesn't exist
if not exist .env (
    copy env.example .env
    echo 📝 Created .env file. Please update it with your API URL.
)

REM Install dependencies
echo 📥 Installing frontend dependencies...
call npm install

echo.
echo ✅ Setup completed!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your MongoDB URI
echo 2. Update frontend\.env with your API URL
echo 3. Run 'cd backend ^&^& node init-db.js' to initialize the database
echo 4. Start the backend: 'cd backend ^&^& npm start'
echo 5. Start the frontend: 'cd frontend ^&^& npm run dev'
echo.
echo 🔗 Default login: admin@finnese-call.com / admin1234
echo.
pause 