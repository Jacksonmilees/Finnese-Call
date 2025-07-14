import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, User, Volume2 } from 'lucide-react';

interface IncomingCall {
  id: string;
  from: string;
  to: string;
  direction: 'inbound';
  status: 'ringing' | 'answered' | 'completed' | 'missed';
  timestamp: string;
  duration?: number;
}

interface CallReceiverProps {
  onAnswerCall: (callId: string) => void;
  onRejectCall: (callId: string) => void;
}

const CallReceiver: React.FC<CallReceiverProps> = ({ onAnswerCall, onRejectCall }) => {
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ringingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element for ringing
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // Poll for incoming calls every 3 seconds
    const interval = setInterval(() => {
      fetchIncomingCalls();
    }, 3000);

    return () => {
      clearInterval(interval);
      if (ringingIntervalRef.current) {
        clearInterval(ringingIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const fetchIncomingCalls = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/calls/incoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Only show calls that are currently ringing (not older than 30 seconds)
        const now = new Date();
        const ringingCalls = data.data.filter((call: IncomingCall) => {
          const callTime = new Date(call.timestamp);
          const timeDiff = (now.getTime() - callTime.getTime()) / 1000;
          return call.status === 'ringing' && timeDiff < 30;
        });
        
        setIncomingCalls(ringingCalls);
        setIsVisible(ringingCalls.length > 0);
        
        // Play/stop ringing sound
        if (ringingCalls.length > 0 && !isMuted && audioRef.current) {
          audioRef.current.play().catch(() => {}); // Ignore autoplay errors
        } else if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    } catch (error) {
      console.error('Error fetching incoming calls:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    return phone.replace('+254', '0').replace('+', '');
  };

  const handleAnswer = (callId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onAnswerCall(callId);
    setIsVisible(false);
  };

  const handleReject = (callId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onRejectCall(callId);
    setIsVisible(false);
  };

  if (!isVisible || incomingCalls.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-pulse">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-blue-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Incoming Call</h2>
          <p className="text-gray-600">Someone is calling you</p>
      </div>

        {/* Caller Info */}
      {incomingCalls.map((call) => (
          <div key={call.id} className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {formatPhoneNumber(call.from)}
            </h3>
            <p className="text-gray-500 text-sm">
                {new Date(call.timestamp).toLocaleTimeString()}
              </p>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex space-x-4">
            <button
            onClick={() => handleAnswer(incomingCalls[0].id)}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
            <PhoneCall className="h-5 w-5" />
              <span>Answer</span>
            </button>
          <button
            onClick={() => handleReject(incomingCalls[0].id)}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <PhoneOff className="h-5 w-5" />
            <span>Decline</span>
          </button>
        </div>

        {/* Volume Indicator */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isMuted ? (
                <Volume2 className="h-4 w-4 text-red-500" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <span className="text-sm">{isMuted ? 'Muted' : 'Ringing...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallReceiver; 