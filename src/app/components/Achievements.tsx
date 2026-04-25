import { motion } from 'motion/react';
import { Trophy, Lock, Star, Zap, Target, Flame, BookOpen, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface AchievementsProps {
  achievements: any[];
  setAchievements: (achievements: any[]) => void;
  studyEntries: any[];
  streak: number;
  userLevel: number;
  addXP: (amount: number) => void;
}

export default function Achievements({
  achievements,
  setAchievements,
  studyEntries,
  streak,
  userLevel,
  addXP,
}: AchievementsProps) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  const defaultAchievements = [
    { id: 'first-session', title: 'First Steps', description: 'Complete your first study session', icon: '🎯', xp: 100, condition: () => studyEntries.length >= 1 },
    { id: '10-sessions', title: 'Dedicated', description: 'Complete 10 study sessions', icon: '📚', xp: 200, condition: () => studyEntries.length >= 10 },
    { id: '50-sessions', title: 'Committed', description: 'Complete 50 study sessions', icon: '🏆', xp: 500, condition: () => studyEntries.length >= 50 },
    { id: 'week-streak', title: 'Week Warrior', description: '7 day study streak', icon: '🔥', xp: 300, condition: () => streak >= 7 },
    { id: 'month-streak', title: 'Month Master', description: '30 day study streak', icon: '⚡', xp: 1000, condition: () => streak >= 30 },
    { id: '10-hours', title: 'Marathon', description: 'Study 10+ hours in a week', icon: '⏰', xp: 250, condition: () => {
      const totalHours = studyEntries.slice(0, 7).reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);
      return totalHours >= 10;
    }},
    { id: '10-dpps', title: 'DPP Champion', description: 'Complete 10 DPPs', icon: '✅', xp: 300, condition: () => studyEntries.filter(e => e.dppCompleted).length >= 10 },
    { id: 'level-5', title: 'Rising Star', description: 'Reach Level 5', icon: '⭐', xp: 500, condition: () => userLevel >= 5 },
    { id: 'level-10', title: 'Expert', description: 'Reach Level 10', icon: '💎', xp: 1000, condition: () => userLevel >= 10 },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on a test', icon: '💯', xp: 400, condition: () => studyEntries.some(e => e.score === 100) },
    { id: 'all-subjects', title: 'Well-Rounded', description: 'Study all 5 core subjects', icon: '🌟', xp: 350, condition: () => {
      const subjects = new Set(studyEntries.map(e => e.subject));
      return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'].every(s => subjects.has(s));
    }},
    { id: 'night-owl', title: 'Night Owl', description: 'Study past midnight', icon: '🦉', xp: 150, condition: () => studyEntries.some(e => new Date(e.date).getHours() >= 0 && new Date(e.date).getHours() < 5) },
  ];

  useEffect(() => {
    const updatedAchievements = defaultAchievements.map((achv) => {
      const existing = achievements.find((a) => a.id === achv.id);
      const isUnlocked = achv.condition();

      if (existing) {
        return existing;
      }

      return {
        id: achv.id,
        title: achv.title,
        description: achv.description,
        icon: achv.icon,
        xp: achv.xp,
        unlocked: isUnlocked,
        unlockedDate: isUnlocked ? new Date().toISOString() : undefined,
      };
    });

    const newUnlocks = updatedAchievements.filter((achv) => {
      const existing = achievements.find((a) => a.id === achv.id);
      return achv.unlocked && (!existing || !existing.unlocked);
    });

    if (newUnlocks.length > 0) {
      setAchievements(updatedAchievements);
      newUnlocks.forEach((achv) => {
        setNewlyUnlocked((prev) => [...prev, achv.id]);
        addXP(achv.xp);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });

      setTimeout(() => {
        setNewlyUnlocked([]);
      }, 3000);
    } else if (achievements.length === 0) {
      setAchievements(updatedAchievements);
    }
  }, [studyEntries, streak, userLevel]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = defaultAchievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Achievements</h1>
          <p className="text-muted-foreground text-sm">Unlock rewards and level up</p>
        </div>

        {/* Progress Overview */}
        <motion.div
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <div className="text-2xl font-bold font-mono">
                {unlockedCount} / {totalCount}
              </div>
            </div>
            <div className="text-4xl font-bold font-mono text-primary">{completionPercentage.toFixed(0)}%</div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const isNewlyUnlocked = newlyUnlocked.includes(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                className={`relative bg-card border rounded-xl p-6 ${
                  achievement.unlocked
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border opacity-60'
                } ${isNewlyUnlocked ? 'ring-2 ring-primary animate-pulse' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: achievement.unlocked ? 1.02 : 1 }}
              >
                {!achievement.unlocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`text-4xl ${
                      achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-30'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium mb-1 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${achievement.unlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-mono">{achievement.xp} XP</span>
                    </div>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {isNewlyUnlocked && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-accent text-black text-xs font-bold px-2 py-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    NEW!
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          className="mt-8 bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-primary">{studyEntries.length}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-accent">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-green-400">{studyEntries.filter(e => e.dppCompleted).length}</div>
              <div className="text-xs text-muted-foreground">DPPs Done</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-yellow-400">{userLevel}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
