
import React, { useState } from 'react';
import { Agent, DashboardStats, Call, AnalyticsData, CrmContact, LeaderboardEntry } from '../../types/index';
import { SlidersHorizontal, BarChart2, Award, FileText, Shield, Headset, Phone } from 'lucide-react';
import OperationalView from './OperationalView';
import AnalyticsView from './AnalyticsView';
import LeaderboardView from './LeaderboardView';
import ReportsView from './ReportsView';
import AuditLogView from './AuditLogView';
import CallMonitoringPanel from './CallMonitoringPanel';
import AfricaTalkingTest from './AfricaTalkingTest';

interface AdminDashboardProps {
  stats: DashboardStats;
  agents: Agent[];
  calls: Call[];
  contacts: CrmContact[];
  analyticsData: AnalyticsData;
  leaderboardData: LeaderboardEntry[];
  onDeleteRequest: (item: Agent | CrmContact) => void;
  onEditAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditContact: (contact: CrmContact) => void;
  onCreateContact: () => void;
  onPlayRecording: (call: Call) => void;
  onMonitorCall: (call: Call) => void;
  isConnected: boolean;
  // New props for additional functionality
  downloadCallsReport: (format: 'csv' | 'pdf') => Promise<void>;
  getAuditLog: () => Promise<any[]>;
  startCallMonitoring: (callId: string) => Promise<void>;
  stopCallMonitoring: (callId: string) => Promise<void>;
}

type AdminTab = 'operational' | 'analytics' | 'leaderboard' | 'reports' | 'audit' | 'monitoring' | 'testing';

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('operational');
  const [monitoringCall, setMonitoringCall] = useState<Call | null>(null);

  const handleMonitorCall = (call: Call) => {
    setMonitoringCall(call);
  };

  const handleCloseMonitoring = () => {
    setMonitoringCall(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('operational')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'operational'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Operational</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart2 className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Award className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Shield className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Audit Log</span>
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Headset className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Monitoring</span>
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'testing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Phone className="-ml-0.5 mr-2 h-5 w-5" />
              <span>Testing</span>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'operational' && <OperationalView {...props} />}
      {activeTab === 'analytics' && <AnalyticsView analyticsData={props.analyticsData} />}
      {activeTab === 'leaderboard' && <LeaderboardView leaderboardData={props.leaderboardData} />}
      {activeTab === 'reports' && <ReportsView downloadCallsReport={props.downloadCallsReport} />}
      {activeTab === 'audit' && <AuditLogView getAuditLog={props.getAuditLog} />}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900">Call Monitoring</h3>
            <p className="text-sm text-slate-500 mt-1">Monitor active calls in real-time</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {props.calls.filter(call => call.status === 'connected').map(call => (
              <div key={call.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{call.phoneNumber}</h4>
                    <p className="text-sm text-slate-500">
                      {call.participants.map(p => p.agentName).join(', ')}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Live
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</p>
                  <p>Direction: {call.direction}</p>
                </div>
                
                <button
                  onClick={() => handleMonitorCall(call)}
                  className="mt-4 w-full px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Headset className="h-4 w-4" />
                  <span>Monitor Call</span>
                </button>
              </div>
            ))}
            
            {props.calls.filter(call => call.status === 'connected').length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                <Headset className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-800">No Active Calls</h3>
                <p className="text-sm text-slate-500">Live calls will appear here for monitoring.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'testing' && <AfricaTalkingTest />}

      {/* Call Monitoring Modal */}
      {monitoringCall && (
        <CallMonitoringPanel
          call={monitoringCall}
          onClose={handleCloseMonitoring}
          onStartMonitoring={props.startCallMonitoring}
          onStopMonitoring={props.stopCallMonitoring}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
