
import React from 'react';
import { Call } from '../../types/index';
import { ArrowDownLeft, ArrowUpRight, PlayCircle, PhoneMissed } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface CallHistoryProps {
  calls: Call[];
  onPlayRecording?: (call: Call) => void;
}

const getStatusInfo = (status: Call['status']) => {
  switch (status) {
    case 'connected':
    case 'ended':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' };
    case 'ringing-inbound':
    case 'ringing-outbound':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ringing' };
    case 'missed':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Missed' };
    default:
        return { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Unknown' };
  }
};

const CallHistory: React.FC<CallHistoryProps> = ({ calls, onPlayRecording }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900">Recent Call History</h3>
        <p className="text-sm text-slate-500 mt-1">A log of all inbound and outbound calls.</p>
      </div>
      <div className="overflow-x-auto">
        {calls.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Direction</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent(s)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {calls.map(call => {
                const statusInfo = getStatusInfo(call.status);
                const agentNames = call.participants.map(p => p.agentName).join(', ');
                return (
                  <tr key={call.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap" title={call.direction === 'inbound' ? 'Inbound' : 'Outbound'}>
                      {call.direction === 'inbound' ? 
                          <ArrowDownLeft className="h-5 w-5 text-blue-500" /> : 
                          <ArrowUpRight className="h-5 w-5 text-green-500" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{call.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{agentNames}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDuration(call.duration)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(call.timestamp).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        {call.recordingUrl && onPlayRecording ? (
                          <button onClick={() => onPlayRecording(call)} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1" title="Listen to call recording">
                            <PlayCircle className="h-5 w-5" />
                            <span>Listen</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 flex items-center space-x-1 cursor-not-allowed" title={onPlayRecording ? "Recording not available" : "Playback is an admin feature"}>
                            <PlayCircle className="h-5 w-5" />
                            <span>Listen</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <PhoneMissed className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-800">No Call History</h3>
            <p className="mt-1 text-sm text-slate-500">Recent calls will appear here once they are made or received.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallHistory;
