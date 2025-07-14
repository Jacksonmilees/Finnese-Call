
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
    isCompact?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, isCompact = false }) => {
  if (isCompact) {
    return (
        <div className="bg-white rounded-lg p-4 flex items-center space-x-3 shadow-sm border border-slate-200">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    )
  }
    
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className={`p-4 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
