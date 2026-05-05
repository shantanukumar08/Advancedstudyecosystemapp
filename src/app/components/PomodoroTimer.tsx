import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load saved stats
    const saved = localStorage.getItem('pomodoroStats');
    if (saved) {
      const stats = JSON.parse(saved);
      setSessionsCompleted(stats.sessions || 0);
      setTotalFocusMinutes(stats.totalMinutes || 0);
    }

    // Create notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (!isBreak) {
      // Focus session complete
      const newSessions = sessionsCompleted + 1;
      const newTotalMinutes = totalFocusMinutes + focusTime;

      setSessionsCompleted(newSessions);
      setTotalFocusMinutes(newTotalMinutes);

      localStorage.setItem('pomodoroStats', JSON.stringify({
        sessions: newSessions,
        totalMinutes: newTotalMinutes,
      }));

      toast.success('Focus session complete!', {
        description: 'Time for a break 🎉',
      });

      // Switch to break
      setIsBreak(true);
      setMinutes(breakTime);
      setSeconds(0);
    } else {
      // Break complete
      toast.success('Break over!', {
        description: 'Ready for another focus session?',
      });

      setIsBreak(false);
      setMinutes(focusTime);
      setSeconds(0);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setMinutes(focusTime);
    setSeconds(0);
  };

  const handleSettingsSave = () => {
    setMinutes(focusTime);
    setSeconds(0);
    setIsBreak(false);
    setShowSettings(false);
    toast.success('Settings saved!');
  };

  const progress = isBreak
    ? ((breakTime * 60 - (minutes * 60 + seconds)) / (breakTime * 60)) * 100
    : ((focusTime * 60 - (minutes * 60 + seconds)) / (focusTime * 60)) * 100;

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 tracking-tight">Pomodoro Timer</h1>
            <p className="text-muted-foreground text-sm">Focus with 25-min sessions</p>
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="icon"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h3 className="text-lg mb-4">Timer Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusTime">Focus Time (minutes)</Label>
                <Input
                  id="focusTime"
                  type="number"
                  value={focusTime}
                  onChange={(e) => setFocusTime(parseInt(e.target.value) || 25)}
                  min="1"
                  max="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakTime">Break Time (minutes)</Label>
                <Input
                  id="breakTime"
                  type="number"
                  value={breakTime}
                  onChange={(e) => setBreakTime(parseInt(e.target.value) || 5)}
                  min="1"
                  max="30"
                />
              </div>
            </div>
            <Button onClick={handleSettingsSave} className="w-full mt-4 bg-primary hover:bg-primary/90 text-black">
              Save Settings
            </Button>
          </motion.div>
        )}

        {/* Main Timer */}
        <div className={`bg-gradient-to-br ${isBreak ? 'from-green-400/20 to-cyan-400/20 border-green-400/30' : 'from-primary/20 to-accent/20 border-primary/30'} border rounded-xl p-12`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {isBreak ? (
                <>
                  <Coffee className="w-8 h-8 text-green-400" />
                  <h2 className="text-2xl text-green-400">Break Time</h2>
                </>
              ) : (
                <>
                  <Brain className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl text-primary">Focus Session</h2>
                </>
              )}
            </div>

            {/* Timer Display */}
            <div className="text-8xl font-mono font-bold mb-8">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-secondary rounded-full overflow-hidden mb-8">
              <motion.div
                className={`h-full ${isBreak ? 'bg-gradient-to-r from-green-400 to-cyan-400' : 'bg-gradient-to-r from-primary to-accent'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black font-medium"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="outline">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}

              <Button onClick={handleReset} size="lg" variant="outline">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-2">Sessions Today</div>
            <div className="text-4xl font-bold font-mono text-primary">{sessionsCompleted}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Focus Time</div>
            <div className="text-4xl font-bold font-mono text-accent">{totalFocusMinutes}m</div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-xl">
          <h4 className="text-sm font-medium mb-2 text-primary">Pomodoro Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Work for 25 minutes without interruptions</li>
            <li>Take a 5-minute break after each session</li>
            <li>After 4 sessions, take a longer 15-30 min break</li>
            <li>Turn off all notifications during focus time</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
