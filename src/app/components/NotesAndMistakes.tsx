import { motion } from 'motion/react';
import { FileText, AlertCircle, BookOpen, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface NotesAndMistakesProps {
  studyEntries: any[];
}

export default function NotesAndMistakes({ studyEntries }: NotesAndMistakesProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const entriesWithNotes = studyEntries.filter((entry) => entry.notes && entry.notes.trim() !== '');
  const entriesWithMistakes = studyEntries.filter((entry) => entry.mistakes && entry.mistakes.length > 0);

  const subjects = Array.from(new Set(studyEntries.map((e) => e.subject)));

  const filteredNotes =
    selectedSubject === 'all' ? entriesWithNotes : entriesWithNotes.filter((e) => e.subject === selectedSubject);

  const filteredMistakes =
    selectedSubject === 'all' ? entriesWithMistakes : entriesWithMistakes.filter((e) => e.subject === selectedSubject);

  const mistakeTypes = entriesWithMistakes.reduce((acc, entry) => {
    entry.mistakes.forEach((mistake: string) => {
      let type = 'Other';
      if (mistake.toLowerCase().includes('calculation') || mistake.toLowerCase().includes('math')) {
        type = 'Calculation';
      } else if (mistake.toLowerCase().includes('concept') || mistake.toLowerCase().includes('theory')) {
        type = 'Conceptual';
      } else if (mistake.toLowerCase().includes('silly') || mistake.toLowerCase().includes('careless')) {
        type = 'Silly';
      }

      if (!acc[type]) acc[type] = 0;
      acc[type]++;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalMistakes = Object.values(mistakeTypes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Notes & Mistakes</h1>
          <p className="text-muted-foreground text-sm">Review your learning insights and errors</p>
        </div>

        {/* Subject Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSubject === 'all'
                ? 'bg-primary text-black'
                : 'bg-secondary/30 hover:bg-secondary/50'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedSubject === subject
                  ? 'bg-primary text-black'
                  : 'bg-secondary/30 hover:bg-secondary/50'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notes">Notes ({filteredNotes.length})</TabsTrigger>
            <TabsTrigger value="mistakes">Mistakes ({filteredMistakes.length})</TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            {filteredNotes.length > 0 ? (
              <div className="space-y-4">
                {filteredNotes.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="bg-card border border-border rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{entry.subject}</div>
                            <div className="text-sm text-muted-foreground">{entry.chapter}</div>
                            {entry.topic && <div className="text-xs text-muted-foreground">{entry.topic}</div>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="bg-secondary/30 rounded-lg p-4 mt-3">
                          <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl mb-2">No Notes Yet</h3>
                <p className="text-muted-foreground">Start adding notes to your study sessions</p>
              </div>
            )}
          </TabsContent>

          {/* Mistakes Tab */}
          <TabsContent value="mistakes" className="mt-6">
            {/* Mistake Analysis */}
            {totalMistakes > 0 && (
              <motion.div
                className="bg-gradient-to-br from-red-400/10 to-orange-400/10 border border-red-400/30 rounded-xl p-6 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg">Mistake Pattern Analysis</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(mistakeTypes).map(([type, count]) => {
                    const percentage = ((count / totalMistakes) * 100).toFixed(0);
                    return (
                      <div key={type} className="bg-background/50 rounded-lg p-3">
                        <div className="text-2xl font-bold font-mono text-red-400">{percentage}%</div>
                        <div className="text-xs text-muted-foreground">{type}</div>
                        <div className="text-xs text-muted-foreground">{count} errors</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {filteredMistakes.length > 0 ? (
              <div className="space-y-4">
                {filteredMistakes.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="bg-card border border-border rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{entry.subject}</div>
                            <div className="text-sm text-muted-foreground">{entry.chapter}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-2 mt-3">
                          {entry.mistakes.map((mistake: string, mistakeIndex: number) => (
                            <div key={mistakeIndex} className="bg-red-400/10 rounded-lg p-3 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                              <span className="text-sm">{mistake}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl mb-2">No Mistakes Logged</h3>
                <p className="text-muted-foreground">Start tracking your mistakes to learn from them</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
