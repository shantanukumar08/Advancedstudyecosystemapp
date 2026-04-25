import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface GoalsTrackerProps {
  goals: any[];
  setGoals: (goals: any[]) => void;
  studyEntries: any[];
  addXP: (amount: number) => void;
}

export default function GoalsTracker({ goals, setGoals, studyEntries, addXP }: GoalsTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'custom',
    targetHours: '',
    deadline: '',
  });

  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'All Subjects'];

  const calculateProgress = (goal: any) => {
    const now = new Date();
    let entries = [];

    if (goal.type === 'weekly') {
      entries = studyEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfWeek(now) && entryDate <= endOfWeek(now);
      });
    } else if (goal.type === 'monthly') {
      entries = studyEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfMonth(now) && entryDate <= endOfMonth(now);
      });
    } else if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      entries = studyEntries.filter((entry) => new Date(entry.date) <= deadline);
    } else {
      entries = studyEntries;
    }

    if (goal.subject !== 'All Subjects') {
      entries = entries.filter((entry) => entry.subject === goal.subject);
    }

    const totalHours = entries.reduce((sum, entry) => sum + (entry.lectureTime + entry.practiceTime) / 60, 0);

    return totalHours;
  };

  const handleAddGoal = () => {
    if (!formData.subject || !formData.targetHours) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      subject: formData.subject,
      type: formData.type,
      targetHours: parseFloat(formData.targetHours),
      currentHours: 0,
      deadline: formData.deadline || undefined,
    };

    setGoals([...goals, newGoal]);
    toast.success('Goal created!');
    setShowAddForm(false);
    setFormData({
      subject: '',
      type: 'weekly',
      targetHours: '',
      deadline: '',
    });
    addXP(50);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((goal) => goal.id !== goalId));
    toast.success('Goal deleted');
  };

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 tracking-tight">Goals Tracker</h1>
            <p className="text-muted-foreground text-sm">Set targets and track your progress</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg mb-4">Create New Goal</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-subject">Subject *</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-hours">Target Hours *</Label>
                <Input
                  id="target-hours"
                  type="number"
                  step="0.5"
                  value={formData.targetHours}
                  onChange={(e) => setFormData({ ...formData, targetHours: e.target.value })}
                  placeholder="20"
                />
              </div>

              {formData.type === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleAddGoal} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                  Create Goal
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Goals List */}
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const currentProgress = calculateProgress(goal);
              const progressPercentage = Math.min((currentProgress / goal.targetHours) * 100, 100);
              const isCompleted = currentProgress >= goal.targetHours;

              return (
                <motion.div
                  key={goal.id}
                  className={`bg-card border rounded-xl p-6 ${
                    isCompleted ? 'border-green-400/50 bg-green-400/5' : 'border-border'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className={`w-5 h-5 ${isCompleted ? 'text-green-400' : 'text-primary'}`} />
                        <h3 className="text-lg font-medium">{goal.subject}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="capitalize">{goal.type} Goal</span>
                        {goal.deadline && <span>• Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono font-medium">
                        {currentProgress.toFixed(1)} / {goal.targetHours.toFixed(1)} hrs
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="text-right text-xs text-muted-foreground">{progressPercentage.toFixed(0)}% Complete</div>
                  </div>

                  {isCompleted && (
                    <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Goal Achieved! 🎉
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl mb-2">No Goals Set</h3>
            <p className="text-muted-foreground mb-6">Create your first goal to start tracking your progress</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
