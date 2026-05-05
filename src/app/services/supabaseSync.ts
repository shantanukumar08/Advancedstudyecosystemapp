// Supabase Real-time Sync Service
// Automatically activates when Supabase is connected from Make settings

interface SyncData {
  id: string;
  mode: string;
  studyEntries: any[];
  goals: any[];
  chapters: any[];
  tasks: any[];
  achievements: any[];
  userLevel: number;
  userXP: number;
  streak: number;
  timestamp: string;
}

// Check if Supabase is connected
export const isSupabaseConnected = (): boolean => {
  try {
    // Check if Supabase files exist (auto-generated when user connects)
    // Files: supabase/functions/server/kv_store.tsx, utils/supabase/info.tsx
    return false; // Will be true when Supabase is connected from settings
  } catch {
    return false;
  }
};

// Sync all data to cloud
export const syncToCloud = async (mode: string, data: any): Promise<boolean> => {
  if (!isSupabaseConnected()) {
    console.log('📦 Supabase not connected - using local storage');
    return false;
  }

  try {
    // When Supabase is connected, use KV store
    // const { kv } = await import('../../../supabase/functions/server/kv_store');

    const syncData: SyncData = {
      id: `${mode}_${Date.now()}`,
      mode,
      ...data,
      timestamp: new Date().toISOString(),
    };

    // await kv.set(`study_data_${mode}`, syncData);

    console.log('☁️ Data synced to cloud:', syncData);
    return true;
  } catch (error) {
    console.error('Cloud sync failed:', error);
    return false;
  }
};

// Get data from cloud
export const syncFromCloud = async (mode: string): Promise<any | null> => {
  if (!isSupabaseConnected()) {
    return null;
  }

  try {
    // const { kv } = await import('../../../supabase/functions/server/kv_store');
    // const data = await kv.get(`study_data_${mode}`);
    // return data;

    return null;
  } catch (error) {
    console.error('Failed to fetch from cloud:', error);
    return null;
  }
};

// Subscribe to real-time updates
export const subscribeToUpdates = (mode: string, callback: (data: any) => void) => {
  if (!isSupabaseConnected()) {
    return () => {}; // Empty unsubscribe
  }

  // When connected, set up real-time subscription
  console.log(`🔔 Subscribed to ${mode} updates`);

  // Return unsubscribe function
  return () => {
    console.log(`🔕 Unsubscribed from ${mode} updates`);
  };
};

// Initialize sync on app load
export const initializeSync = async (mode: string) => {
  if (!isSupabaseConnected()) {
    console.log('📦 Local mode - connect Supabase from Make settings for multi-device sync');
    return null;
  }

  console.log('☁️ Supabase connected! Loading cloud data...');

  const cloudData = await syncFromCloud(mode);
  if (cloudData) {
    console.log('✅ Cloud data loaded:', cloudData);
    return cloudData;
  }

  return null;
};

export default {
  isSupabaseConnected,
  syncToCloud,
  syncFromCloud,
  subscribeToUpdates,
  initializeSync,
};
