
import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AgentAssistResult } from '../types/index';

// IMPORTANT: This key is automatically populated by the environment.
// DO NOT insert a key here or in any other file.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const useGemini = () => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isAssisting, setIsAssisting] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const [assistResult, setAssistResult] = useState<AgentAssistResult | null>(null);
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const generateSummary = useCallback(async (transcript: string): Promise<string | null> => {
    setIsSummarizing(true);
    setSummaryError(null);
    try {
        const prompt = `Please provide a concise, one-paragraph summary of the following call center transcript. Focus on the main reason for the call and the outcome. The summary should be suitable for use as a call log note. Transcript:\n\n${transcript}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text;
        return summary;
    } catch (e) {
      console.error("Error generating summary:", e);
      setSummaryError("Failed to generate summary. Please check your connection or API key.");
      return null;
    } finally {
      setIsSummarizing(false);
    }
  }, [ai.models]);

  const getAgentAssist = useCallback(async (currentTranscript: string): Promise<void> => {
      if (!currentTranscript) return;
      setIsAssisting(true);
      setAssistError(null);

      try {
          const schema = {
              type: Type.OBJECT,
              properties: {
                  sentiment: {
                      type: Type.STRING,
                      enum: ['positive', 'neutral', 'negative', 'frustrated'],
                      description: 'The overall sentiment of the customer based on the conversation.'
                  },
                  suggestion: {
                      type: Type.STRING,
                      description: 'A concise, actionable next step for the agent to take. Suggest things like "Offer a discount," "Confirm the solution," or "Ask for account details."'
                  }
              },
              required: ['sentiment', 'suggestion']
          };

          const prompt = `Analyze the following customer service call transcript. Determine the customer's current sentiment and suggest the best immediate next action for the agent. Transcript: \n\n"${currentTranscript}"`;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: schema,
              }
          });

          const jsonText = response.text.trim();
          const result = JSON.parse(jsonText) as AgentAssistResult;
          setAssistResult(result);

      } catch (e) {
          console.error("Error getting agent assist:", e);
          setAssistError("AI Assistant failed to respond.");
      } finally {
          setIsAssisting(false);
      }

  }, [ai.models]);

  return { 
      generateSummary, 
      isSummarizing, 
      summaryError,
      getAgentAssist,
      isAssisting,
      assistError,
      assistResult
  };
};

export default useGemini;
