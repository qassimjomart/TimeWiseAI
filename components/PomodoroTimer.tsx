import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { PlayIcon, PauseIcon, RefreshCwIcon } from './icons';

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export const PomodoroTimer: React.FC = () => {
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
    const [isActive, setIsActive] = useState(false);
    const [pomodorosCompleted, setPomodorosCompleted] = useState(() => {
        try {
            const saved = localStorage.getItem('pomodorosCompleted');
            return saved ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    });

    const alarmSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem('pomodorosCompleted', pomodorosCompleted.toString());
        } catch (error) {
            console.error("Error saving pomodoros count to localStorage", error);
        }
    }, [pomodorosCompleted]);

    const switchMode = useCallback(() => {
        if (mode === 'pomodoro') {
            const newCompleted = pomodorosCompleted + 1;
            setPomodorosCompleted(newCompleted);
            if (newCompleted > 0 && newCompleted % 4 === 0) {
                setMode('longBreak');
                setTimeLeft(LONG_BREAK_TIME);
            } else {
                setMode('shortBreak');
                setTimeLeft(SHORT_BREAK_TIME);
            }
        } else {
            setMode('pomodoro');
            setTimeLeft(POMODORO_TIME);
        }
        setIsActive(false);
    }, [mode, pomodorosCompleted]);

    useEffect(() => {
        let interval: number | null = null;

        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            alarmSound.current?.play();
            switchMode();
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isActive, timeLeft, switchMode]);

    useEffect(() => {
        const modeText = mode === 'shortBreak' ? 'Short Break' : mode === 'longBreak' ? 'Long Break' : 'Pomodoro';
        document.title = `${formatTime(timeLeft)} - ${modeText} | TimeWise AI`;
    }, [timeLeft, mode]);

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        switch(mode) {
            case 'pomodoro': setTimeLeft(POMODORO_TIME); break;
            case 'shortBreak': setTimeLeft(SHORT_BREAK_TIME); break;
            case 'longBreak': setTimeLeft(LONG_BREAK_TIME); break;
        }
    };
    
    const selectMode = (newMode: TimerMode) => {
        setIsActive(false);
        setMode(newMode);
        switch (newMode) {
            case 'pomodoro': setTimeLeft(POMODORO_TIME); break;
            case 'shortBreak': setTimeLeft(SHORT_BREAK_TIME); break;
            case 'longBreak': setTimeLeft(LONG_BREAK_TIME); break;
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <audio ref={alarmSound} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto"></audio>
            <CardHeader className="justify-center">
                <CardTitle>Pomodoro Timer</CardTitle>
            </CardHeader>
            <div className="px-6">
                <div className="flex justify-center items-center space-x-1 bg-gray-900/50 p-1 rounded-lg">
                    <button onClick={() => selectMode('pomodoro')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'pomodoro' ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        Pomodoro
                    </button>
                    <button onClick={() => selectMode('shortBreak')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'shortBreak' ? 'bg-green-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        Short Break
                    </button>
                    <button onClick={() => selectMode('longBreak')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'longBreak' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                        Long Break
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="text-8xl font-bold tracking-tighter text-white">
                    {formatTime(timeLeft)}
                </div>
                <div className="flex items-center space-x-4">
                    <Button onClick={handleToggle} className={`w-32 justify-center !text-lg ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isActive ? <PauseIcon className="w-6 h-6 mr-2" /> : <PlayIcon className="w-6 h-6 mr-2" />}
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                    {/* FIX: Removed unsupported `variant` prop. The styling is handled by className. */}
                    <Button onClick={handleReset} className="w-32 justify-center !text-lg bg-gray-600 hover:bg-gray-700">
                        <RefreshCwIcon className="w-6 h-6 mr-2"/>
                        Reset
                    </Button>
                </div>
                 <div className="text-center text-gray-400">
                    <p>Completed Pomodoros: <span className="font-bold text-lg text-white">{pomodorosCompleted}</span></p>
                </div>
                 <div className="text-center text-gray-500 text-sm pt-4">
                    <p>Stay focused for 25 minutes, then take a short break.</p>
                    <p>After 4 pomodoros, take a longer break.</p>
                </div>
            </div>
        </Card>
    );
};