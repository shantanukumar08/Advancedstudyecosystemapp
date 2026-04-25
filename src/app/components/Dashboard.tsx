import { motion } from 'motion/react';
import { Clock, BookOpen, Target, TrendingUp, Brain, Flame } from 'lucide-react';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface DashboardProps {
  studyEntries: any[];
  goals: any[];
  streak: number;
  userLevel: number;
  userXP: number;
  appMode?: string;
}

export default function Dashboard({ studyEntries, goals, streak, userLevel, userXP, appMode }: DashboardProps) {
  const todayEntries = studyEntries.filter((entry) => isToday(new Date(entry.date)));
  const thisWeekEntries = studyEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek(new Date()) && entryDate <= endOfWeek(new Date());
  });

  const todayHours = todayEntries.reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);
  const weekHours = thisWeekEntries.reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);

  const pendingDPPs = studyEntries.filter((entry) => !entry.dppCompleted).length;

  const subjectStats = studyEntries.reduce((acc, entry) => {
    if (!acc[entry.subject]) {
      acc[entry.subject] = { hours: 0, sessions: 0 };
    }
    acc[entry.subject].hours += (entry.lectureTime + entry.practiceTime) / 60;
    acc[entry.subject].sessions += 1;
    return acc;
  }, {} as Record<string, { hours: number; sessions: number }>);

  const stats = [
    {
      label: 'Today',
      value: todayHours.toFixed(1),
      unit: 'hrs',
      icon: Clock,
      color: 'from-primary to-cyan-400',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'This Week',
      value: weekHours.toFixed(1),
      unit: 'hrs',
      icon: TrendingUp,
      color: 'from-accent to-orange-400',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Pending DPPs',
      value: pendingDPPs,
      unit: 'tasks',
      icon: BookOpen,
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      label: 'Active Goals',
      value: goals.length,
      unit: 'goals',
      icon: Target,
      color: 'from-green-400 to-emerald-400',
      bgColor: 'bg-green-400/10',
    },
  ];

  return (
    <div className="min-h-full p-6 pb-20">
      {/* Hero Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            COMMAND CENTER
          </h1>
          {appMode && (
            <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-xs font-medium text-primary">{appMode}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={`${stat.bgColor} border border-border rounded-xl p-5 hover:scale-105 transition-transform cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Streak & Level Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-accent/20 to-orange-500/20 border border-accent/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-accent" />
            <h3 className="text-lg">Fire Streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-mono text-accent">{streak}</span>
            <span className="text-lg text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Keep the momentum going!</p>
        </div>

        {/* Level Card */}
        <div className="bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-lg">Level Progress</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-bold font-mono text-primary">{userLevel}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{userXP} XP</span>
              <span>{userLevel * 1000} XP</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${(userXP / (userLevel * 1000)) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subject Breakdown */}
      {Object.keys(subjectStats).length > 0 && (
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(subjectStats)
              .sort((a, b) => b[1].hours - a[1].hours)
              .map(([subject, stats], index) => {
                const maxHours = Math.max(...Object.values(subjectStats).map((s) => s.hours));
                const percentage = (stats.hours / maxHours) * 100;
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{subject}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {stats.hours.toFixed(1)}h · {stats.sessions} sessions
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {todayEntries.length > 0 && (
        <motion.div
          className="mt-8 bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg mb-4">Today's Activity</h3>
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <div className="text-sm font-medium">{entry.subject}</div>
                  <div className="text-xs text-muted-foreground">{entry.chapter}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-primary font-mono">
                    {((entry.lectureTime + entry.practiceTime) / 60).toFixed(1)}h
                  </div>
                  {entry.dppCompleted && <div className="text-xs text-green-400">✓ DPP</div>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {studyEntries.length === 0 && (
        <motion.div
          className="mt-8 bg-card border border-border rounded-xl p-12 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl mb-2">Start Your {appMode || 'Study'} Journey</h3>
          <p className="text-muted-foreground mb-2">No study sessions recorded yet for {appMode || 'this'} mode.</p>
          <p className="text-sm text-muted-foreground">Add your first entry to begin tracking!</p>
          {appMode && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30 inline-block">
              <p className="text-xs text-primary">
                💡 Tip: Each mode ({appMode}, JEE, NEET, etc.) has separate data. Switch modes in Settings.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
