import { motion } from 'motion/react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart as RechartsPie, Pie } from 'recharts';
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from 'date-fns';

interface AnalyticsProps {
  studyEntries: any[];
}

export default function Analytics({ studyEntries }: AnalyticsProps) {
  const thisWeek = eachDayOfInterval({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) });

  const weeklyData = thisWeek.map((day) => {
    const dayEntries = studyEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === day.toDateString();
    });

    const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);

    return {
      day: format(day, 'EEE'),
      hours: parseFloat(totalHours.toFixed(1)),
    };
  });

  const subjectData = studyEntries.reduce((acc, entry) => {
    if (!acc[entry.subject]) {
      acc[entry.subject] = { subject: entry.subject, hours: 0, sessions: 0, score: [] };
    }
    acc[entry.subject].hours += (entry.lectureTime + entry.practiceTime) / 60;
    acc[entry.subject].sessions += 1;
    if (entry.score) acc[entry.subject].score.push(entry.score);
    return acc;
  }, {} as Record<string, any>);

  const radarData = Object.values(subjectData).map((data: any) => ({
    subject: data.subject,
    hours: parseFloat(data.hours.toFixed(1)),
    sessions: data.sessions,
    avgScore: data.score.length > 0 ? Math.round(data.score.reduce((a: number, b: number) => a + b, 0) / data.score.length) : 0,
  }));

  const pieData = Object.entries(subjectData).map(([subject, data]: [string, any]) => ({
    name: subject,
    value: parseFloat(data.hours.toFixed(1)),
  }));

  const COLORS = ['#00d9ff', '#ff6b35', '#00e676', '#ffd600', '#9c27b0', '#f06292'];

  const totalHours = studyEntries.reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);
  const totalSessions = studyEntries.length;
  const avgSessionLength = totalSessions > 0 ? totalHours / totalSessions : 0;
  const completedDPPs = studyEntries.filter((entry) => entry.dppCompleted).length;
  const avgFocusScore =
    studyEntries.filter((e) => e.focusScore).length > 0
      ? studyEntries.filter((e) => e.focusScore).reduce((sum, entry) => sum + (entry.focusScore || 0), 0) /
        studyEntries.filter((e) => e.focusScore).length
      : 0;

  const consistency = totalSessions > 0 ? Math.min(100, (totalSessions / 30) * 100) : 0;

  const stats = [
    { label: 'Total Hours', value: totalHours.toFixed(1), unit: 'hrs', icon: BarChart3, color: 'text-primary' },
    { label: 'Avg Session', value: avgSessionLength.toFixed(1), unit: 'hrs', icon: Activity, color: 'text-accent' },
    { label: 'DPPs Done', value: completedDPPs, unit: 'tasks', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Focus Score', value: avgFocusScore.toFixed(0), unit: '/100', icon: PieChart, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm">Deep insights into your study patterns</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Activity Bar Chart */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            This Week's Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="#8b8d98" />
              <YAxis stroke="#8b8d98" />
              <Tooltip
                contentStyle={{ backgroundColor: '#13151a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#e8eaed' }}
              />
              <Bar dataKey="hours" fill="#00d9ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Radar Chart */}
          {radarData.length > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Subject Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#8b8d98" />
                  <PolarRadiusAxis stroke="#8b8d98" />
                  <Radar name="Hours" dataKey="hours" stroke="#00d9ff" fill="#00d9ff" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Subject Distribution Pie */}
          {pieData.length > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Time Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#13151a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Consistency Meter */}
        <motion.div
          className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg mb-4">Consistency Score</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${consistency}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-primary">{consistency.toFixed(0)}%</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Based on session frequency over the last 30 days</p>
        </motion.div>

        {studyEntries.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">Start logging study sessions to see analytics</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
