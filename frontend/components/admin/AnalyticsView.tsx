
import React from 'react';
import { AnalyticsData } from '../../types/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AnalyticsChart from './AnalyticsChart';

interface AnalyticsViewProps {
  analyticsData: AnalyticsData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#4ddbff', '#ffcce0'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg">
        <p className="label font-bold text-slate-800">{`${label}`}</p>
        <p className="intro text-sm text-blue-600">{`Total Calls : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analyticsData }) => {
  const { callVolume, agentPerformance, dispositionBreakdown } = analyticsData;

  // Safety checks for undefined or empty data
  const safeCallVolume = callVolume || [];
  const safeAgentPerformance = agentPerformance || [];
  const safeDispositionBreakdown = dispositionBreakdown || [];

  return (
    <div className="space-y-8 animate-in fade-in-25">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AnalyticsChart title="Call Volume (Last 7 Days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeCallVolume} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChart>
        
        <AnalyticsChart title="Agent Performance (Total Calls)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeAgentPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={80} />
                <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.7)'}} />
                <Legend />
                <Bar dataKey="calls" fill="#8884d8" background={{ fill: '#eee' }} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChart>
      </div>
      
      <div className="grid grid-cols-1">
         <AnalyticsChart title="Call Disposition Breakdown">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={safeDispositionBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {safeDispositionBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
         </AnalyticsChart>
      </div>
    </div>
  );
};

export default AnalyticsView;
