
import React from 'react';
import { Agent, AgentStatus } from '../../types/index';

interface AgentStatusCardProps {
    agent: Agent;
}

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent }) => {
  const statusStyles: { [key in AgentStatus]: { bg: string; text: string; dot: string } } = {
    available: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    busy: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    away: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    offline: { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
  };

  const currentStatus = statusStyles[agent.status];

  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-3 transition-all duration-300 hover:shadow-md hover:scale-105">
      <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-slate-800">{agent.name}</h4>
        <p className="text-xs text-slate-500">Ext: {agent.extension}</p>
      </div>
      <div className={`flex items-center space-x-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}></span>
        <span>{agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
      </div>
    </div>
  );
};

export default AgentStatusCard;
