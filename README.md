# Finnese-call

A modern, full-featured call management system for African businesses, integrating PBX (FreeSWITCH/Asterisk), Africa's Talking, CRM, and a real-time React dashboard.

## Features
- Inbound/outbound call management
- Agent status and queueing
- Call recording and voicemail
- CRM integration (Salesforce, HubSpot, Zoho, Pipedrive)
- Real-time dashboard (React + WebSocket)
- PostgreSQL database with analytics views

## Architecture
- **PBX**: FreeSWITCH/Asterisk (SIP trunking, IVR)
- **Backend**: Node.js/Express, Africa's Talking, CRM, WebSocket
- **Frontend**: React dashboard
- **Database**: PostgreSQL

## Quick Start (Docker Compose)
1. Clone the repo
2. Copy and edit backend/.env.example to backend/.env
3. Run: `docker-compose up --build`
4. Access dashboard at http://localhost:3001

## Manual Setup
- Set up PostgreSQL and run `database/schema.sql`
- Configure PBX and Africa's Talking SIP
- Start backend: `cd backend && npm install && npm start`
- Start frontend: `cd frontend && npm install && npm start`

## API Endpoints
- `/api/agents` - List agents
- `/api/calls/recent` - Recent calls
- `/api/call/make` - Initiate call
- `/api/agent/status` - Update agent status
- `/api/recording/:callId` - Download recording
- `/api/crm/click-to-call` - CRM click-to-call

## Environment Variables
See `backend/.env.example` for all required config.

## License
MIT 