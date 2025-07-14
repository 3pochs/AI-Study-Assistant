import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1);
      toast({
        title: "Work Session Complete!",
        description: "Great job! Time for a break.",
      });
      
      // Switch to break
      const breakTime = sessionCount % 4 === 3 ? 15 * 60 : 5 * 60; // Long break every 4 sessions
      setTimeLeft(breakTime);
      setSessionType('break');
      onSessionComplete?.();
    } else {
      toast({
        title: "Break Complete!",
        description: "Ready to get back to learning?",
      });
      
      // Switch back to work
      setTimeLeft(25 * 60);
      setSessionType('work');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <Card className="bg-bio-card border-bio-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Timer size={16} className="text-primary" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-2xl font-mono font-bold mb-2 ${
            sessionType === 'work' ? 'text-primary' : 'text-blue-400'
          }`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className={`text-xs font-medium mb-3 ${
            sessionType === 'work' ? 'text-primary' : 'text-blue-400'
          }`}>
            {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-bio-border rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                sessionType === 'work' ? 'bg-primary' : 'bg-blue-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={toggleTimer}
            size="sm"
            className={`flex-1 ${
              sessionType === 'work' 
                ? 'bg-primary hover:bg-primary-glow' 
                : 'bg-blue-500 hover:bg-blue-400'
            }`}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
            className="border-bio-border hover:bg-bio-border"
          >
            <RotateCcw size={14} />
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Sessions completed: {sessionCount}
        </div>
      </CardContent>
    </Card>
  );
}