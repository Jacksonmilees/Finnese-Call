# FinesseCall - AI-Powered Call Center

A modern call center application with real-time call management, agent dashboard, and CRM integration.

## Features

- **Real-time Call Management**: Handle inbound and outbound calls with live transcription
- **Agent Dashboard**: Monitor call status, manage availability, and view personal statistics
- **Admin Dashboard**: Comprehensive analytics, agent management, and call monitoring
- **CRM Integration**: Contact management with Salesforce, HubSpot, and Zoho support
- **Call Recording**: Audio and screen recording with playback capabilities
- **WebSocket Support**: Real-time updates for call status and agent presence
- **Multi-tenant**: Organization-based data isolation
- **Analytics**: Call volume, agent performance, and disposition tracking

## Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** database with Mongoose ODM
- **WebSocket** for real-time communication
- **JWT** authentication
- **Africa's Talking** integration for telephony
- **Multer** for file uploads
- **PDFKit** for report generation

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for analytics charts

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** database (local or cloud)
3. **npm** or **yarn**

### Database Setup

1. Set up your MongoDB database (local or cloud)
2. Set up your environment variables in `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb+srv://jackson:Hacker254@cluster0.iqje02m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=your-secret-key-here

# Africa's Talking (optional)
AT_API_KEY=your-at-api-key
AT_USERNAME=your-at-username
CALLER_ID=your-caller-id

# CRM Integration (optional)
CRM_SALESFORCE_TOKEN=your-salesforce-token
CRM_HUBSPOT_TOKEN=your-hubspot-token
CRM_ZOHO_TOKEN=your-zoho-token
CRM_PIPEDRIVE_TOKEN=your-pipedrive-token
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
node init-db.js
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login Credentials

### Admin User
- **Email**: admin@finnese-call.com
- **Password**: admin1234

### Sample Agent Users
- **Alice**: alice@finnese-call.com / password123
- **Bob**: bob@finnese-call.com / password123
- **Charlie**: charlie@finnese-call.com / password123
- **Diana**: diana@finnese-call.com / password123
- **Ethan**: ethan@finnese-call.com / password123
- **Fiona**: fiona@finnese-call.com / password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agent/status` - Update agent status

### Calls
- `GET /api/calls/recent` - Get recent calls
- `GET /api/calls/search` - Search calls with filters
- `POST /api/call/make` - Make outbound call
- `PUT /api/calls/:id` - Update call
- `PUT /api/calls/:id/tag` - Tag call
- `PUT /api/calls/:id/notes` - Add call notes
- `PUT /api/calls/:id/callback` - Schedule callback

### CRM Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Analytics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/analytics/calls-per-day` - Call volume analytics
- `GET /api/analytics/agent-leaderboard` - Agent performance

### Recordings
- `GET /api/recording/:callId` - Download call recording

## WebSocket Events

The application uses WebSocket for real-time updates:

- `call_update` - Call status changes
- `agent_status_update` - Agent status changes
- `new_call` - New incoming call
- `call_ended` - Call ended event

## Project Structure

```
finneseCall/
├── backend/
│   ├── app.js              # Main Express server
│   ├── auth.js             # Authentication middleware
│   ├── db.js               # MongoDB connection
│   ├── models/             # MongoDB schemas
│   │   ├── Organization.js
│   │   ├── Agent.js
│   │   ├── Call.js
│   │   ├── Contact.js
│   │   └── AuditLog.js
│   ├── init-db.js          # Database initialization
│   ├── websocket.js        # WebSocket handling
│   ├── africa-talking-integration.js
│   ├── crm-integration.js
│   └── pbx-integration.js
├── frontend/
│   ├── App.tsx             # Main React component
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── README.md
```

## Development

### Backend Development

The backend is built with Express.js and includes:

- **Authentication**: JWT-based authentication with role-based access
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Real-time**: WebSocket support for live updates
- **File Uploads**: Multer for handling file uploads
- **Reports**: CSV and PDF report generation
- **Telephony**: Africa's Talking integration for call handling

### Frontend Development

The frontend is built with React and includes:

- **TypeScript**: Full type safety
- **Real-time Updates**: WebSocket integration
- **Responsive Design**: Mobile-friendly interface
- **Analytics**: Charts and statistics
- **Call Management**: Real-time call handling

## Deployment

### Backend Deployment

1. Set up a MongoDB database (Atlas recommended for cloud)
2. Configure environment variables
3. Run database initialization
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 