
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TimeCategory, TimeEntry, AIAnalysis, ChartData } from './types';
import { DEFAULT_CATEGORIES, MOCK_TIME_ENTRIES } from './constants';
import { analyzeTimeData } from './services/geminiService';
import { Card, CardHeader, CardTitle } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { TimeDistributionChart } from './components/TimeDistributionChart';
import { ClockIcon, PieChartIcon, LightbulbIcon, PlusIcon, TrashIcon } from './components/icons';
import { PomodoroTimer } from './components/PomodoroTimer';

type ActiveTab = 'tracker' | 'pomodoro';

const Header: React.FC<{ activeTab: ActiveTab, onTabChange: (tab: ActiveTab) => void }> = ({ activeTab, onTabChange }) => (
    <header className="py-4 px-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">TimeWise AI</h1>
        <p className="text-md text-gray-400">Your AI-Powered Time Management Assistant</p>
        <nav className="mt-6 flex justify-center border-b border-gray-700">
            <button
                onClick={() => onTabChange('tracker')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'tracker' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                Time Tracker
            </button>
            <button
                onClick={() => onTabChange('pomodoro')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'pomodoro' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                Pomodoro Timer
            </button>
        </nav>
    </header>
);

interface TimeEntryFormProps {
    categories: TimeCategory[];
    onAddEntry: (entry: Omit<TimeEntry, 'id' | 'date'>) => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ categories, onAddEntry }) => {
    const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
    const [duration, setDuration] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !duration) {
            alert("Please select a category and enter a duration.");
            return;
        }
        onAddEntry({
            categoryId,
            durationMinutes: parseInt(duration, 10),
            description,
        });
        setDuration('');
        setDescription('');
    };
    
    return (
        <Card>
            <CardHeader>
                <ClockIcon className="w-6 h-6 text-blue-400" />
                <CardTitle>Log Your Time</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white">
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration (minutes)</label>
                    <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 block w-full text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white" placeholder="e.g., 60"/>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description (optional)</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white" placeholder="What did you work on?"></textarea>
                </div>
                <Button type="submit" className="w-full justify-center">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Entry
                </Button>
            </form>
        </Card>
    );
};

const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
};

interface TimeLogProps {
    entries: TimeEntry[];
    categories: TimeCategory[];
    onDeleteEntry: (id: number) => void;
}

const TimeLog: React.FC<TimeLogProps> = ({ entries, categories, onDeleteEntry }) => (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {entries.length > 0 ? entries.sort((a,b) => b.id - a.id).map(entry => {
                const category = categories.find(c => c.id === entry.categoryId);
                return (
                    <div key={entry.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
                        <div>
                            <span className="font-bold" style={{color: category?.color}}>{category?.name || 'Unknown'}</span>
                            <p className="text-sm text-gray-400">{entry.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-200">{formatDuration(entry.durationMinutes)}</span>
                             <button onClick={() => onDeleteEntry(entry.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                );
            }) : <p className="text-gray-400">No entries yet. Add one above!</p>}
        </div>
    </Card>
);

interface AiInsightsProps {
    analysis: AIAnalysis | null;
    isLoading: boolean;
    error: string | null;
    onGetAnalysis: () => void;
}

const AiInsights: React.FC<AiInsightsProps> = ({ analysis, isLoading, error, onGetAnalysis }) => (
    <Card>
        <CardHeader>
            <LightbulbIcon className="w-6 h-6 text-yellow-400" />
            <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <div className="space-y-4">
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            {analysis ? (
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-gray-200 mb-2">Key Insights:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {analysis.insights.map((insight, i) => <li key={`insight-${i}`}>{insight}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-200 mb-2">Suggestions:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {analysis.suggestions.map((suggestion, i) => <li key={`suggestion-${i}`}>{suggestion}</li>)}
                        </ul>
                    </div>
                </div>
            ) : (
                <p className="text-gray-400">Click the button to get your personalized time analysis and suggestions from TimeWise AI.</p>
            )}
            <Button onClick={onGetAnalysis} isLoading={isLoading} className="w-full justify-center bg-purple-600 hover:bg-purple-700">
                {isLoading ? 'Analyzing...' : 'Generate AI Analysis'}
            </Button>
        </div>
    </Card>
);

const TrackerView: React.FC = () => {
     const [categories] = useState<TimeCategory[]>(DEFAULT_CATEGORIES);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
        try {
            const savedEntries = localStorage.getItem('timeWiseAiEntries');
            if (savedEntries) {
                const parsedEntries = JSON.parse(savedEntries);
                if (Array.isArray(parsedEntries)) {
                    return parsedEntries;
                }
            }
        } catch (error) {
            console.error("Error reading time entries from localStorage", error);
        }
        return MOCK_TIME_ENTRIES;
    });
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem('timeWiseAiEntries', JSON.stringify(timeEntries));
        } catch (error) {
            console.error("Error saving time entries to localStorage", error);
        }
    }, [timeEntries]);

    const handleAddEntry = useCallback((newEntry: Omit<TimeEntry, 'id' | 'date'>) => {
        setTimeEntries(prev => [...prev, { ...newEntry, id: Date.now(), date: new Date().toISOString() }]);
    }, []);

    const handleDeleteEntry = useCallback((id: number) => {
        setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    }, []);

    const handleGetAIAnalysis = useCallback(async () => {
        setIsLoadingAI(true);
        setAiError(null);
        setAiAnalysis(null);
        try {
            const analysisResult = await analyzeTimeData(timeEntries, categories);
            setAiAnalysis(analysisResult);
        } catch (error) {
            setAiError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsLoadingAI(false);
        }
    }, [timeEntries, categories]);

    const chartData = useMemo<ChartData[]>(() => {
        const aggregated: { [key: string]: number } = {};
        timeEntries.forEach(entry => {
            aggregated[entry.categoryId] = (aggregated[entry.categoryId] || 0) + entry.durationMinutes;
        });

        return Object.keys(aggregated).map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return {
                name: category?.name || 'Unknown',
                value: aggregated[categoryId],
                color: category?.color || '#8884d8',
            };
        });
    }, [timeEntries, categories]);

    return (
        <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <TimeEntryForm categories={categories} onAddEntry={handleAddEntry} />
                <TimeLog entries={timeEntries} categories={categories} onDeleteEntry={handleDeleteEntry} />
            </div>
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <PieChartIcon className="w-6 h-6 text-green-400" />
                        <CardTitle>Time Distribution</CardTitle>
                    </CardHeader>
                    <TimeDistributionChart data={chartData} />
                </Card>
                <AiInsights analysis={aiAnalysis} isLoading={isLoadingAI} error={aiError} onGetAnalysis={handleGetAIAnalysis} />
            </div>
        </main>
    );
}

export default function App() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');
    
    return (
        <div className="min-h-screen bg-gray-900 bg-grid-gray-700/[0.2]">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 'tracker' ? (
                <TrackerView />
            ) : (
                <main className="container mx-auto px-4 py-8">
                    <PomodoroTimer />
                </main>
            )}
        </div>
    );
}
