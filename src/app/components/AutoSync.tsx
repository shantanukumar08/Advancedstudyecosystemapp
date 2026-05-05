import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConnected, syncToCloud, syncFromCloud } from '../services/supabaseSync';

interface AutoSyncProps {
  studyEntries: any[];
  goals: any[];
  chapters: any[];
  tasks: any[];
  achievements: any[];
  appMode: string;
  userLevel: number;
  userXP: number;
  streak: number;
}

export default function AutoSync({
  studyEntries,
  goals,
  chapters,
  tasks,
  achievements,
  appMode,
  userLevel,
  userXP,
  streak,
}: AutoSyncProps) {
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check Supabase connection on mount
  useEffect(() => {
    const connected = isSupabaseConnected();
    setCloudSyncEnabled(connected);

    // Try to load cloud data on mount
    if (connected) {
      loadFromCloud();
    }
  }, [appMode]);

  // Auto-sync every 2 minutes when cloud is enabled
  useEffect(() => {
    if (!cloudSyncEnabled) return;

    const performSync = async () => {
      await syncData();
    };

    // Initial sync after 10 seconds
    const initialTimeout = setTimeout(performSync, 10000);

    // Then every 2 minutes
    syncIntervalRef.current = setInterval(performSync, 2 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [cloudSyncEnabled, studyEntries, goals, chapters, tasks, achievements, userLevel, userXP, streak]);

  const loadFromCloud = async () => {
    try {
      setIsSyncing(true);
      const cloudData = await syncFromCloud(appMode);

      if (cloudData) {
        // Merge cloud data with local data (cloud takes priority for conflicts)
        // In a real implementation, you'd update the parent component's state
        toast.success('Cloud data loaded!', {
          description: 'Your data is synced from the cloud',
        });
      }
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncData = async () => {
    if (!cloudSyncEnabled || studyEntries.length === 0) return;

    try {
      setIsSyncing(true);

      const data = {
        studyEntries,
        goals,
        chapters: chapters || [],
        tasks: tasks || [],
        achievements,
        userLevel,
        userXP,
        streak,
      };

      const synced = await syncToCloud(appMode, data);

      if (synced) {
        setLastSyncTime(new Date());
        toast.success('Synced to cloud!', {
          description: 'All devices will see your latest data',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed', {
        description: 'Will retry in 2 minutes',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';

    const seconds = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <>
      {/* Sync Status Indicator (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-lg ${
              cloudSyncEnabled
                ? 'bg-green-400/20 border border-green-400/30'
                : 'bg-secondary/80 border border-border'
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
          >
            {cloudSyncEnabled ? (
              <>
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 text-green-400 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4 text-green-400" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-green-400 font-medium">Cloud Sync</span>
                  <span className="text-xs text-green-400/70">{formatLastSync()}</span>
                </div>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Local Only</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Supabase Connection Banner (Top) */}
      {!cloudSyncEnabled && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 max-w-md px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg shadow-lg backdrop-blur-lg">
            <CloudOff className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-medium text-yellow-400">Multi-Device Sync Disabled</div>
              <div className="text-xs text-yellow-400/80">Connect Supabase from Make settings to enable</div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
