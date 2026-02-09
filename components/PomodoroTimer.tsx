
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
    const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

    const alarmSound = useRef<HTMLAudioElement | null>(null);

    const switchMode = useCallback(() => {
        if (mode === 'pomodoro') {
            const newCompleted = pomodorosCompleted + 1;
            setPomodorosCompleted(newCompleted);
            if (newCompleted % 4 === 0) {
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
        } else if (timeLeft === 0) {
            alarmSound.current?.play();
            switchMode();
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isActive, timeLeft, switchMode]);

    useEffect(() => {
        document.title = `${formatTime(timeLeft)} - ${mode === 'pomodoro' ? 'Work' : 'Break'} | TimeWise AI`;
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

    const getModeName = (m: TimerMode) => {
        if (m === 'pomodoro') return 'Pomodoro';
        if (m === 'shortBreak') return 'Short Break';
        return 'Long Break';
    }

    return (
        <Card className="max-w-md mx-auto">
            <audio ref={alarmSound} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto"></audio>
            <CardHeader className="justify-center">
                <CardTitle>{getModeName(mode)}</CardTitle>
            </CardHeader>
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="text-8xl font-bold tracking-tighter text-white">
                    {formatTime(timeLeft)}
                </div>
                <div className="flex items-center space-x-4">
                    <Button onClick={handleToggle} className="w-32 justify-center !text-lg" style={{backgroundColor: isActive ? '#f97316' : '#2563eb', hover: {backgroundColor: isActive ? '#ea580c' : '#1d4ed8' }}}>
                        {isActive ? <PauseIcon className="w-6 h-6 mr-2" /> : <PlayIcon className="w-6 h-6 mr-2" />}
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="w-32 justify-center !text-lg bg-gray-600 hover:bg-gray-700">
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
