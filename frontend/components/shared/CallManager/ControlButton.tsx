
import React from 'react';

const ControlButton: React.FC<{
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
}> = ({ onClick, icon, label, className = '', textClassName = 'text-white', disabled = false }) => (
  <div className="flex flex-col items-center space-y-2">
    <button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`p-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon}
    </button>
    <span className={`text-xs font-semibold ${textClassName}`}>{label}</span>
  </div>
);

export default ControlButton;
