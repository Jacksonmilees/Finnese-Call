
import React, { useState, useEffect } from 'react';
import { Agent } from '../../types/index';
import { X, User, Hash, Voicemail } from 'lucide-react';

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: Omit<Agent, 'status' | 'avatarUrl'>) => void;
  agentToEdit?: Agent;
}

const AgentFormModal: React.FC<AgentFormModalProps> = ({ isOpen, onClose, onSave, agentToEdit }) => {
  const [name, setName] = useState('');
  const [extension, setExtension] = useState('');
  const [sipUsername, setSipUsername] = useState('');
  const [sipPassword, setSipPassword] = useState('');

  useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name);
      setExtension(agentToEdit.extension);
      setSipUsername(agentToEdit.sipUsername);
      setSipPassword(agentToEdit.sipPassword || '');
    } else {
      setName('');
      setExtension('');
      setSipUsername('');
      setSipPassword('');
    }
  }, [agentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: agentToEdit?.id,
      name,
      extension,
      sipUsername,
      sipPassword
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">
              {agentToEdit ? 'Edit Agent' : 'Create New Agent'}
            </h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-5">
             <div>
                <label htmlFor="agent-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="agent-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Jane Doe" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
             </div>
             <div>
                <label htmlFor="agent-ext" className="block text-sm font-medium text-slate-700 mb-1">Extension</label>
                <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="agent-ext" type="text" value={extension} onChange={e => setExtension(e.target.value)} placeholder="e.g., 101" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
             </div>
             <div className="pt-4 border-t border-slate-200">
                 <h3 className="text-md font-semibold text-slate-800">Africa's Talking SIP Credentials</h3>
                 <p className="text-xs text-slate-500 mb-3">These credentials are used to link the agent to the SIP line.</p>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="sip-username" className="block text-sm font-medium text-slate-700 mb-1">SIP Username</label>
                        <div className="relative">
                            <Voicemail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input id="sip-username" type="text" value={sipUsername} onChange={e => setSipUsername(e.target.value)} placeholder="e.g., your_username.sip" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="sip-password" className="block text-sm font-medium text-slate-700 mb-1">SIP Password</label>
                         <input id="sip-password" type="password" value={sipPassword} onChange={e => setSipPassword(e.target.value)} placeholder={agentToEdit ? 'Enter new password to update' : 'Enter SIP password'} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    </div>
                 </div>
             </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md hover:bg-slate-50 transition-colors active:scale-95">
                Cancel
             </button>
             <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors active:scale-95 disabled:bg-slate-400">
                {agentToEdit ? 'Save Changes' : 'Create Agent'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentFormModal;
