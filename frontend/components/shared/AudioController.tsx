
import React, { useEffect, useRef } from 'react';
import { Call } from '../../types/index';

interface AudioControllerProps {
  activeCall: Call | null;
}

const AudioController: React.FC<AudioControllerProps> = ({ activeCall }) => {
  const incomingRingtoneRef = useRef<HTMLAudioElement | null>(null);
  const outgoingRingtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Refs are safer for accessing DOM elements in React
    incomingRingtoneRef.current = document.getElementById('incoming-ringtone') as HTMLAudioElement;
    outgoingRingtoneRef.current = document.getElementById('outgoing-ringtone') as HTMLAudioElement;
  }, []);

  const stopAllSounds = () => {
    if (incomingRingtoneRef.current) {
        incomingRingtoneRef.current.pause();
        incomingRingtoneRef.current.currentTime = 0;
    }
    if (outgoingRingtoneRef.current) {
        outgoingRingtoneRef.current.pause();
        outgoingRingtoneRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    stopAllSounds();

    if (!activeCall) return;

    switch (activeCall.status) {
      case 'ringing-inbound':
        incomingRingtoneRef.current?.play().catch(e => console.error("Error playing incoming ringtone:", e));
        break;
      case 'ringing-outbound':
        outgoingRingtoneRef.current?.play().catch(e => console.error("Error playing outgoing ringtone:", e));
        break;
      case 'connected':
      case 'ended':
      case 'missed':
        stopAllSounds();
        break;
    }

    // Cleanup when component unmounts or call is ended
    return () => {
        stopAllSounds();
    };
  }, [activeCall?.id, activeCall?.status]);

  // This component does not render anything
  return null;
};

export default AudioController;
