import { motion } from 'motion/react';
import { Brain, Lightbulb, AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface SmartPlannerProps {
  studyEntries: any[];
  goals: any[];
}

export default function SmartPlanner({ studyEntries, goals }: SmartPlannerProps) {
  const analyzeWeakSubjects = () => {
    const subjectData = studyEntries.reduce((acc, entry) => {
      if (!acc[entry.subject]) {
        acc[entry.subject] = { hours: 0, scores: [] };
      }
      acc[entry.subject].hours += (entry.lectureTime + entry.practiceTime) / 60;
      if (entry.score) acc[entry.subject].scores.push(entry.score);
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(subjectData)
      .map(([subject, data]) => ({
        subject,
        hours: data.hours,
        avgScore: data.scores.length > 0 ? data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length : null,
      }))
      .filter((item) => item.avgScore !== null && item.avgScore < 70)
      .sort((a, b) => a.avgScore! - b.avgScore!);
  };

  const getPendingTopics = () => {
    const daysSinceLastStudy = studyEntries.reduce((acc, entry) => {
      const key = `${entry.subject}-${entry.chapter}`;
      const daysSince = differenceInDays(new Date(), new Date(entry.date));

      if (!acc[key] || daysSince < acc[key].daysSince) {
        acc[key] = {
          subject: entry.subject,
          chapter: entry.chapter,
          daysSince,
          dppCompleted: entry.dppCompleted,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(daysSinceLastStudy)
      .filter((item: any) => item.daysSince > 5)
      .sort((a: any, b: any) => b.daysSince - a.daysSince);
  };

  const getGoalStatus = () => {
    return goals
      .map((goal) => {
        const relevantEntries =
          goal.subject === 'All Subjects'
            ? studyEntries
            : studyEntries.filter((entry) => entry.subject === goal.subject);

        const currentHours = relevantEntries.reduce(
          (sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60,
          0
        );

        const progress = (currentHours / goal.targetHours) * 100;

        return {
          ...goal,
          currentHours,
          progress,
          status: progress < 50 ? 'behind' : progress < 80 ? 'on-track' : 'ahead',
        };
      })
      .filter((goal) => goal.status === 'behind');
  };

  const getBurnoutWarning = () => {
    const last7Days = studyEntries.filter((entry) => {
      const daysSince = differenceInDays(new Date(), new Date(entry.date));
      return daysSince <= 7;
    });

    const totalHours = last7Days.reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);
    const avgPerDay = totalHours / 7;

    return avgPerDay > 10 ? 'high' : avgPerDay < 2 ? 'low' : null;
  };

  const weakSubjects = analyzeWeakSubjects();
  const pendingTopics = getPendingTopics();
  const behindGoals = getGoalStatus();
  const burnoutWarning = getBurnoutWarning();

  const suggestions = [];

  if (weakSubjects.length > 0) {
    suggestions.push({
      type: 'weak-subject',
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30',
      title: 'Focus on Weak Areas',
      items: weakSubjects.slice(0, 3).map((s) => `${s.subject}: ${s.avgScore?.toFixed(0)}% avg score - needs attention`),
    });
  }

  if (pendingTopics.length > 0) {
    suggestions.push({
      type: 'pending',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      title: 'Topics Need Revision',
      items: pendingTopics.slice(0, 3).map((t) => `${t.subject} - ${t.chapter} (${t.daysSince} days ago)`),
    });
  }

  if (behindGoals.length > 0) {
    suggestions.push({
      type: 'goals',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/30',
      title: 'Goals Behind Schedule',
      items: behindGoals
        .slice(0, 3)
        .map((g) => `${g.subject} ${g.type} goal: ${g.progress.toFixed(0)}% complete - need ${(g.targetHours - g.currentHours).toFixed(1)}h more`),
    });
  }

  if (burnoutWarning === 'high') {
    suggestions.push({
      type: 'burnout',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30',
      title: 'Take a Break',
      items: ['You\'re studying 10+ hours/day. Consider reducing intensity to avoid burnout.'],
    });
  }

  if (burnoutWarning === 'low') {
    suggestions.push({
      type: 'lazy',
      icon: TrendingDown,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      title: 'Increase Study Time',
      items: ['Average study time is low this week. Try to increase daily hours.'],
    });
  }

  const todaySuggestion = suggestions.length > 0 ? suggestions[0] : null;

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Smart Planner</h1>
          <p className="text-muted-foreground text-sm">AI-powered study recommendations</p>
        </div>

        {/* Today's Priority */}
        {todaySuggestion && (
          <motion.div
            className={`${todaySuggestion.bgColor} border ${todaySuggestion.borderColor} rounded-xl p-6 mb-6`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center`}>
                <Lightbulb className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Today's Priority</div>
                <div className={`text-lg font-medium ${todaySuggestion.color}`}>{todaySuggestion.title}</div>
              </div>
            </div>
            <div className="space-y-2">
              {todaySuggestion.items.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Suggestions */}
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.div
                key={suggestion.type}
                className={`bg-card border ${suggestion.borderColor} rounded-xl p-6`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-5 h-5 ${suggestion.color}`} />
                  <h3 className={`text-lg font-medium ${suggestion.color}`}>{suggestion.title}</h3>
                </div>
                <div className="space-y-2">
                  {suggestion.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${suggestion.color} mt-2 flex-shrink-0`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Auto Timetable Suggestion */}
        {suggestions.length > 0 && (
          <motion.div
            className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h3 className="text-lg">Suggested Daily Plan</h3>
            </div>
            <div className="space-y-3">
              {weakSubjects.slice(0, 2).map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between bg-background/50 rounded-lg p-3">
                  <div>
                    <div className="text-sm font-medium">{subject.subject}</div>
                    <div className="text-xs text-muted-foreground">Focus: Weak topic revision</div>
                  </div>
                  <div className="text-xs font-mono text-primary">2 hrs</div>
                </div>
              ))}
              {pendingTopics.slice(0, 1).map((topic) => (
                <div key={topic.chapter} className="flex items-center justify-between bg-background/50 rounded-lg p-3">
                  <div>
                    <div className="text-sm font-medium">{topic.subject}</div>
                    <div className="text-xs text-muted-foreground">{topic.chapter} - Revision</div>
                  </div>
                  <div className="text-xs font-mono text-primary">1.5 hrs</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {suggestions.length === 0 && (
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl mb-2 text-green-400">Everything Looks Great!</h3>
            <p className="text-muted-foreground">No immediate concerns. Keep up the good work!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
