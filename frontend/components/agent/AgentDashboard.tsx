
import React, { useState } from 'react';
import { Agent, PersonalStats, AgentStatus, Call, AuthenticatedUser } from '../../types/index';
import { Phone, Search, PhoneCall, ChevronDown, Check, Coffee, Activity, TrendingUp, TrendingDown, PhoneOutgoing, PhoneIncoming, Clock } from 'lucide-react';
import CallHistory from '../shared/CallHistory';
import AgentAssistPanel from './AgentAssistPanel';
import AgentStatusCard from './AgentStatusCard';
import StatCard from '../shared/StatCard';
import { formatTotalTime } from '../../utils/formatters';

interface AgentDashboardProps {
  stats: PersonalStats;
  agents: Agent[];
  calls: Call[];
  makeCall: (phoneNumber: string) => void;
  updateAgentStatus: (agentId: number, status: AgentStatus) => void;
  isConnected: boolean;
  currentUser: Extract<AuthenticatedUser, { role: 'agent' }>;
  activeUserCall: Call | null;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ stats, agents, calls, makeCall, updateAgentStatus, isConnected, currentUser, activeUserCall }) => {
  const [callNumber, setCallNumber] = useState('');
  const [agentSearchTerm, setAgentSearchTerm] = useState('');

  const handleMakeCall = () => {
    if (callNumber) {
      makeCall(callNumber);
      setCallNumber('');
    }
  };

  const isCurrentUserAvailable = currentUser.status === 'available';

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
    agent.extension.includes(agentSearchTerm)
  );

  return (
    <div className="space-y-8">
        {/* Personal Stats Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Your Daily Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={<PhoneCall className="h-5 w-5 text-blue-600"/>} label="Your Calls Today" value={stats.totalCalls} color="bg-blue-100" isCompact />
            <StatCard icon={<Clock className="h-5 w-5 text-yellow-600"/>} label="Avg. Call Time" value={`${stats.avgCallDuration}s`} color="bg-yellow-100" isCompact />
            <StatCard icon={<Activity className="h-5 w-5 text-indigo-600"/>} label="Total Talk Time" value={formatTotalTime(stats.totalTalkTime)} color="bg-indigo-100" isCompact />
            <StatCard icon={<PhoneOutgoing className="h-5 w-5 text-green-600"/>} label="Outbound Calls" value={stats.outboundCalls} color="bg-green-100" isCompact />
            <StatCard icon={<PhoneIncoming className="h-5 w-5 text-purple-600"/>} label="Inbound Calls" value={stats.inboundCalls} color="bg-purple-100" isCompact />
        </div>
      </div>


      {/* Top Row: Quick Actions and Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 space-y-4">
            <div>
                <h3 className="text-xl font-bold text-slate-900">Your Status</h3>
                <p className="text-sm text-slate-500 mt-1">Set your current availability.</p>
                <div className="mt-4">
                    <select
                        value={currentUser.status}
                        onChange={(e) => updateAgentStatus(currentUser.id, e.target.value as AgentStatus)}
                        disabled={currentUser.status === 'busy' || currentUser.status === 'offline'}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                        <option value="available">Available</option>
                        <option value="away">Away</option>
                        <option value="busy" disabled>Busy (On a Call)</option>
                        <option value="offline" disabled>Offline</option>
                    </select>
                </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              {activeUserCall ? (
                  <AgentAssistPanel call={activeUserCall} />
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-900">Make an Outbound Call</h3>
                  <p className="text-sm text-slate-500 mt-1">Dial from Ext: {currentUser.extension}</p>
                  <div className="mt-4 space-y-2">
                      <input
                      id="phoneNumber"
                      type="tel"
                      value={callNumber}
                      onChange={(e) => setCallNumber(e.target.value)}
                      placeholder="+1 555-123-4567"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <button
                          onClick={handleMakeCall}
                          disabled={!callNumber || !isCurrentUserAvailable}
                          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
                          title={!isCurrentUserAvailable ? 'You must be available to make calls' : 'Make Call'}
                      >
                      <Phone className="h-5 w-5" />
                      <span>Make Call</span>
                      </button>
                      {!isCurrentUserAvailable && <p className="text-xs text-center text-yellow-700 bg-yellow-100 p-2 rounded-md">Your status is set to '{currentUser.status}'. Please become 'Available' to make calls.</p>}
                  </div>
                </>
              )}
            </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-slate-900">Team Status</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search agents..."
                value={agentSearchTerm}
                onChange={(e) => setAgentSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
            {filteredAgents.map(agent => <AgentStatusCard key={agent.id} agent={agent} />)}
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Call History */}
      <div className="mt-8">
        <CallHistory calls={calls} />
      </div>
    </div>
  );
};

export default AgentDashboard;
