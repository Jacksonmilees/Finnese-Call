import React, { useState } from 'react';
import { Call, Agent } from '../../types/index';
import { Phone, Users, X } from 'lucide-react';

interface CallTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: Call;
  agents: Agent[];
  onTransfer: (callId: string, targetAgentId: number) => void;
}

const CallTransferModal: React.FC<CallTransferModalProps> = ({ 
  isOpen, 
  onClose, 
  call, 
  agents, 
  onTransfer 
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const availableAgents = agents.filter(agent => 
    agent.status === 'available' && 
    agent.id !== call.participants[0]?.agentId
  );

  const handleTransfer = async () => {
    if (!selectedAgentId) return;
    
    setIsTransferring(true);
    try {
      await onTransfer(call.id, selectedAgentId);
      onClose();
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Phone className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Transfer Call</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Current Call</h3>
            <p className="text-sm text-slate-600">Phone: {call.phoneNumber}</p>
            <p className="text-sm text-slate-600">
              Agent: {call.participants.map(p => p.agentName).join(', ')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Transfer to Agent
            </label>
            <select
              value={selectedAgentId || ''}
              onChange={(e) => setSelectedAgentId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an agent...</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.extension})
                </option>
              ))}
            </select>
          </div>

          {availableAgents.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                No available agents to transfer to.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedAgentId || isTransferring}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Phone className="h-4 w-4" />
            <span>{isTransferring ? 'Transferring...' : 'Transfer Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallTransferModal; 