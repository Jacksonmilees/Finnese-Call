
import React from 'react';
import { LeaderboardEntry } from '../../types/index';
import LeaderboardCard from './LeaderboardCard';

interface LeaderboardViewProps {
  leaderboardData: LeaderboardEntry[];
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboardData }) => {
  return (
    <div className="space-y-6 animate-in fade-in-25">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-2xl font-bold text-slate-900">Agent Performance Leaderboard</h3>
        <p className="text-sm text-slate-500 mt-1">Ranking agents by performance score. Score is based on calls, talk time, and positive outcomes.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(leaderboardData) ? leaderboardData.map((entry, index) => (
          <LeaderboardCard key={entry.agentId} entry={entry} rank={index + 1} />
        )) : (
          <div className="col-span-full text-center text-slate-500 py-8">
            No leaderboard data available
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardView;
