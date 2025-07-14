
import React, { useState, useEffect } from 'react';
import { PhoneCall, User, LogOut, Shield } from 'lucide-react';
import AdminDashboard from './components/admin/AdminDashboard';
import AgentDashboard from './components/agent/AgentDashboard';
import CrmContextModal from './components/shared/CrmContextModal';
import AgentFormModal from './components/shared/AgentFormModal';
import ContactFormModal from './components/shared/ContactFormModal';
import Login from './components/auth/Login';
import ConfirmationModal from './components/shared/ConfirmationModal';
import Toast from './components/shared/Toast';
import CallManager from './components/shared/CallManager';
import AudioController from './components/shared/AudioController';
import CallPlayerModal from './components/shared/CallPlayerModal';
import CallReceiver from './components/CallReceiver';
import useRealApi from './hooks/useRealApi';
import { Agent, AuthenticatedUser, Call, CrmContact, LeaderboardEntry, AnalyticsData } from './types/index';

const App: React.FC = () => {
  const {
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
    transferCall,
    addToConference,
    createContact,
    updateContact,
    deleteContact,
    startCallMonitoring,
    stopCallMonitoring,
    getAuditLog,
    downloadCallsReport,
  } = useRealApi();

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | undefined>(undefined);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<CrmContact | undefined>(undefined);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Agent | CrmContact | null>(null);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [callToPlay, setCallToPlay] = useState<Call | null>(null);
  
  const [callToMonitor, setCallToMonitor] = useState<Call | null>(null);
  
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Agent Modal Handlers
  const handleOpenCreateAgentModal = () => {
    setAgentToEdit(undefined);
    setIsAgentModalOpen(true);
  };
  const handleOpenEditAgentModal = (agent: Agent) => {
    setAgentToEdit(agent);
    setIsAgentModalOpen(true);
  };
  const handleCloseAgentModal = () => {
      setIsAgentModalOpen(false);
      setAgentToEdit(undefined);
  };
  
  // Contact Modal Handlers
  const handleOpenCreateContactModal = () => {
    setContactToEdit(undefined);
    setIsContactModalOpen(true);
  };
  const handleOpenEditContactModal = (contact: CrmContact) => {
    setContactToEdit(contact);
    setIsContactModalOpen(true);
  };
  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setContactToEdit(undefined);
  };

  // Generic Delete Handlers
  const handleRequestDelete = (item: Agent | CrmContact) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if ('extension' in itemToDelete) { // It's an Agent
        deleteAgent(itemToDelete.id);
        showToast(`Agent ${itemToDelete.name} has been deleted.`, 'success');
      } else { // It's a Contact
        deleteContact(itemToDelete.id);
        showToast(`Contact ${itemToDelete.name} has been deleted.`, 'success');
      }
    }
    setItemToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleSaveAgent = (agentData: Omit<Agent, 'id' | 'status' | 'avatarUrl'> & { id?: number }) => {
    const isEditing = !!agentData.id;
    if (isEditing) {
      const existingAgent = agents.find(a => a.id === agentData.id);
      if(existingAgent) {
        updateAgent(agentData.id, {...existingAgent, ...agentData});
        showToast(`Agent ${existingAgent.name}'s details updated.`, 'success');
      }
    } else {
      createAgent(agentData);
      showToast(`Agent ${agentData.name} created successfully.`, 'success');
    }
    handleCloseAgentModal();
  };

  const handleSaveContact = (contactData: Omit<CrmContact, 'id' | 'lastInteraction'> & { id?: string }) => {
     if (contactData.id) {
       updateContact(contactData.id, contactData);
       showToast(`Contact ${contactData.name} updated.`, 'success');
     } else {
       createContact(contactData);
       showToast(`Contact ${contactData.name} created.`, 'success');
     }
     handleCloseContactModal();
  };
  
  const handlePlayRecording = (call: Call) => {
    setCallToPlay(call);
    setIsPlayerOpen(true);
  };

  const handleMonitorCall = (call: Call) => {
    setCallToMonitor(call);
  };

  const handleStopMonitoring = () => {
    setCallToMonitor(null);
  };

  const handleAnswerCall = (callId: string) => {
    // Handle answering a call
    showToast('Call answered', 'success');
  };

  const handleRejectCall = (callId: string) => {
    // Handle rejecting a call
    showToast('Call rejected', 'success');
  };

  if (!currentUser) {
    return <Login onLogin={login} />;
  }
  
  const RoleIcon = currentUser.role === 'admin' ? Shield : User;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  // Fetch analytics data for admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchData = async () => {
        try {
          const [analytics, leaderboard] = await Promise.all([
            getAnalyticsData(),
            getLeaderboardData()
          ]);
          setAnalyticsData(analytics);
          setLeaderboardData(leaderboard);
        } catch (error) {
          console.error('Failed to fetch analytics data:', error);
          // Set default empty data to prevent errors
          setAnalyticsData({
            callVolume: [],
            agentPerformance: [],
            dispositionBreakdown: []
          });
          setLeaderboardData([]);
        }
      };
      fetchData();
    }
  }, [currentUser?.role, getAnalyticsData, getLeaderboardData]);
  
  const contactForCallManager = (call: Call | null): CrmContact | null => {
      if(!call) return null;
      return contacts.find(c => c.id === call.contactId) || null;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <AudioController activeCall={activeUserCall} />
      <CallReceiver onAnswerCall={handleAnswerCall} onRejectCall={handleRejectCall} />
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <PhoneCall className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">FinesseCall</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RoleIcon className="h-5 w-5 text-slate-500" />
                <span className="font-medium text-slate-700">{currentUser.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentUser.role === 'admin' ? (
            analyticsData ? (
              <AdminDashboard
                stats={stats}
                agents={agents}
                calls={calls}
                contacts={contacts}
                analyticsData={analyticsData}
                leaderboardData={leaderboardData}
                onDeleteRequest={handleRequestDelete}
                onEditAgent={handleOpenEditAgentModal}
                onCreateAgent={handleOpenCreateAgentModal}
                onEditContact={handleOpenEditContactModal}
                onCreateContact={handleOpenCreateContactModal}
                onPlayRecording={handlePlayRecording}
                onMonitorCall={handleMonitorCall}
                isConnected={isConnected}
                downloadCallsReport={downloadCallsReport}
                getAuditLog={getAuditLog}
                startCallMonitoring={startCallMonitoring}
                stopCallMonitoring={stopCallMonitoring}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading analytics data...</p>
                </div>
              </div>
            )
          ) : (
            <AgentDashboard
              stats={personalStats}
              agents={agents}
              calls={calls.filter(c => c.participants.some(p => p.agentId === currentUser.id))}
              makeCall={makeCall}
              updateAgentStatus={(id, status) => {
                  updateAgentStatus(id, status);
                  showToast(`Your status has been updated to ${status}.`, 'success');
              }}
              isConnected={isConnected}
              currentUser={currentUser as Extract<AuthenticatedUser, { role: 'agent' }>}
              activeUserCall={activeUserCall}
            />
          )}
        </div>
      </main>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {isAgentModalOpen && (
        <AgentFormModal
          isOpen={isAgentModalOpen}
          onClose={handleCloseAgentModal}
          onSave={handleSaveAgent}
          agentToEdit={agentToEdit}
        />
      )}
      
      {isContactModalOpen && (
          <ContactFormModal
              isOpen={isContactModalOpen}
              onClose={handleCloseContactModal}
              onSave={handleSaveContact}
              contactToEdit={contactToEdit}
          />
      )}
      
      {isDeleteConfirmOpen && itemToDelete && (
          <ConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title={`Delete ${'extension' in itemToDelete ? 'Agent' : 'Contact'}`}
            message={`Are you sure you want to delete ${itemToDelete.name}? This action cannot be undone.`}
          />
      )}
      
      {activeUserCall && currentUser.role === 'agent' && (
          <CallManager 
            call={activeUserCall} 
            contact={contactForCallManager(activeUserCall)}
            onEndCall={endCall}
            onAcceptCall={acceptCall}
            onDeclineCall={declineCall}
            onTransferCall={transferCall}
            onAddToConference={addToConference}
            agents={agents}
            currentUser={currentUser as Extract<AuthenticatedUser, { role: 'agent' }>}
          />
      )}

      {callToMonitor && (
         <CallManager 
            call={callToMonitor} 
            contact={contactForCallManager(callToMonitor)}
            isMonitoring={true}
            onCloseMonitor={handleStopMonitoring}
          />
      )}

      {isCrmModalOpen && activeUserCrmContext && (
        <CrmContextModal
          context={{...activeUserCrmContext, contact: contactForCallManager(activeUserCrmContext.call)}}
          onClose={closeCrmModal}
        />
      )}

      {isPlayerOpen && callToPlay && (
          <CallPlayerModal
            isOpen={isPlayerOpen}
            onClose={() => setIsPlayerOpen(false)}
            call={callToPlay}
          />
      )}
    </div>
  );
};

export default App;
