import { motion } from 'motion/react';
import { Settings, Trash2, AlertTriangle, Database, Palette, Cloud } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SettingsPanelProps {
  setStudyEntries: (entries: any[]) => void;
  setGoals: (goals: any[]) => void;
  setAchievements: (achievements: any[]) => void;
  setStreak: (streak: number) => void;
  studyEntries: any[];
  goals: any[];
  appMode: string;
  setAppMode: (mode: string) => void;
}

export default function SettingsPanel({
  setStudyEntries,
  setGoals,
  setAchievements,
  setStreak,
  studyEntries,
  goals,
  appMode,
  setAppMode,
}: SettingsPanelProps) {
  const [customSubjects, setCustomSubjects] = useState(localStorage.getItem('customSubjects') || '');

  const handleResetAll = () => {
    const currentMode = appMode;
    // Only clear data for current mode
    const keysToRemove = [
      `${currentMode}_studyEntries`,
      `${currentMode}_goals`,
      `${currentMode}_achievements`,
      `${currentMode}_userLevel`,
      `${currentMode}_userXP`,
      `${currentMode}_streak`,
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
    setStudyEntries([]);
    setGoals([]);
    setAchievements([]);
    setStreak(0);
    toast.success(`All ${currentMode} mode data has been reset`);
  };

  const handleClearEntries = () => {
    setStudyEntries([]);
    localStorage.removeItem(`${appMode}_studyEntries`);
    toast.success(`${appMode} study entries cleared`);
  };

  const handleClearGoals = () => {
    setGoals([]);
    localStorage.removeItem(`${appMode}_goals`);
    toast.success(`${appMode} goals cleared`);
  };

  const handleExportBackup = () => {
    const backup = {
      mode: appMode,
      studyEntries,
      goals,
      streak: localStorage.getItem(`${appMode}_streak`),
      userLevel: localStorage.getItem(`${appMode}_userLevel`),
      userXP: localStorage.getItem(`${appMode}_userXP`),
      achievements: localStorage.getItem(`${appMode}_achievements`),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-tracker-${appMode}-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${appMode} mode backup downloaded`);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        const targetMode = backup.mode || appMode;

        if (backup.studyEntries) {
          setStudyEntries(backup.studyEntries);
          localStorage.setItem(`${targetMode}_studyEntries`, JSON.stringify(backup.studyEntries));
        }
        if (backup.goals) {
          setGoals(backup.goals);
          localStorage.setItem(`${targetMode}_goals`, JSON.stringify(backup.goals));
        }
        if (backup.streak) {
          setStreak(parseInt(backup.streak));
          localStorage.setItem(`${targetMode}_streak`, backup.streak);
        }
        if (backup.achievements) localStorage.setItem(`${targetMode}_achievements`, backup.achievements);
        if (backup.userLevel) localStorage.setItem(`${targetMode}_userLevel`, backup.userLevel);
        if (backup.userXP) localStorage.setItem(`${targetMode}_userXP`, backup.userXP);

        toast.success(`${targetMode} mode backup restored successfully`, {
          description: 'All data has been imported',
        });

        // Force page reload to ensure all components update
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error('Failed to restore backup', {
          description: 'Please check if the file is valid',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleAutoRestoreFromLocalStorage = () => {
    try {
      const lastBackup = localStorage.getItem(`lastBackup_${appMode}`);
      if (lastBackup) {
        const backup = JSON.parse(lastBackup);

        if (backup.studyEntries) setStudyEntries(backup.studyEntries);
        if (backup.goals) setGoals(backup.goals);
        if (backup.streak) setStreak(parseInt(backup.streak));

        toast.success('Auto-backup restored!', {
          description: `Loaded last saved ${appMode} data`,
        });
      } else {
        toast.info('No auto-backup found', {
          description: `No saved backup for ${appMode} mode`,
        });
      }
    } catch (error) {
      toast.error('Failed to restore auto-backup');
    }
  };

  const dataStats = {
    totalEntries: studyEntries.length,
    totalGoals: goals.length,
    storageUsed: new Blob([JSON.stringify({ studyEntries, goals })]).size,
  };

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your app preferences</p>
        </div>

        {/* App Mode Selection */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg">Study Mode</h3>
          </div>
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary">
              💡 Each mode saves data separately. Switch modes to track different exams independently.
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Select your exam preparation focus</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['JEE', 'NEET', 'UPSC', 'Board', 'Custom'].map((mode) => (
              <button
                key={mode}
                onClick={() => setAppMode(mode)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  appMode === mode
                    ? 'bg-primary text-black'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {appMode === 'Custom' && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="custom-subjects">Custom Subjects (comma-separated)</Label>
              <Input
                id="custom-subjects"
                value={customSubjects}
                onChange={(e) => {
                  setCustomSubjects(e.target.value);
                  localStorage.setItem('customSubjects', e.target.value);
                }}
                placeholder="e.g., History, Geography, Economics"
              />
            </div>
          )}
        </motion.div>

        {/* Data Management */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg">Data Management</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-primary">{dataStats.totalEntries}</div>
              <div className="text-xs text-muted-foreground">Study Entries</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-accent">{dataStats.totalGoals}</div>
              <div className="text-xs text-muted-foreground">Active Goals</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-green-400">
                {(dataStats.storageUsed / 1024).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">KB Used</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleExportBackup} className="w-full bg-primary hover:bg-primary/90 text-black">
              Export Backup
            </Button>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                id="import-backup"
              />
              <label htmlFor="import-backup" className="block">
                <Button variant="outline" className="w-full" asChild>
                  <span>Import from File</span>
                </Button>
              </label>
            </div>

            <Button onClick={handleAutoRestoreFromLocalStorage} variant="outline" className="w-full">
              Restore Auto-Backup
            </Button>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-green-400/10 border border-green-400/30">
            <p className="text-xs text-green-400">
              ✅ Auto-backup runs every 5 minutes and saves to your downloads folder
            </p>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="bg-red-400/10 border border-red-400/30 rounded-xl p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg text-red-400">Danger Zone</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Irreversible actions - use with caution</p>

          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-400/50 text-red-400 hover:bg-red-400/10">
                  Clear Study Entries
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your study entries. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearEntries} className="bg-red-400 hover:bg-red-500">
                    Delete Entries
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-400/50 text-red-400 hover:bg-red-400/10">
                  Clear Goals
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your goals. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearGoals} className="bg-red-400 hover:bg-red-500">
                    Delete Goals
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-400/50 text-red-400 hover:bg-red-400/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>⚠️ Complete Reset</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete ALL data including study entries, goals, achievements, streak, and
                    level. This action CANNOT be undone. Make sure you've exported a backup first!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAll} className="bg-red-400 hover:bg-red-500">
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        {/* Supabase Cloud Sync Info */}
        <motion.div
          className="mt-6 bg-gradient-to-br from-green-400/10 to-cyan-400/10 border border-green-400/30 rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-green-400" />
            <h3 className="text-lg text-green-400">Multi-Device Sync</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enable real-time sync across all your devices by connecting Supabase
          </p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">One person adds entry → Everyone sees it instantly</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Access from phone, tablet, or computer</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Data backed up securely in the cloud</span>
            </div>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">📋 To enable cloud sync:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open Make settings page (top-right corner)</li>
              <li>Click "Connect Supabase"</li>
              <li>Create or connect your Supabase project</li>
              <li>Sync will activate automatically!</li>
            </ol>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
            <p className="text-xs text-yellow-400">
              ⚠️ Note: Make is not intended for collecting PII or highly sensitive personal data
            </p>
          </div>
        </motion.div>

        {/* Navigation & Features Info */}
        <motion.div
          className="mt-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            App Features
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <span className="text-primary font-medium">Back Button Navigation:</span>
                <span className="text-muted-foreground ml-1">
                  Press back to navigate between pages within the app
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <div>
                <span className="text-accent font-medium">Separate Mode Data:</span>
                <span className="text-muted-foreground ml-1">
                  Each study mode (JEE, NEET, Boards, etc.) has completely separate data storage
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <div>
                <span className="text-green-400 font-medium">Offline First:</span>
                <span className="text-muted-foreground ml-1">
                  All data is saved locally in your browser
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          className="mt-6 bg-card border border-border rounded-xl p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg mb-2">Study Command Center</h3>
          <p className="text-sm text-muted-foreground mb-1">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">Built for serious aspirants</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
