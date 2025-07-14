
import React, { useEffect } from 'react';
import { Call } from '../../types/index';
import useGemini from '../../hooks/useGemini';
import { Sparkles, Smile, Meh, Frown, Angry, Lightbulb, LoaderCircle } from 'lucide-react';

interface AgentAssistPanelProps {
    call: Call;
}

const sentimentInfo = {
    positive: { icon: <Smile className="h-6 w-6 text-green-500" />, text: "Positive", color: "text-green-600" },
    neutral: { icon: <Meh className="h-6 w-6 text-yellow-500" />, text: "Neutral", color: "text-yellow-600" },
    negative: { icon: <Frown className="h-6 w-6 text-orange-500" />, text: "Negative", color: "text-orange-600" },
    frustrated: { icon: <Angry className="h-6 w-6 text-red-500" />, text: "Frustrated", color: "text-red-600" },
};

const AgentAssistPanel: React.FC<AgentAssistPanelProps> = ({ call }) => {
    const { getAgentAssist, isAssisting, assistError, assistResult } = useGemini();

    useEffect(() => {
        const handler = setTimeout(() => {
            if (call.liveTranscript && call.liveTranscript.split(' ').length > 5) {
                getAgentAssist(call.liveTranscript);
            }
        }, 1500); // Debounce API calls

        return () => clearTimeout(handler);
    }, [call.liveTranscript, getAgentAssist]);

    const currentSentiment = assistResult?.sentiment ? sentimentInfo[assistResult.sentiment] : null;

    return (
        <div className="space-y-4 animate-in fade-in-50 duration-500">
            <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <h3 className="text-xl font-bold text-slate-900">Live AI Assistant</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Customer Sentiment</h4>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-md min-h-[56px] shadow-sm">
                        {isAssisting && !assistResult ? (
                            <div className="flex items-center space-x-2 text-slate-500">
                                <LoaderCircle className="h-5 w-5 animate-spin"/>
                                <span>Analyzing...</span>
                            </div>
                        ) : currentSentiment ? (
                            <>
                                {currentSentiment.icon}
                                <span className={`font-bold ${currentSentiment.color}`}>{currentSentiment.text}</span>
                            </>
                        ) : (
                            <span className="text-sm text-slate-500">Waiting for conversation...</span>
                        )}
                    </div>
                </div>
                 <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Suggested Next Step</h4>
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-md min-h-[56px] shadow-sm">
                         <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"/>
                         {isAssisting && !assistResult ? (
                            <div className="flex items-center space-x-2 text-slate-500">
                                <LoaderCircle className="h-5 w-5 animate-spin"/>
                            </div>
                         ) : assistResult?.suggestion ? (
                             <p className="text-sm text-slate-800 font-medium">{assistResult.suggestion}</p>
                         ) : (
                            <p className="text-sm text-slate-500">Suggestions will appear here.</p>
                         )}
                    </div>
                </div>
                {assistError && <p className="text-xs text-red-600 text-center">{assistError}</p>}
            </div>
        </div>
    );
};

export default AgentAssistPanel;
