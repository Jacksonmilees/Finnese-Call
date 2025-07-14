
import React from 'react';
import { LeaderboardEntry } from '../../types/index';
import { Award, Medal, Trophy, PhoneCall, Clock, CheckCircle, Star } from 'lucide-react';
import { formatTotalTime } from '../../utils/formatters';


const medalColors = {
    1: 'text-yellow-400', // Gold
    2: 'text-gray-400', // Silver
    3: 'text-orange-400', // Bronze
};

const LeaderboardCard: React.FC<{ entry: LeaderboardEntry; rank: number }> = ({ entry, rank }) => {
  const isTopThree = rank <= 3;
  const rankColor = medalColors[rank as keyof typeof medalColors] || 'text-slate-500';

  return (
    <div className={`bg-white rounded-xl p-4 shadow-md border-2 transition-all duration-300 ${isTopThree ? `border-transparent ring-2 ${rank === 1 ? 'ring-yellow-400' : rank === 2 ? 'ring-gray-400' : 'ring-orange-400'}`: 'border-slate-200'}`}>
        <div className="flex items-center space-x-4">
            <div className={`text-3xl font-bold w-10 text-center ${rankColor}`}>
                {rank}
            </div>
            <img src={entry.avatarUrl} alt={entry.agentName} className="w-16 h-16 rounded-full" />
            <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-800">{entry.agentName}</h4>
                 <div className="flex items-center space-x-2 text-sm">
                    <Star className={`h-5 w-5 ${rankColor}`} />
                    <span className="font-bold text-lg text-slate-700">{entry.score}</span>
                    <span className="text-slate-500">Points</span>
                </div>
            </div>
             {isTopThree && (
                <div className="p-2">
                    {rank === 1 && <Trophy className={`h-10 w-10 ${rankColor}`} />}
                    {rank === 2 && <Medal className={`h-10 w-10 ${rankColor}`} />}
                    {rank === 3 && <Award className={`h-10 w-10 ${rankColor}`} />}
                </div>
            )}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="text-sm">
                <p className="font-semibold text-slate-800">{entry.totalCalls}</p>
                <p className="text-xs text-slate-500 flex items-center justify-center space-x-1"><PhoneCall className="h-3 w-3" /> <span>Calls</span></p>
            </div>
            <div className="text-sm">
                <p className="font-semibold text-slate-800">{formatTotalTime(entry.totalTalkTime)}</p>
                <p className="text-xs text-slate-500 flex items-center justify-center space-x-1"><Clock className="h-3 w-3" /> <span>Talk Time</span></p>
            </div>
            <div className="text-sm">
                <p className="font-semibold text-slate-800">{entry.positiveOutcomes}</p>
                <p className="text-xs text-slate-500 flex items-center justify-center space-x-1"><CheckCircle className="h-3 w-3" /> <span>Positive</span></p>
            </div>
        </div>
    </div>
  );
};

export default LeaderboardCard;
