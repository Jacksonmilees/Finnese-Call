
import React from 'react';

const AnalyticsChart: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
    <div className="w-full h-80">
      {children}
    </div>
  </div>
);

export default AnalyticsChart;
