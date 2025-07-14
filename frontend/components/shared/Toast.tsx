
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const theme = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircle className="h-6 w-6 text-white" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircle className="h-6 w-6 text-white" />,
    },
  };

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center justify-between w-full max-w-xs p-4 text-white ${theme[type].bg} rounded-xl shadow-lg animate-in fade-in-0 slide-in-from-top-5 duration-500`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        {theme[type].icon}
        <span className="text-sm font-semibold">{message}</span>
      </div>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
