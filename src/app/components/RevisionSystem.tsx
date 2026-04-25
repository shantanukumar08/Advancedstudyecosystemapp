import { motion } from 'motion/react';
import { RotateCcw, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { addDays, differenceInDays, format } from 'date-fns';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface RevisionSystemProps {
  studyEntries: any[];
  setStudyEntries: (entries: any[]) => void;
  addXP: (amount: number) => void;
}

export default function RevisionSystem({ studyEntries, setStudyEntries, addXP }: RevisionSystemProps) {
  const revisionSchedule = [1, 3, 7, 14, 30];

  const getRevisionStatus = (entry: any) => {
    const entryDate = new Date(entry.date);
    const daysSince = differenceInDays(new Date(), entryDate);
    const revisionsNeeded = revisionSchedule.filter((day) => day <= daysSince).length;
    const revisionsDone = entry.revisionsDone || 0;

    return {
      needed: revisionsNeeded,
      done: revisionsDone,
      pending: Math.max(0, revisionsNeeded - revisionsDone),
      nextRevision: revisionSchedule.find((day) => day > daysSince) || null,
      daysUntilNext: revisionSchedule.find((day) => day > daysSince)
        ? revisionSchedule.find((day) => day > daysSince)! - daysSince
        : null,
    };
  };

  const pendingRevisions = studyEntries
    .map((entry) => ({
      ...entry,
      status: getRevisionStatus(entry),
    }))
    .filter((entry) => entry.status.pending > 0)
    .sort((a, b) => b.status.pending - a.status.pending);

  const upcomingRevisions = studyEntries
    .map((entry) => ({
      ...entry,
      status: getRevisionStatus(entry),
    }))
    .filter((entry) => entry.status.pending === 0 && entry.status.daysUntilNext !== null)
    .sort((a, b) => a.status.daysUntilNext! - b.status.daysUntilNext!);

  const handleMarkRevised = (entryId: string) => {
    setStudyEntries(
      studyEntries.map((entry) =>
        entry.id === entryId ? { ...entry, revisionsDone: (entry.revisionsDone || 0) + 1 } : entry
      )
    );
    addXP(75);
    toast.success('Revision completed! +75 XP');
  };

  const pendingDPPs = studyEntries.filter((entry) => !entry.dppCompleted);

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Revision System</h1>
          <p className="text-muted-foreground text-sm">Spaced repetition for long-term retention</p>
        </div>

        {/* Revision Schedule Info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Spaced Repetition Schedule
          </h3>
          <div className="flex flex-wrap gap-3">
            {revisionSchedule.map((day, index) => (
              <div key={day} className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">Day {day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Optimal revision intervals for maximum retention based on the forgetting curve
          </p>
        </div>

        {/* Pending DPPs */}
        {pendingDPPs.length > 0 && (
          <motion.div
            className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg mb-4 flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              Pending DPPs ({pendingDPPs.length})
            </h3>
            <div className="space-y-3">
              {pendingDPPs.slice(0, 5).map((entry) => (
                <div key={entry.id} className="bg-background/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{entry.subject}</div>
                    <div className="text-sm text-muted-foreground">{entry.chapter}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setStudyEntries(
                        studyEntries.map((e) => (e.id === entry.id ? { ...e, dppCompleted: true } : e))
                      );
                      addXP(100);
                      toast.success('DPP marked complete! +100 XP');
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    Mark Complete
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Due Today */}
        {pendingRevisions.length > 0 && (
          <motion.div
            className="bg-accent/10 border border-accent/30 rounded-xl p-6 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg mb-4 flex items-center gap-2 text-accent">
              <AlertCircle className="w-5 h-5" />
              Due for Revision ({pendingRevisions.length})
            </h3>
            <div className="space-y-3">
              {pendingRevisions.map((entry) => (
                <div key={entry.id} className="bg-background/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium">{entry.subject}</div>
                      <div className="text-sm text-muted-foreground">{entry.chapter}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Studied: {format(new Date(entry.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-accent">{entry.status.pending} pending</div>
                      <div className="text-xs text-muted-foreground">{entry.status.done}/{entry.status.needed} done</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleMarkRevised(entry.id)}
                    className="w-full bg-accent hover:bg-accent/90 text-black"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Revised
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Revisions */}
        {upcomingRevisions.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Upcoming Revisions
            </h3>
            <div className="space-y-3">
              {upcomingRevisions.slice(0, 10).map((entry) => (
                <div key={entry.id} className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{entry.subject}</div>
                    <div className="text-sm text-muted-foreground">{entry.chapter}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-primary">
                      {entry.status.daysUntilNext === 0
                        ? 'Today'
                        : entry.status.daysUntilNext === 1
                        ? 'Tomorrow'
                        : `In ${entry.status.daysUntilNext} days`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(addDays(new Date(entry.date), entry.status.nextRevision!), 'MMM d')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {pendingRevisions.length === 0 && pendingDPPs.length === 0 && (
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl mb-2 text-green-400">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending revisions or DPPs. Great work!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
