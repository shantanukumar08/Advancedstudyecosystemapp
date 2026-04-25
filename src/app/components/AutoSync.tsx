import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Upload, Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConnected, syncToCloud } from '../services/supabaseSync';

interface AutoSyncProps {
  studyEntries: any[];
  goals: any[];
  appMode: string;
  userLevel: number;
  userXP: number;
  streak: number;
}

export default function AutoSync({ studyEntries, goals, appMode, userLevel, userXP, streak }: AutoSyncProps) {
  const lastSyncRef = useRef<Date | null>(null);
  const autoExportIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  // Check Supabase connection on mount
  useEffect(() => {
    setCloudSyncEnabled(isSupabaseConnected());
  }, []);

  // Auto Export every 5 minutes
  useEffect(() => {
    const autoExport = async () => {
      if (studyEntries.length === 0) return;

      try {
        const data = {
          mode: appMode,
          studyEntries,
          goals,
          streak,
          userLevel,
          userXP,
          exportedAt: new Date().toISOString(),
          autoExport: true,
        };

        // Try cloud sync first if enabled
        if (cloudSyncEnabled) {
          const synced = await syncToCloud(appMode, data);
          if (synced) {
            lastSyncRef.current = new Date();
            toast.success('Synced to cloud!', {
              description: 'Your data is now available on all devices',
              duration: 2000,
            });
            return;
          }
        }

        // Fallback to local backup
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auto-backup-${appMode}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        lastSyncRef.current = new Date();

        // Store in localStorage as well
        localStorage.setItem('lastAutoBackup', new Date().toISOString());
        localStorage.setItem(`lastBackup_${appMode}`, JSON.stringify(data));

        toast.success('Auto-backup saved!', {
          description: 'Your data has been automatically backed up',
          duration: 2000,
        });
      } catch (error) {
        console.error('Auto export failed:', error);
      }
    };

    // Initial backup after 30 seconds
    const initialTimeout = setTimeout(autoExport, 30000);

    // Then every 5 minutes
    autoExportIntervalRef.current = setInterval(autoExport, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (autoExportIntervalRef.current) {
        clearInterval(autoExportIntervalRef.current);
      }
    };
  }, [studyEntries, goals, appMode, userLevel, userXP, streak]);

  return (
    <>
      {/* Sync Status Indicator */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {lastSyncRef.current && (
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {cloudSyncEnabled ? (
                <>
                  <Cloud className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">Cloud Synced</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Auto-backup active</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Supabase Status Banner */}
      {!cloudSyncEnabled && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg shadow-lg">
            <CloudOff className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400">
              Connect Supabase for multi-device sync
            </span>
          </div>
        </motion.div>
      )}
    </>
  );
}
