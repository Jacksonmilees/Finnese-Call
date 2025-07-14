import { Agent, Call, CrmContact, AgentStatus, CrmContext, AuthenticatedUser, PersonalStats, CallStatus, AnalyticsData, LeaderboardEntry, DashboardStats } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;
  private ws: WebSocket | null = null;

  // Authentication
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized');
      }
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: AuthenticatedUser }> {
    const response = await this.request<{ token: string; user: AuthenticatedUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<{ user: AuthenticatedUser }> {
    return this.request<{ user: AuthenticatedUser }>('/auth/me');
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // Agents endpoints
  async getAgents(): Promise<{ data: Agent[] }> {
    return this.request<{ data: Agent[] }>('/agents');
  }

  async createAgent(agentData: Omit<Agent, 'id' | 'status' | 'avatarUrl'>): Promise<{ agent: Agent }> {
    return this.request<{ agent: Agent }>('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(id: number, agentData: Partial<Agent>): Promise<{ agent: Agent }> {
    return this.request<{ agent: Agent }>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  async deleteAgent(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAgentStatus(agentId: number, status: AgentStatus): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/agent/status', {
      method: 'POST',
      body: JSON.stringify({ agentId, status }),
    });
  }

  // Calls endpoints
  async getRecentCalls(): Promise<{ data: Call[] }> {
    return this.request<{ data: Call[] }>('/calls/recent');
  }

  async searchCalls(params: {
    phone?: string;
    agentId?: number;
    from?: string;
    to?: string;
  }): Promise<{ data: Call[] }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    return this.request<{ data: Call[] }>(`/calls/search?${searchParams}`);
  }

  async makeCall(to: string, agentId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/call/make', {
      method: 'POST',
      body: JSON.stringify({ to, agentId }),
    });
  }

  async updateCall(id: string, updates: Partial<Call>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async tagCall(id: string, tag: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${id}/tag`, {
      method: 'PUT',
      body: JSON.stringify({ tag }),
    });
  }

  async addCallNotes(id: string, notes: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  async scheduleCallback(id: string, callbackTime: string, status: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${id}/callback`, {
      method: 'PUT',
      body: JSON.stringify({ callback_time: callbackTime, callback_status: status }),
    });
  }

  // Stats endpoints
  async getDashboardStats(): Promise<{ data: DashboardStats }> {
    return this.request<{ data: DashboardStats }>('/stats/dashboard');
  }

  async getPersonalStats(): Promise<{ data: PersonalStats }> {
    return this.request<{ data: PersonalStats }>('/agent/personal-stats');
  }

  // Analytics endpoints
  async getCallsPerDay(): Promise<{ data: { date: string; count: number }[] }> {
    return this.request<{ data: { date: string; count: number }[] }>('/analytics/calls-per-day');
  }

  async getAgentLeaderboard(): Promise<{ data: LeaderboardEntry[] }> {
    return this.request<{ data: LeaderboardEntry[] }>('/analytics/agent-leaderboard');
  }

  // CRM endpoints
  async clickToCall(data: any): Promise<any> {
    return this.request('/crm/click-to-call', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contacts endpoints
  async getContacts(): Promise<{ data: CrmContact[] }> {
    return this.request<{ data: CrmContact[] }>('/contacts');
  }

  async createContact(contactData: Omit<CrmContact, 'id' | 'lastInteraction'>): Promise<{ contact: CrmContact }> {
    return this.request<{ contact: CrmContact }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id: string, contactData: Partial<CrmContact>): Promise<{ contact: CrmContact }> {
    return this.request<{ contact: CrmContact }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Call Transfer & Conference endpoints
  async transferCall(callId: string, targetAgentId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${callId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ targetAgentId }),
    });
  }

  async addToConference(callId: string, agentId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${callId}/conference`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  }

  // Call Monitoring endpoints (admin only)
  async startCallMonitoring(callId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${callId}/monitor`, {
      method: 'POST',
    });
  }

  async stopCallMonitoring(callId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/calls/${callId}/stop-monitor`, {
      method: 'POST',
    });
  }

  // Organizations endpoints (admin only)
  async getOrganizations(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/organizations');
  }

  async createOrganization(name: string): Promise<{ organization: any }> {
    return this.request<{ organization: any }>('/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Audit Log endpoint
  async getAuditLog(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/audit-log');
  }

  // Notifications endpoints
  async getNotifications(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/notifications');
  }

  async createNotification(notification: any): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  // Reports endpoints
  async downloadCallsReport(format: 'csv' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/calls.${format}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    
    return response.blob();
  }

  // Wallboard endpoint
  async getWallboardData(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/wallboard');
  }

  // Ringtones endpoints
  async uploadRingtone(file: File, type: string): Promise<{ success: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/ringtones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload ringtone');
    }
    
    return response.json();
  }

  async getRingtones(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/ringtones');
  }

  // Language settings endpoints
  async getLanguageSettings(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/language');
  }

  async updateLanguageSettings(settings: any): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/language', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // Queue stats endpoint
  async getQueueStats(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/analytics/queue-stats');
  }

  // Disposition breakdown endpoint
  async getDispositionBreakdown(): Promise<{ data: { name: string; value: number }[] }> {
    return this.request<{ data: { name: string; value: number }[] }>('/analytics/disposition-breakdown');
  }

  // Africa's Talking endpoints
  async getATStatus(): Promise<{ status: any }> {
    return this.request<{ status: any }>('/at/status');
  }

  async testATCall(to: string): Promise<any> {
    return this.request<any>('/at/test-call', {
      method: 'POST',
      body: JSON.stringify({ to }),
    });
  }

  async testATInboundCall(callerNumber: string): Promise<any> {
    return this.request<any>('/at/test-inbound', {
      method: 'POST',
      body: JSON.stringify({ callerNumber }),
    });
  }

  async getIncomingCalls(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/calls/incoming');
  }

  // Recording endpoints
  getRecordingUrl(callId: string): string {
    return `${API_BASE_URL}/recording/${callId}`;
  }

  // WebSocket connection
  connectWebSocket(onMessage: (data: any) => void): void {
    const token = this.getToken();
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(onMessage), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Send WebSocket message
  sendWebSocketMessage(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }
}

export const apiService = new ApiService();
export default apiService; 