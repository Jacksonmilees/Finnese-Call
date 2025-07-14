
import React, { useState, useRef, useEffect } from 'react';
import { Call } from '../../types/index';
import { X, Phone, User, Clock, Calendar, ArrowDownLeft, ArrowUpRight, Mic, Video, Users } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface CallPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: Call;
}

type PlayerTab = 'audio' | 'screen';

const CallPlayerModal: React.FC<CallPlayerModalProps> = ({ isOpen, onClose, call }) => {
  const [activeTab, setActiveTab] = useState<PlayerTab>('audio');
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const agentNames = call.participants.map(p => p.agentName).join(', ');

  useEffect(() => {
    if (!isOpen) {
      // Pause both players when modal is closed
      audioRef.current?.pause();
      videoRef.current?.pause();
      // Reset to audio tab for next opening
      setActiveTab('audio');
    }
  }, [isOpen]);

  const handleTabChange = (tab: PlayerTab) => {
    setActiveTab(tab);
    if (tab === 'audio') {
        videoRef.current?.pause();
    } else {
        audioRef.current?.pause();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             {call.direction === 'inbound' ? 
                <ArrowDownLeft className="h-7 w-7 text-blue-500 p-1 bg-blue-100 rounded-full" /> : 
                <ArrowUpRight className="h-7 w-7 text-green-500 p-1 bg-green-100 rounded-full" />}
            <h2 className="text-xl font-bold text-slate-900">
              Call Review
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-slate-700"><Phone className="w-4 h-4 mr-3 text-slate-400 shrink-0"/><span>{call.phoneNumber}</span></div>
                <div className="flex items-center text-slate-700"><Users className="w-4 h-4 mr-3 text-slate-400 shrink-0"/><span>Agent(s): {agentNames}</span></div>
                <div className="flex items-center text-slate-700"><Calendar className="w-4 h-4 mr-3 text-slate-400 shrink-0"/><span>{new Date(call.timestamp).toLocaleString()}</span></div>
                <div className="flex items-center text-slate-700"><Clock className="w-4 h-4 mr-3 text-slate-400 shrink-0"/><span>Duration: {formatDuration(call.duration)}</span></div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="border-b border-slate-200 mb-4">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                      <button onClick={() => handleTabChange('audio')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'audio' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                          <Mic className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'audio' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                          <span>Audio Recording</span>
                      </button>
                      <button onClick={() => handleTabChange('screen')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'screen' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                          <Video className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'screen' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                          <span>Screen Recording</span>
                      </button>
                  </nav>
              </div>

              <div className="bg-slate-900 rounded-lg overflow-hidden">
                {activeTab === 'audio' && (
                  <div className="p-4">
                      <audio ref={audioRef} controls autoPlay className="w-full" src={call.recordingUrl}>
                          Your browser does not support the audio element.
                      </audio>
                  </div>
                )}
                {activeTab === 'screen' && (
                  <div>
                      {call.screenRecordingUrl ? (
                          <video ref={videoRef} controls autoPlay className="w-full max-h-[400px]" src={call.screenRecordingUrl}>
                              Your browser does not support the video element.
                          </video>
                      ) : (
                          <div className="p-8 text-center text-slate-400">
                              <p>No screen recording available for this call.</p>
                          </div>
                      )}
                  </div>
                )}
              </div>
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end">
           <button 
                onClick={onClose} 
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors active:scale-95"
            >
              Close Player
            </button>
        </div>
      </div>
    </div>
  );
};

export default CallPlayerModal;
