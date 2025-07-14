
import React from 'react';
import { Agent, AgentStatus } from '../../types/index';
import { Edit, Trash2, Users } from 'lucide-react';

interface AgentsTableProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

const statusStyles: { [key in AgentStatus]: { bg: string; text: string; dot: string } } = {
  available: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  busy: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  away: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  offline: { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
};

const AgentsTable: React.FC<AgentsTableProps> = ({ agents, onEdit, onDelete }) => {
  if (agents.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Users className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-lg font-medium text-slate-800">No Agents Found</h3>
        <p className="mt-1 text-sm text-slate-500">No agents match the current filter, or no agents have been created yet.</p>
        <p className="text-sm text-slate-500">Try adjusting your filter or click "Create Agent" to add a new team member.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Extension</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Africa's Talking SIP Username</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {agents.map(agent => {
            const currentStatus = statusStyles[agent.status];
            return (
              <tr key={agent.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={agent.avatarUrl} alt={agent.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{agent.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{agent.extension}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                    <span className={`w-2 h-2 mr-1.5 rounded-full ${currentStatus.dot}`}></span>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{agent.sipUsername}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-4">
                    <button onClick={() => onEdit(agent)} className="text-blue-600 hover:text-blue-900 transition-colors" aria-label={`Edit ${agent.name}`}>
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(agent)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Delete ${agent.name}`}>
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AgentsTable;
