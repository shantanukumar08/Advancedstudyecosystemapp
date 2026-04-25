import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Zap, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface StudyEntryProps {
  studyEntries: any[];
  setStudyEntries: (entries: any[]) => void;
  addXP: (amount: number) => void;
  setStreak: (streak: number) => void;
  streak: number;
}

export default function StudyEntry({ studyEntries, setStudyEntries, addXP, setStreak, streak }: StudyEntryProps) {
  const [quickMode, setQuickMode] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    topic: '',
    lectureNumber: '',
    lectureTime: '',
    practiceTime: '',
    dppCompleted: false,
    revisionsDone: '',
    score: '',
    notes: '',
    mistakes: '',
    focusScore: '',
  });

  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Other'];

  const handleQuickAdd = () => {
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      subject: formData.subject,
      chapter: formData.chapter || 'Quick Entry',
      topic: formData.topic || '',
      lectureNumber: formData.lectureNumber || '',
      lectureTime: parseInt(formData.lectureTime) || 0,
      practiceTime: parseInt(formData.practiceTime) || 0,
      dppCompleted: formData.dppCompleted,
      revisionsDone: parseInt(formData.revisionsDone) || 0,
      score: formData.score ? parseInt(formData.score) : undefined,
      notes: formData.notes,
      mistakes: formData.mistakes ? formData.mistakes.split('\n').filter(Boolean) : [],
      focusScore: formData.focusScore ? parseInt(formData.focusScore) : undefined,
    };

    setStudyEntries([newEntry, ...studyEntries]);

    // Add XP
    const totalTime = (newEntry.lectureTime + newEntry.practiceTime) / 60;
    const baseXP = Math.floor(totalTime * 50);
    const bonusXP = newEntry.dppCompleted ? 100 : 0;
    addXP(baseXP + bonusXP);

    // Update streak
    const today = new Date().toDateString();
    const hasStudiedToday = studyEntries.some((entry) => new Date(entry.date).toDateString() === today);
    if (!hasStudiedToday) {
      setStreak(streak + 1);
    }

    toast.success('Study session added!', {
      description: `+${baseXP + bonusXP} XP earned!`,
    });

    // Reset form
    setFormData({
      subject: formData.subject,
      chapter: '',
      topic: '',
      lectureNumber: '',
      lectureTime: '',
      practiceTime: '',
      dppCompleted: false,
      revisionsDone: '',
      score: '',
      notes: '',
      mistakes: '',
      focusScore: '',
    });
  };

  const handleDetailedAdd = () => {
    if (!formData.subject || !formData.chapter) {
      toast.error('Please fill in subject and chapter');
      return;
    }
    handleQuickAdd();
  };

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Study Entry</h1>
          <p className="text-muted-foreground text-sm">Log your study sessions and earn XP</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3">
            {quickMode ? <Zap className="w-5 h-5 text-accent" /> : <BookOpen className="w-5 h-5 text-primary" />}
            <div>
              <div className="text-sm font-medium">{quickMode ? 'Quick Mode' : 'Detailed Mode'}</div>
              <div className="text-xs text-muted-foreground">
                {quickMode ? '2-second entry system' : 'Complete session logging'}
              </div>
            </div>
          </div>
          <Switch checked={!quickMode} onCheckedChange={(checked) => setQuickMode(!checked)} />
        </div>

        {/* Entry Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
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

          {/* Chapter & Topic */}
          {!quickMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter *</Label>
                <Input
                  id="chapter"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="e.g., Thermodynamics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., First Law of Thermodynamics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lectureNumber">Lecture Number</Label>
                <Input
                  id="lectureNumber"
                  value={formData.lectureNumber}
                  onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
                  placeholder="e.g., Lecture 5 or L5"
                />
              </div>
            </>
          )}

          {/* Time Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lectureTime">Lecture Time (min)</Label>
              <Input
                id="lectureTime"
                type="number"
                value={formData.lectureTime}
                onChange={(e) => setFormData({ ...formData, lectureTime: e.target.value })}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practiceTime">Practice Time (min)</Label>
              <Input
                id="practiceTime"
                type="number"
                value={formData.practiceTime}
                onChange={(e) => setFormData({ ...formData, practiceTime: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          {/* DPP Completed */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div>
              <div className="text-sm font-medium">DPP Completed</div>
              <div className="text-xs text-muted-foreground">+100 XP Bonus</div>
            </div>
            <Switch
              checked={formData.dppCompleted}
              onCheckedChange={(checked) => setFormData({ ...formData, dppCompleted: checked })}
            />
          </div>

          {/* Detailed Fields */}
          {!quickMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revisionsDone">Revisions Done</Label>
                  <Input
                    id="revisionsDone"
                    type="number"
                    value={formData.revisionsDone}
                    onChange={(e) => setFormData({ ...formData, revisionsDone: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score">Test Score (%)</Label>
                  <Input
                    id="score"
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="85"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focusScore">Focus Score (1-100)</Label>
                <Input
                  id="focusScore"
                  type="number"
                  value={formData.focusScore}
                  onChange={(e) => setFormData({ ...formData, focusScore: e.target.value })}
                  placeholder="80"
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key concepts learned..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mistakes">Mistakes (one per line)</Label>
                <Textarea
                  id="mistakes"
                  value={formData.mistakes}
                  onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                  placeholder="Forgot to apply sign convention&#10;Calculation error in step 3"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            onClick={quickMode ? handleQuickAdd : handleDetailedAdd}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black font-medium"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Study Session
          </Button>
        </div>

        {/* Recent Entries */}
        {studyEntries.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {studyEntries.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className="bg-card border border-border rounded-lg p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{entry.subject}</div>
                      <div className="text-sm text-muted-foreground">{entry.chapter}</div>
                      {entry.topic && <div className="text-xs text-muted-foreground">{entry.topic}</div>}
                      {entry.lectureNumber && (
                        <div className="text-xs text-primary mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded">
                          📚 {entry.lectureNumber}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-primary">
                        {((entry.lectureTime + entry.practiceTime) / 60).toFixed(1)}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {entry.dppCompleted && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded">
                      ✓ DPP Completed
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
