
import React, { useState } from 'react';
import { Call, CrmContact, Agent, AuthenticatedUser } from '../../../types/index';
import { Phone, Mic, MicOff, Pause, Play, PhoneOff, PhoneIncoming, Headset, X, ArrowRightLeft, ArrowLeft, UserPlus, UserX } from 'lucide-react';
import { formatDuration } from '../../../utils/formatters';
import ControlButton from './ControlButton';


interface CallManagerProps {
  call: Call;
  contact: CrmContact | null;
  onEndCall?: (callId: string) => void;
  onAcceptCall?: (callId: string) => void;
  onDeclineCall?: (callId: string) => void;
  onTransferCall?: (callId: string, targetAgentId: number) => void;
  onAddToConference?: (callId: string, targetAgentId: number) => void;
  agents?: Agent[];
  currentUser?: Extract<AuthenticatedUser, { role: 'agent' }>;
  isMonitoring?: boolean;
  onCloseMonitor?: () => void;
}

const CallManager: React.FC<CallManagerProps> = ({ call, contact, onEndCall, onAcceptCall, onDeclineCall, onTransferCall, onAddToConference, agents, currentUser, isMonitoring = false, onCloseMonitor }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [view, setView] = useState<'default' | 'transfer' | 'conference'>('default');

  const agentNames = call.participants.map(p => p.agentName).join(', ');
  const contactName = contact?.name || 'Unknown Contact';
  const contactAvatar = `https://i.pravatar.cc/100?u=${contact?.id || call.phoneNumber}`;
  
  const renderContent = () => {
    const isConference = call.participants.length > 1;

    switch(call.status) {
      case 'ringing-inbound':
        return (
          <div className="text-center">
            <p className="text-sm text-slate-300">Incoming Call from</p>
            <p className="text-2xl font-bold text-white truncate">{contactName}</p>
            <p className="text-lg text-slate-400 font-mono">{call.phoneNumber}</p>
          </div>
        );
      case 'ringing-outbound':
         return (
          <div className="text-center">
            <p className="text-sm text-slate-300">Calling...</p>
            <p className="text-2xl font-bold text-white truncate">{contactName}</p>
            <p className="text-lg text-slate-400 font-mono">{call.phoneNumber}</p>
          </div>
        );
      case 'connected':
        return (
          <div className="text-center">
             {isConference ? (
                 <p className="text-xl font-bold text-green-400">Conference Call</p>
             ) : (
                <p className={`text-xl font-bold truncate ${isOnHold ? 'text-yellow-400' : 'text-white'}`}>{isOnHold ? 'On Hold' : contactName}</p>
             )}
            <p className="text-5xl font-mono tracking-tighter text-white mt-2">{formatDuration(call.duration)}</p>
             {isConference ? (
                 <p className="text-sm text-slate-400 truncate w-60">With: {contactName}, {agentNames}</p>
             ) : (
                <p className="text-sm text-slate-400">{isMonitoring ? `with Agent: ${agentNames}` : `${call.direction === 'inbound' ? 'Inbound' : 'Outbound'} Call`}</p>
             )}
          </div>
        );
      default: return null;
    }
  };

  const renderAgentDirectory = (action: 'transfer' | 'conference') => {
    const availableAgents = agents && currentUser ? agents.filter(a => a.status === 'available' && !call.participants.some(p => p.agentId === a.id)) : [];
    const actionText = action === 'transfer' ? 'Transfer to' : 'Add to call';
    const ActionIcon = action === 'transfer' ? ArrowRightLeft : UserPlus;

    return (
        <div className="w-full flex flex-col space-y-1 px-2">
             <button onClick={() => setView('default')} className="flex items-center space-x-2 text-sm p-2 rounded-md hover:bg-slate-700 w-full text-left mb-2">
                 <ArrowLeft className="h-4 w-4"/>
                 <span>Back to Call Controls</span>
             </button>
             <div className="max-h-40 overflow-y-auto pr-1">
                 {availableAgents.length > 0 ? availableAgents.map(agent => (
                     <button
                        key={agent.id}
                        onClick={() => {
                            if (action === 'transfer') onTransferCall?.(call.id, agent.id);
                            if (action === 'conference') onAddToConference?.(call.id, agent.id);
                            setView('default');
                        }}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700 w-full text-left transition-colors"
                     >
                         <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full" />
                         <div className="flex-1">
                             <p className="font-semibold text-sm">{agent.name}</p>
                             <p className="text-xs text-slate-400">Ext: {agent.extension}</p>
                         </div>
                         <div className="flex items-center space-x-1 text-green-400 text-xs">
                           <span>{actionText}</span>
                           <ActionIcon className="h-4 w-4" />
                         </div>
                     </button>
                 )) : (
                     <div className="text-center text-sm text-slate-400 p-4">No agents available.</div>
                 )}
             </div>
        </div>
    )
  }
  
  const renderControls = () => {
    switch(call.status) {
        case 'ringing-inbound':
            return (
                <div className="flex justify-around items-center w-full">
                    <ControlButton onClick={() => onDeclineCall?.(call.id)} label="Decline" className="bg-red-600 hover:bg-red-700" icon={<PhoneOff className="h-6 w-6"/>} />
                    <ControlButton onClick={() => onAcceptCall?.(call.id)} label="Accept" className="bg-green-600 hover:bg-green-700" icon={<PhoneIncoming className="h-6 w-6"/>} />
                </div>
            );
        case 'ringing-outbound':
             return (
                <div className="flex justify-center items-center w-full">
                    <ControlButton onClick={() => onEndCall?.(call.id)} label="Cancel" className="bg-red-600 hover:bg-red-700" icon={<PhoneOff className="h-6 w-6"/>} />
                </div>
            );
        case 'connected':
            if (view === 'transfer') return renderAgentDirectory('transfer');
            if (view === 'conference') return renderAgentDirectory('conference');

            return (
                 <div className="flex justify-around items-center w-full">
                    <ControlButton
                        onClick={() => setIsMuted(!isMuted)}
                        label={isMuted ? 'Unmute' : 'Mute'}
                        className={isMuted ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}
                        icon={isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        disabled={isMonitoring}
                    />
                     <ControlButton
                        onClick={() => setIsOnHold(!isOnHold)}
                        label={isOnHold ? 'Resume' : 'Hold'}
                        className={isOnHold ? 'bg-yellow-500 text-slate-800' : 'bg-slate-700 hover:bg-slate-600'}
                        icon={isOnHold ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                        textClassName={isOnHold ? 'text-slate-800' : 'text-white'}
                        disabled={isMonitoring}
                    />
                    <ControlButton
                        onClick={() => setView('conference')}
                        label="Add"
                        className="bg-slate-700 hover:bg-slate-600"
                        icon={<UserPlus className="h-6 w-6" />}
                        disabled={isMonitoring}
                    />
                    <ControlButton
                        onClick={() => setView('transfer')}
                        label="Transfer"
                        className="bg-slate-700 hover:bg-slate-600"
                        icon={<ArrowRightLeft className="h-6 w-6" />}
                        disabled={isMonitoring || call.participants.length > 1}
                    />
                    <ControlButton
                        onClick={() => onEndCall?.(call.id)}
                        label="End"
                        className="bg-red-600 hover:bg-red-700"
                        icon={<PhoneOff className="h-6 w-6" />}
                        disabled={isMonitoring}
                    />
                </div>
            );
        default: return null;
    }
  }

  return (
    <div className={`fixed bottom-5 right-5 w-80 bg-slate-800/95 backdrop-blur-md text-white rounded-2xl shadow-2xl z-50 animate-in fade-in-0 slide-in-from-bottom-5 duration-500 overflow-hidden flex flex-col border-2 ${isMonitoring ? 'border-red-500' : 'border-transparent'}`}>
       {isMonitoring && (
         <div className="absolute top-0 left-0 right-0 bg-red-600 p-1.5 text-xs font-bold text-center flex justify-between items-center z-10 px-3">
           <div className="flex items-center space-x-1.5">
             <Headset className="h-4 w-4" />
             <span>MONITORING MODE</span>
           </div>
           <button onClick={onCloseMonitor} className="p-0.5 rounded-full hover:bg-white/20">
             <X className="h-4 w-4"/>
           </button>
         </div>
       )}
       <div className={`relative ${isMonitoring ? 'pt-20' : 'pt-12'} pb-6 px-6 flex-grow flex flex-col items-center justify-center space-y-4`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 bg-slate-700/50 rounded-full animate-pulse"></div>
            </div>
            <div className="relative w-24 h-24">
                {contact ? 
                    <img src={contactAvatar} alt={contactName} className="w-24 h-24 rounded-full border-4 border-slate-700 shadow-lg" />
                    : <div className="w-24 h-24 rounded-full border-4 border-slate-700 shadow-lg bg-slate-600 flex items-center justify-center"><UserX className="h-10 w-10 text-slate-400"/></div>
                }
                 {call.status === 'connected' && (
                    <span className="absolute bottom-0 right-0 block h-6 w-6 rounded-full bg-slate-800 ring-2 ring-slate-800">
                      <span className={`relative flex h-full w-full items-center justify-center`}>
                          {!isOnHold && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-4 w-4 ${isOnHold ? 'bg-yellow-400' : 'bg-green-500'}`}></span>
                      </span>
                    </span>
                 )}
            </div>
            {renderContent()}
       </div>

      <div className="bg-slate-900/70 p-4 min-h-[104px] flex items-center">
        {renderControls()}
      </div>
    </div>
  );
};

export default CallManager;
