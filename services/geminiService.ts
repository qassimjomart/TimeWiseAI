
import { GoogleGenAI, Type } from "@google/genai";
import { TimeEntry, TimeCategory, AIAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeTimeData = async (entries: TimeEntry[], categories: TimeCategory[]): Promise<AIAnalysis> => {
    if (!API_KEY) {
        return {
            insights: ["API Key not configured. Please set the API_KEY environment variable."],
            suggestions: ["AI analysis is currently unavailable."],
        };
    }

    const aggregatedData: { [key: string]: number } = {};
    categories.forEach(cat => aggregatedData[cat.name] = 0);

    entries.forEach(entry => {
        const category = categories.find(c => c.id === entry.categoryId);
        if (category) {
            aggregatedData[category.name] += entry.durationMinutes;
        }
    });

    const timeLogSummary = Object.entries(aggregatedData)
        .map(([name, totalMinutes]) => `- ${name}: ${Math.round(totalMinutes / 60)} hours`)
        .join('\n');

    const prompt = `
        You are a world-class productivity coach named TimeWise AI. Analyze the following time log data for a business professional. 
        Your goal is to identify patterns, highlight areas of inefficiency or imbalance, and provide actionable suggestions for better time management and work-life balance.

        Time Log Summary (total hours per category):
        ${timeLogSummary}

        Based on this data, provide your analysis. Be concise, insightful, and encouraging.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        insights: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "An observation or pattern found in the time data."
                            },
                            description: "A list of key insights about the user's time allocation."
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A concrete, actionable suggestion for improvement."
                            },
                            description: "A list of actionable recommendations for the user."
                        }
                    },
                    required: ["insights", "suggestions"],
                },
            },
        });
        
        const jsonText = response.text;
        const parsedResponse = JSON.parse(jsonText);

        if (parsedResponse.insights && parsedResponse.suggestions) {
            return parsedResponse as AIAnalysis;
        } else {
            throw new Error("Invalid response structure from AI.");
        }

    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        throw new Error("Failed to get analysis from AI. The model may be overloaded or an error occurred.");
    }
};
