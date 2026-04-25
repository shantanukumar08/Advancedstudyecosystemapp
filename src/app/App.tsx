import { useState, useEffect } from 'react';
import { Menu, X, Home, BookOpen, RotateCcw, Target, Calendar as CalendarIcon, BarChart3, Brain, Trophy, FileText, Settings, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import Dashboard from './components/Dashboard';
import StudyEntry from './components/StudyEntry';
import RevisionSystem from './components/RevisionSystem';
import GoalsTracker from './components/GoalsTracker';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import SmartPlanner from './components/SmartPlanner';
import Achievements from './components/Achievements';
import NotesAndMistakes from './components/NotesAndMistakes';
import SettingsPanel from './components/SettingsPanel';
import ExportData from './components/ExportData';
import AutoSync from './components/AutoSync';

interface StudyEntry {
  id: string;
  date: string;
  subject: string;
  chapter: string;
  topic: string;
  lectureTime: number;
  practiceTime: number;
  dppCompleted: boolean;
  revisionsDone: number;
  score?: number;
  notes?: string;
  mistakes?: string[];
  focusScore?: number;
}

interface Goal {
  id: string;
  subject: string;
  type: 'weekly' | 'monthly' | 'custom';
  targetHours: number;
  currentHours: number;
  deadline?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  icon: string;
  xp: number;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [appMode, setAppMode] = useState<string>(localStorage.getItem('appMode') || 'JEE');
  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [streak, setStreak] = useState(0);

  // Get mode-specific localStorage keys
  const getStorageKey = (key: string) => `${appMode}_${key}`;

  // Load data from localStorage on mount and when mode changes
  useEffect(() => {
    const savedEntries = localStorage.getItem(getStorageKey('studyEntries'));
    const savedGoals = localStorage.getItem(getStorageKey('goals'));
    const savedAchievements = localStorage.getItem(getStorageKey('achievements'));
    const savedUserLevel = localStorage.getItem(getStorageKey('userLevel'));
    const savedUserXP = localStorage.getItem(getStorageKey('userXP'));
    const savedStreak = localStorage.getItem(getStorageKey('streak'));

    if (savedEntries) setStudyEntries(JSON.parse(savedEntries));
    else setStudyEntries([]);

    if (savedGoals) setGoals(JSON.parse(savedGoals));
    else setGoals([]);

    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    else setAchievements([]);

    if (savedUserLevel) setUserLevel(parseInt(savedUserLevel));
    else setUserLevel(1);

    if (savedUserXP) setUserXP(parseInt(savedUserXP));
    else setUserXP(0);

    if (savedStreak) setStreak(parseInt(savedStreak));
    else setStreak(0);
  }, [appMode]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(getStorageKey('studyEntries'), JSON.stringify(studyEntries));
    localStorage.setItem(getStorageKey('goals'), JSON.stringify(goals));
    localStorage.setItem(getStorageKey('achievements'), JSON.stringify(achievements));
    localStorage.setItem(getStorageKey('userLevel'), userLevel.toString());
    localStorage.setItem(getStorageKey('userXP'), userXP.toString());
    localStorage.setItem(getStorageKey('streak'), streak.toString());
  }, [studyEntries, goals, achievements, userLevel, userXP, streak, appMode]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setCurrentView(event.state.view);
      } else if (currentView !== 'dashboard') {
        setCurrentView('dashboard');
      } else {
        // If already on dashboard, let browser handle (close app)
        window.history.back();
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize history state
    if (!window.history.state) {
      window.history.replaceState({ view: 'dashboard' }, '', '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentView]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'study', label: 'Study Entry', icon: BookOpen },
    { id: 'revision', label: 'Revision System', icon: RotateCcw },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'planner', label: 'Smart Planner', icon: Brain },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'notes', label: 'Notes & Mistakes', icon: FileText },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (viewId: string) => {
    setCurrentView(viewId);
    setMenuOpen(false);
    // Push state to history so back button works
    window.history.pushState({ view: viewId }, '', '');
  };

  const handleModeChange = (newMode: string) => {
    setAppMode(newMode);
    localStorage.setItem('appMode', newMode);
    toast.success(`Switched to ${newMode} mode`, {
      description: 'Your data is saved separately for each mode',
    });
  };

  const addXP = (amount: number) => {
    const newXP = userXP + amount;
    const xpForNextLevel = userLevel * 1000;

    if (newXP >= xpForNextLevel) {
      setUserLevel(userLevel + 1);
      setUserXP(newXP - xpForNextLevel);
      toast.success(`Level Up! You're now Level ${userLevel + 1}!`, {
        duration: 3000,
      });
    } else {
      setUserXP(newXP);
    }
  };

  const renderView = () => {
    const props = {
      studyEntries,
      setStudyEntries,
      goals,
      setGoals,
      achievements,
      setAchievements,
      addXP,
      streak,
      setStreak,
      userLevel,
      userXP,
      appMode,
      setAppMode: handleModeChange,
    };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'study':
        return <StudyEntry {...props} />;
      case 'revision':
        return <RevisionSystem {...props} />;
      case 'goals':
        return <GoalsTracker {...props} />;
      case 'calendar':
        return <CalendarView {...props} />;
      case 'analytics':
        return <Analytics {...props} />;
      case 'planner':
        return <SmartPlanner {...props} />;
      case 'achievements':
        return <Achievements {...props} />;
      case 'notes':
        return <NotesAndMistakes {...props} />;
      case 'export':
        return <ExportData {...props} />;
      case 'settings':
        return <SettingsPanel {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="size-full bg-background text-foreground overflow-hidden">
      <Toaster position="top-center" theme="dark" />

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </motion.button>

          {/* Mode Badge */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:block">
            <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-xs font-medium text-primary">{appMode} Mode</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-muted-foreground">Level {userLevel}</div>
              <div className="text-xs text-primary font-mono">{userXP}/{userLevel * 1000} XP</div>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
              <span className="text-2xl">🔥</span>
              <span className="font-mono text-lg text-accent">{streak}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">day streak</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="h-1 bg-secondary">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(userXP / (userLevel * 1000)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.header>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="fixed top-0 left-0 bottom-0 w-80 bg-card border-r border-border z-50 overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-xl tracking-wide">STUDY COMMAND</h2>
                    <p className="text-xs text-muted-foreground font-mono">Mission Control</p>
                  </div>
                </div>

                {/* Mode Selector in Menu */}
                <div className="mb-6 p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-2">Active Mode</div>
                  <div className="text-sm font-medium text-primary">{appMode}</div>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          currentView === item.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'hover:bg-secondary/50 text-foreground'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ x: 4 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium tracking-wide">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-8 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Your Progress</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>Mode: {appMode}</div>
                    <div>Level: {userLevel}</div>
                    <div>XP: {userXP}/{userLevel * 1000}</div>
                    <div>Streak: {streak} days</div>
                    <div>Total Sessions: {studyEntries.length}</div>
                  </div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20 h-full overflow-auto">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </main>

      {/* Auto Sync Component */}
      <AutoSync
        studyEntries={studyEntries}
        goals={goals}
        appMode={appMode}
        userLevel={userLevel}
        userXP={userXP}
        streak={streak}
      />
    </div>
  );
}
