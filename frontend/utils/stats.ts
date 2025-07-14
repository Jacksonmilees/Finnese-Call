
import { Call, Agent, DashboardStats, PersonalStats, AnalyticsData, LeaderboardEntry } from '../types/index';

export const calculateGlobalStats = (calls: Call[], agents: Agent[]): DashboardStats => {
    const endedCalls = calls.filter(c => c.status === 'ended' && c.duration > 0);
    const totalDuration = endedCalls.reduce((sum, call) => sum + call.duration, 0);
    
    return {
        totalCalls: calls.length,
        totalAgents: agents.length,
        availableAgents: agents.filter(a => a.status === 'available').length,
        avgCallDuration: endedCalls.length > 0 ? Math.round(totalDuration / endedCalls.length) : 0,
        recordedCalls: calls.filter(c => c.recordingUrl).length,
    };
};

export const calculatePersonalStats = (calls: Call[], agentId: number): PersonalStats => {
    const agentCalls = calls.filter(c => c.participants.some(p => p.agentId === agentId));
    const agentEndedCalls = agentCalls.filter(c => c.status === 'ended' && c.duration > 0);
    const agentTotalDuration = agentEndedCalls.reduce((sum, call) => sum + call.duration, 0);
    return {
        totalCalls: agentCalls.length,
        avgCallDuration: agentEndedCalls.length > 0 ? Math.round(agentTotalDuration / agentEndedCalls.length) : 0,
        totalTalkTime: agentTotalDuration,
        outboundCalls: agentCalls.filter(c => c.direction === 'outbound').length,
        inboundCalls: agentCalls.filter(c => c.direction === 'inbound').length,
    };
};

export const calculateAnalyticsData = (calls: Call[], agents: Agent[]): AnalyticsData => {
    // Call Volume (Last 7 Days)
    const callVolume: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        callVolume[key] = 0;
    }
    calls.forEach(call => {
        const key = call.timestamp.toLocaleDateString('en-US', { weekday: 'short' });
        if (key in callVolume) {
            callVolume[key]++;
        }
    });

    // Agent Performance
    const agentPerformance: { [key: string]: number } = {};
    agents.forEach(agent => {
        if(agent.name !== 'Deleted Agent') {
            agentPerformance[agent.name] = 0
        }
    });
    calls.forEach(call => {
        call.participants.forEach(p => {
            if (p.agentName && p.agentName !== 'Deleted Agent' && agentPerformance.hasOwnProperty(p.agentName)) {
                agentPerformance[p.agentName]++;
            }
        })
    });

    // Disposition Breakdown
    const dispositionBreakdown: { [key: string]: number } = {};
    calls.forEach(call => {
        if (call.disposition) {
            dispositionBreakdown[call.disposition] = (dispositionBreakdown[call.disposition] || 0) + 1;
        }
    });

    return {
        callVolume: Object.entries(callVolume).map(([name, calls]) => ({ name, calls })),
        agentPerformance: Object.entries(agentPerformance).map(([name, calls]) => ({ name, calls })),
        dispositionBreakdown: Object.entries(dispositionBreakdown).map(([name, value]) => ({ name, value })),
    };
};
    
export const calculateLeaderboardData = (calls: Call[], agents: Agent[]): LeaderboardEntry[] => {
    const positiveDispositions = ["Sale Made", "Resolved Issue", "Lead Generated"];

    const leaderboard = agents.map(agent => {
        const agentCalls = calls.filter(c => c.participants.some(p => p.agentId === agent.id));
        const totalTalkTime = agentCalls.reduce((sum, call) => sum + call.duration, 0);
        const positiveOutcomes = agentCalls.filter(c => c.disposition && positiveDispositions.includes(c.disposition)).length;
        
        // Scoring algorithm: 1 point per call, 1 point per minute of talk time, 5 points per positive outcome
        const score = Math.round((agentCalls.length * 1) + (totalTalkTime / 60 * 1) + (positiveOutcomes * 5));

        return {
            agentId: agent.id,
            agentName: agent.name,
            avatarUrl: agent.avatarUrl,
            score,
            totalCalls: agentCalls.length,
            totalTalkTime,
            positiveOutcomes
        };
    });

    return leaderboard.sort((a,b) => b.score - a.score);
};
