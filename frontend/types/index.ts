
export type AgentStatus = 'available' | 'busy' | 'away' | 'offline';
export type ActiveTab = 'dashboard' | 'calls' | 'agents' | 'settings';
export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'ringing-inbound' | 'ringing-outbound' | 'connected' | 'missed' | 'ended';
export type UserRole = 'admin' | 'agent';

export interface Agent {
  id: number;
  name: string;
  extension: string;
  status: AgentStatus;
  avatarUrl: string;
  sipUsername: string;
  sipPassword: string;
}

export type AuthenticatedUser = (Agent & { role: 'agent' }) | { role: 'admin'; name: 'Admin'; id: 'admin' } | null;

export interface CallParticipant {
  agentId: number;
  agentName: string;
}

export interface Call {
  id: string;
  phoneNumber: string;
  participants: CallParticipant[];
  direction: CallDirection;
  status: CallStatus;
  duration: number; // in seconds
  timestamp: Date;
  recordingUrl?: string;
  screenRecordingUrl?: string;
  contactId: string;
  disposition?: string;
  transcript?: string;
  liveTranscript?: string;
  notes?: string;
}

export interface DashboardStats {
  totalCalls: number;
  totalAgents: number;
  availableAgents: number;
  avgCallDuration: number;
  recordedCalls: number;
}

export interface PersonalStats {
    totalCalls: number;
    avgCallDuration: number;
    totalTalkTime: number;
    outboundCalls: number;
    inboundCalls: number;
}


export interface CrmContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  lastInteraction: string;
  notes: string;
  crmType: 'Salesforce' | 'HubSpot' | 'Zoho';
}

export interface CrmContext {
    callId: string;
    contact: CrmContact | null;
    call: Call;
}

export interface AnalyticsData {
  callVolume: { name: string; calls: number }[];
  agentPerformance: { name:string; calls: number }[];
  dispositionBreakdown: { name: string; value: number }[];
}

export interface AgentAssistResult {
    sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
    suggestion: string;
}

export interface LeaderboardEntry {
    agentId: number;
    agentName: string;
    avatarUrl: string;
    score: number;
    totalCalls: number;
    totalTalkTime: number;
    positiveOutcomes: number;
}
