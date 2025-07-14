
import React, { useState } from 'react';
import { Agent, DashboardStats, AgentStatus, Call, CrmContact } from '../../types/index';
import { PhoneCall, Users, Clock, Film, Wifi, WifiOff, UserPlus, CheckCircle, Phone, Coffee, UserX, Headset, PhoneOff, BookUser } from 'lucide-react';
import AgentsTable from '../shared/AgentsTable';
import ContactsTable from '../shared/ContactsTable';
import CallHistory from '../shared/CallHistory';
import StatCard from '../shared/StatCard';
import FilterButton from './FilterButton';
import { formatDuration } from '../../utils/formatters';


interface OperationalViewProps {
  stats: DashboardStats;
  agents: Agent[];
  calls: Call[];
  contacts: CrmContact[];
  onDeleteRequest: (item: Agent | CrmContact) => void;
  onEditAgent: (agent: Agent) => void;
  onCreateAgent: () => void;
  onEditContact: (contact: CrmContact) => void;
  onCreateContact: () => void;
  onPlayRecording: (call: Call) => void;
  onMonitorCall: (call: Call) => void;
  isConnected: boolean;
}

type AgentFilter = 'all' | AgentStatus;

const OperationalView: React.FC<OperationalViewProps> = ({ stats, agents, calls, contacts, onDeleteRequest, onEditAgent, onCreateAgent, onEditContact, onCreateContact, onPlayRecording, onMonitorCall, isConnected }) => {
  const [activeFilter, setActiveFilter] = useState<AgentFilter>('all');

  const filteredAgents = agents.filter(agent => {
    if (activeFilter === 'all') return true;
    return agent.status === activeFilter;
  });

  const getAgentCount = (status: AgentStatus) => agents.filter(a => a.status === status).length;
  
  const liveCalls = calls.filter(c => c.status === 'connected');

  return (
    <div className="space-y-8 animate-in fade-in-25">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={<PhoneCall className="h-6 w-6 text-blue-600" />} label="Total Calls Today" value={stats.totalCalls} color="bg-blue-100" />
          <StatCard icon={<Users className="h-6 w-6 text-cyan-600" />} label="Total Agents" value={stats.totalAgents} color="bg-cyan-100" />
          <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} label="Avg. Call Duration" value={`${stats.avgCallDuration}s`} color="bg-yellow-100" />
          <StatCard icon={<Film className="h-6 w-6 text-purple-600" />} label="Recorded Calls" value={stats.recordedCalls} color="bg-purple-100" />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center space-y-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          {isConnected ? <Wifi className="h-8 w-8 text-green-500"/> : <WifiOff className="h-8 w-8 text-red-500"/>}
          <p className="text-lg font-bold text-slate-900">System Status</p>
          <p className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>{isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>

      {/* Live Calls and Agent Management */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
            {/* Agent Management Section */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Agent Management</h3>
                    <p className="text-sm text-slate-500 mt-1">Create, view, and manage your call center agents.</p>
                </div>
                <button
                    onClick={onCreateAgent}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
                >
                    <UserPlus className="h-5 w-5" />
                    <span>Create Agent</span>
                </button>
                </div>
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-2">
                    <FilterButton label="All" count={agents.length} icon={<Users className="h-4 w-4"/>} isActive={activeFilter === 'all'} onClick={() => setActiveFilter('all')} activeClass="bg-slate-600" />
                    <FilterButton label="Available" count={getAgentCount('available')} icon={<CheckCircle className="h-4 w-4"/>} isActive={activeFilter === 'available'} onClick={() => setActiveFilter('available')} activeClass="bg-green-500" />
                    <FilterButton label="Busy" count={getAgentCount('busy')} icon={<Phone className="h-4 w-4"/>} isActive={activeFilter === 'busy'} onClick={() => setActiveFilter('busy')} activeClass="bg-red-500" />
                    <FilterButton label="Away" count={getAgentCount('away')} icon={<Coffee className="h-4 w-4"/>} isActive={activeFilter === 'away'} onClick={() => setActiveFilter('away')} activeClass="bg-yellow-500" />
                    <FilterButton label="Offline" count={getAgentCount('offline')} icon={<UserX className="h-4 w-4"/>} isActive={activeFilter === 'offline'} onClick={() => setActiveFilter('offline')} activeClass="bg-gray-500" />
                </div>
                <div className="p-2 sm:p-4">
                    <AgentsTable agents={filteredAgents} onEdit={onEditAgent} onDelete={(agent) => onDeleteRequest(agent)} />
                </div>
            </div>
        </div>

        {/* Live Calls Panel */}
        <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-slate-200">
                 <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-full">
                        <Headset className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Live Calls</h3>
                 </div>
                 <p className="text-sm text-slate-500 mt-1 ml-12">Monitor active conversations for quality assurance.</p>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {liveCalls.length > 0 ? liveCalls.map(call => {
                    const agentNames = call.participants.map(p => p.agentName).join(', ');
                    const isConference = call.participants.length > 1;
                    return (
                        <div key={call.id} className="bg-slate-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`font-semibold ${isConference ? 'text-green-700' : 'text-slate-800'}`}>{isConference ? 'Conference Call' : agentNames}</p>
                                    <p className="text-sm text-slate-500">{isConference ? `with ${agentNames}` : call.phoneNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-lg font-semibold text-slate-700">{formatDuration(call.duration)}</p>
                                     <span className="flex items-center justify-end text-sm text-red-500">
                                        <span className="relative flex h-2 w-2 mr-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        Live
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onMonitorCall(call)}
                                className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                                <Headset className="h-4 w-4" />
                                <span>Listen In</span>
                            </button>
                        </div>
                    )
                }) : (
                    <div className="text-center py-10 text-slate-500">
                        <PhoneOff className="mx-auto h-10 w-10 text-slate-400" />
                        <h3 className="mt-2 text-md font-medium text-slate-800">No Active Calls</h3>
                        <p className="mt-1 text-sm text-slate-500">Live calls will appear here when an agent is connected.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

       {/* Contact Directory Section */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Contact Directory</h3>
            <p className="text-sm text-slate-500 mt-1">Manage your CRM contacts.</p>
          </div>
          <button
            onClick={onCreateContact}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
          >
            <BookUser className="h-5 w-5" />
            <span>Create Contact</span>
          </button>
        </div>
        <div className="p-2 sm:p-4">
          <ContactsTable contacts={contacts} onEdit={onEditContact} onDelete={(contact) => onDeleteRequest(contact)} />
        </div>
      </div>


      {/* Call History Section */}
       <div className="mt-8">
        <CallHistory calls={calls} onPlayRecording={onPlayRecording} />
      </div>
    </div>
  );
};

export default OperationalView;
