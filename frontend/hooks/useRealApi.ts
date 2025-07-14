import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, Call, CrmContact, AgentStatus, CrmContext, AuthenticatedUser, PersonalStats, CallStatus, AnalyticsData, LeaderboardEntry, DashboardStats } from '../types/index';
import apiService from '../services/api';

const useRealApi = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [calls, setCalls] = useState<Call[]>([]);
    const [contacts, setContacts] = useState<CrmContact[]>([]);
    const [stats, setStats] = useState<DashboardStats>({ totalCalls: 0, totalAgents: 0, availableAgents: 0, avgCallDuration: 0, recordedCalls: 0 });
    const [personalStats, setPersonalStats] = useState<PersonalStats>({ totalCalls: 0, avgCallDuration: 0, totalTalkTime: 0, outboundCalls: 0, inboundCalls: 0 });
    const [isConnected, setIsConnected] = useState<boolean>(false);
    
    const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser>(null);
    const [contextForCrm, setContextForCrm] = useState<Omit<CrmContext, 'contact'> | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            if (!currentUser) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const [agentsRes, callsRes, statsRes, contactsRes] = await Promise.all([
                    apiService.getAgents(),
                    apiService.getRecentCalls(),
                    apiService.getDashboardStats(),
                    apiService.getContacts()
                ]);
                
                setAgents(agentsRes.data);
                setCalls(callsRes.data);
                setStats(statsRes.data);
                setContacts(contactsRes.data);
                
                // Get personal stats for agents
                if (currentUser.role === 'agent') {
                    try {
                        const personalStatsRes = await apiService.getPersonalStats();
                        setPersonalStats(personalStatsRes.data);
                    } catch (err) {
                        console.error('Failed to load personal stats:', err);
                        // Fallback to calculated stats
                        const userCalls = callsRes.data.filter(c => 
                            c.participants?.some(p => p.agentId === currentUser.id)
                        );
                        
                        const personalStats: PersonalStats = {
                            totalCalls: userCalls.length,
                            avgCallDuration: userCalls.length > 0 
                                ? userCalls.reduce((sum, c) => sum + c.duration, 0) / userCalls.length 
                                : 0,
                            totalTalkTime: userCalls.reduce((sum, c) => sum + c.duration, 0),
                            outboundCalls: userCalls.filter(c => c.direction === 'outbound').length,
                            inboundCalls: userCalls.filter(c => c.direction === 'inbound').length,
                        };
                        setPersonalStats(personalStats);
                    }
                }
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Failed to load initial data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
    }, [currentUser]);

    // WebSocket connection
    useEffect(() => {
        if (!currentUser) {
            apiService.disconnectWebSocket();
            return;
        }

        const handleWebSocketMessage = (data: any) => {
            switch (data.type) {
                case 'call_update':
                    // Update call in the list
                    setCalls(prev => prev.map(c => 
                        c.id === data.callId ? { ...c, ...data.call } : c
                    ));
                    break;
                case 'agent_status_update':
                    setAgents(prev => prev.map(a => 
                        a.id === data.agentId ? { ...a, status: data.status } : a
                    ));
                    break;
                case 'new_call':
                    setCalls(prev => [data.call, ...prev]);
                    break;
                case 'call_ended':
                    setCalls(prev => prev.map(c => 
                        c.id === data.callId ? { ...c, status: 'ended', duration: data.duration } : c
                    ));
                    break;
            }
        };

        apiService.connectWebSocket(handleWebSocketMessage);
        setIsConnected(true);

        return () => {
            apiService.disconnectWebSocket();
            setIsConnected(false);
        };
    }, [currentUser]);

    const updateAgentStatus = useCallback(async (agentId: number | null, status: AgentStatus) => {
        if (!agentId) return;
        
        try {
            await apiService.updateAgentStatus(agentId, status);
            setAgents(prev => prev.map(agent => 
                agent.id === agentId ? { ...agent, status } : agent
            ));
        } catch (err) {
            console.error('Failed to update agent status:', err);
        }
    }, []);

    const makeCall = useCallback(async (phoneNumber: string) => {
        if (!currentUser || currentUser.role !== 'agent') return;
        
        try {
            await apiService.makeCall(phoneNumber, currentUser.id);
            // The call will be added via WebSocket
        } catch (err) {
            console.error('Failed to make call:', err);
        }
    }, [currentUser]);

    const acceptCall = useCallback((callId: string) => {
        setCalls(prev => prev.map(c => 
            c.id === callId ? { ...c, status: 'connected' } : c
        ));
    }, []);

    const endCall = useCallback(async (callId: string, status: CallStatus = 'ended') => {
        try {
            await apiService.updateCall(callId, { status });
            setCalls(prev => prev.map(c => 
                c.id === callId ? { ...c, status } : c
            ));
            
            // Update agent status if call ended
            if (status === 'ended' || status === 'missed') {
                const call = calls.find(c => c.id === callId);
                if (call) {
                    call.participants.forEach(p => updateAgentStatus(p.agentId, 'available'));
                }
            }
        } catch (err) {
            console.error('Failed to end call:', err);
        }
    }, [calls, updateAgentStatus]);

    const declineCall = useCallback((callId: string) => {
        endCall(callId, 'missed');
    }, [endCall]);

    const closeCrmModal = useCallback(async (callId: string, disposition: string, notes: string) => {
        try {
            await apiService.updateCall(callId, { disposition, notes });
            setCalls(prev => prev.map(c => 
                c.id === callId ? { ...c, disposition, notes } : c
            ));
            setIsCrmModalOpen(false);
            setContextForCrm(null);
        } catch (err) {
            console.error('Failed to update call disposition:', err);
        }
    }, []);

    const createAgent = useCallback(async (agentData: Omit<Agent, 'id' | 'status' | 'avatarUrl'>) => {
        try {
            const response = await apiService.createAgent(agentData);
            setAgents(prev => [...prev, response.agent]);
        } catch (err) {
            console.error('Failed to create agent:', err);
            throw err;
        }
    }, []);

    const updateAgent = useCallback(async (agentId: number, updatedData: Partial<Agent>) => {
        try {
            const response = await apiService.updateAgent(agentId, updatedData);
            setAgents(prev => prev.map(agent => 
                agent.id === agentId ? response.agent : agent
            ));
        } catch (err) {
            console.error('Failed to update agent:', err);
            throw err;
        }
    }, []);

    const deleteAgent = useCallback(async (agentId: number) => {
        try {
            await apiService.deleteAgent(agentId);
            setAgents(prev => prev.filter(agent => agent.id !== agentId));
        } catch (err) {
            console.error('Failed to delete agent:', err);
            throw err;
        }
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await apiService.login(email, password);
            setCurrentUser(response.user);
            return true;
        } catch (err) {
            console.error('Login failed:', err);
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setCurrentUser(null);
            setIsCrmModalOpen(false);
            setContextForCrm(null);
            setAgents([]);
            setCalls([]);
            setContacts([]);
            setStats({ totalCalls: 0, totalAgents: 0, availableAgents: 0, avgCallDuration: 0, recordedCalls: 0 });
            setPersonalStats({ totalCalls: 0, avgCallDuration: 0, totalTalkTime: 0, outboundCalls: 0, inboundCalls: 0 });
        }
    }, []);

    const getAnalyticsData = useCallback(async (): Promise<AnalyticsData> => {
        try {
            const [callsPerDay, leaderboard] = await Promise.all([
                apiService.getCallsPerDay(),
                apiService.getAgentLeaderboard()
            ]);
            
            return {
                callVolume: callsPerDay.data.map(item => ({ name: item.date, calls: item.count })),
                agentPerformance: leaderboard.data.map(item => ({ name: item.agentName, calls: item.totalCalls })),
                dispositionBreakdown: [] // TODO: Implement disposition breakdown
            };
        } catch (err) {
            console.error('Failed to get analytics data:', err);
            return { callVolume: [], agentPerformance: [], dispositionBreakdown: [] };
        }
    }, []);

    const getLeaderboardData = useCallback(async (): Promise<LeaderboardEntry[]> => {
        try {
            const response = await apiService.getAgentLeaderboard();
            return response.data || [];
        } catch (err) {
            console.error('Failed to get leaderboard data:', err);
            return [];
        }
    }, []);

    // Check if user is already logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            const token = apiService.getToken();
            if (token) {
                try {
                    const response = await apiService.getCurrentUser();
                    setCurrentUser(response.user);
                } catch (err) {
                    console.error('Token validation failed:', err);
                    apiService.clearToken();
                }
            }
        };
        
        checkAuth();
    }, []);

    const activeUserCall = currentUser ? calls.find(c => 
        c.participants?.some(p => p.agentId === currentUser.id) && 
        c.status !== 'ended' && c.status !== 'missed'
    ) : null;

    const activeUserCrmContext: CrmContext | null = contextForCrm ? { 
        ...contextForCrm, 
        contact: contacts.find(con => con.id === contextForCrm.call.contactId) || null 
    } : (activeUserCall ? { 
        callId: activeUserCall.id, 
        call: activeUserCall, 
        contact: contacts.find(con => con.id === activeUserCall.contactId) || null 
    } : null);

    const createContact = useCallback(async (contactData: Omit<CrmContact, 'id' | 'lastInteraction'>) => {
        try {
            const response = await apiService.createContact(contactData);
            setContacts(prev => [response.contact, ...prev]);
        } catch (err) {
            console.error('Failed to create contact:', err);
            throw err;
        }
    }, []);

    const updateContact = useCallback(async (contactId: string, updatedData: Partial<CrmContact>) => {
        try {
            const response = await apiService.updateContact(contactId, updatedData);
            setContacts(prev => prev.map(contact => 
                contact.id === contactId ? response.contact : contact
            ));
        } catch (err) {
            console.error('Failed to update contact:', err);
            throw err;
        }
    }, []);

    const deleteContact = useCallback(async (contactId: string) => {
        try {
            await apiService.deleteContact(contactId);
            setContacts(prev => prev.filter(contact => contact.id !== contactId));
        } catch (err) {
            console.error('Failed to delete contact:', err);
            throw err;
        }
    }, []);

    // Call Transfer & Conference functions
    const transferCall = useCallback(async (callId: string, targetAgentId: number) => {
        try {
            await apiService.transferCall(callId, targetAgentId);
            // Update call in the list
            setCalls(prev => prev.map(c => 
                c.id === callId ? { ...c, participants: [{ agentId: targetAgentId, agentName: 'Transferred' }] } : c
            ));
        } catch (err) {
            console.error('Failed to transfer call:', err);
            throw err;
        }
    }, []);

    const addToConference = useCallback(async (callId: string, agentId: number) => {
        try {
            await apiService.addToConference(callId, agentId);
            // Update call in the list
            setCalls(prev => prev.map(c => 
                c.id === callId ? { ...c, participants: [...c.participants, { agentId, agentName: 'Conference Agent' }] } : c
            ));
        } catch (err) {
            console.error('Failed to add to conference:', err);
            throw err;
        }
    }, []);

    // Call Monitoring functions (admin only)
    const startCallMonitoring = useCallback(async (callId: string) => {
        try {
            await apiService.startCallMonitoring(callId);
        } catch (err) {
            console.error('Failed to start call monitoring:', err);
            throw err;
        }
    }, []);

    const stopCallMonitoring = useCallback(async (callId: string) => {
        try {
            await apiService.stopCallMonitoring(callId);
        } catch (err) {
            console.error('Failed to stop call monitoring:', err);
            throw err;
        }
    }, []);

    // Organizations functions (admin only)
    const getOrganizations = useCallback(async () => {
        try {
            const response = await apiService.getOrganizations();
            return response.data;
        } catch (err) {
            console.error('Failed to get organizations:', err);
            return [];
        }
    }, []);

    const createOrganization = useCallback(async (name: string) => {
        try {
            const response = await apiService.createOrganization(name);
            return response.organization;
        } catch (err) {
            console.error('Failed to create organization:', err);
            throw err;
        }
    }, []);

    // Audit Log function
    const getAuditLog = useCallback(async () => {
        try {
            const response = await apiService.getAuditLog();
            return response.data;
        } catch (err) {
            console.error('Failed to get audit log:', err);
            return [];
        }
    }, []);

    // Notifications functions
    const getNotifications = useCallback(async () => {
        try {
            const response = await apiService.getNotifications();
            return response.data;
        } catch (err) {
            console.error('Failed to get notifications:', err);
            return [];
        }
    }, []);

    const createNotification = useCallback(async (notification: any) => {
        try {
            await apiService.createNotification(notification);
        } catch (err) {
            console.error('Failed to create notification:', err);
            throw err;
        }
    }, []);

    // Reports functions
    const downloadCallsReport = useCallback(async (format: 'csv' | 'pdf') => {
        try {
            const blob = await apiService.downloadCallsReport(format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calls-report.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download report:', err);
            throw err;
        }
    }, []);

    // Wallboard function
    const getWallboardData = useCallback(async () => {
        try {
            const response = await apiService.getWallboardData();
            return response.data;
        } catch (err) {
            console.error('Failed to get wallboard data:', err);
            return null;
        }
    }, []);

    // Ringtones functions
    const uploadRingtone = useCallback(async (file: File, type: string) => {
        try {
            await apiService.uploadRingtone(file, type);
        } catch (err) {
            console.error('Failed to upload ringtone:', err);
            throw err;
        }
    }, []);

    const getRingtones = useCallback(async () => {
        try {
            const response = await apiService.getRingtones();
            return response.data;
        } catch (err) {
            console.error('Failed to get ringtones:', err);
            return [];
        }
    }, []);

    // Language settings functions
    const getLanguageSettings = useCallback(async () => {
        try {
            const response = await apiService.getLanguageSettings();
            return response.data;
        } catch (err) {
            console.error('Failed to get language settings:', err);
            return null;
        }
    }, []);

    const updateLanguageSettings = useCallback(async (settings: any) => {
        try {
            await apiService.updateLanguageSettings(settings);
        } catch (err) {
            console.error('Failed to update language settings:', err);
            throw err;
        }
    }, []);

    // Queue stats function
    const getQueueStats = useCallback(async () => {
        try {
            const response = await apiService.getQueueStats();
            return response.data;
        } catch (err) {
            console.error('Failed to get queue stats:', err);
            return [];
        }
    }, []);

    // Disposition breakdown function
    const getDispositionBreakdown = useCallback(async () => {
        try {
            const response = await apiService.getDispositionBreakdown();
            return response.data;
        } catch (err) {
            console.error('Failed to get disposition breakdown:', err);
            return [];
        }
    }, []);

    return {
        stats,
        agents,
        calls,
        contacts,
        isConnected,
        isCrmModalOpen,
        activeUserCall,
        activeUserCrmContext,
        currentUser,
        personalStats,
        loading,
        error,
        getAnalyticsData,
        getLeaderboardData,
        login,
        logout,
        makeCall,
        updateAgentStatus,
        closeCrmModal,
        endCall,
        acceptCall,
        declineCall,
        createAgent,
        updateAgent,
        deleteAgent,
        createContact,
        updateContact,
        deleteContact,
        transferCall,
        addToConference,
        startCallMonitoring,
        stopCallMonitoring,
        getOrganizations,
        createOrganization,
        getAuditLog,
        getNotifications,
        createNotification,
        downloadCallsReport,
        getWallboardData,
        uploadRingtone,
        getRingtones,
        getLanguageSettings,
        updateLanguageSettings,
        getQueueStats,
        getDispositionBreakdown,
    };
};

export default useRealApi; 