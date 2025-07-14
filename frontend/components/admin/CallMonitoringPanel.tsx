import React, { useState } from 'react';
import { Call } from '../../types/index';
import { Headset, Mic, Video, Phone, X, Play, Pause, Volume2 } from 'lucide-react';

interface CallMonitoringPanelProps {
  call: Call;
  onClose: () => void;
  onStartMonitoring: (callId: string) => void;
  onStopMonitoring: (callId: string) => void;
}

const CallMonitoringPanel: React.FC<CallMonitoringPanelProps> = ({ 
  call, 
  onClose, 
  onStartMonitoring, 
  onStopMonitoring 
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const handleStartMonitoring = async () => {
    try {
      await onStartMonitoring(call.id);
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await onStopMonitoring(call.id);
      setIsMonitoring(false);
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Headset className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900">Call Monitoring</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Call Information */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Call Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Phone Number:</span>
                <p className="font-medium">{call.phoneNumber}</p>
              </div>
              <div>
                <span className="text-slate-500">Agent(s):</span>
                <p className="font-medium">{call.participants.map(p => p.agentName).join(', ')}</p>
              </div>
              <div>
                <span className="text-slate-500">Duration:</span>
                <p className="font-medium">{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</p>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <p className="font-medium capitalize">{call.status}</p>
              </div>
            </div>
          </div>

          {/* Monitoring Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Monitoring Controls</h3>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                className={`px-4 py-2 rounded-md font-semibold flex items-center space-x-2 transition-colors ${
                  isMonitoring 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-slate-600">{volume}%</span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-md transition-colors ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Live Transcript */}
          {call.liveTranscript && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">Live Transcript</h3>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                {call.liveTranscript}
              </div>
            </div>
          )}

          {/* Monitoring Status */}
          {isMonitoring && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">Live Monitoring Active</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                You are currently monitoring this call. The agent cannot see that you are listening.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallMonitoringPanel; 