
import React from 'react';

interface FilterButtonProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  activeClass: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, count, icon, isActive, onClick, activeClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? `${activeClass} text-white shadow`
        : 'bg-white text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span>{label}</span>
    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
      {count}
    </span>
  </button>
);

export default FilterButton;
