import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, BookOpen, FileText, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
  revisionCompleted: boolean;
  questionsCompleted: boolean;
  lecturesCompleted: boolean;
  notes?: string;
}

interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

interface SubjectManagementProps {
  appMode: string;
}

export default function SubjectManagement({ appMode }: SubjectManagementProps) {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${appMode}_subjectStructure`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  const saveData = (data: Subject[]) => {
    setSubjects(data);
    localStorage.setItem(`${appMode}_subjectStructure`, JSON.stringify(data));

    // Update global subject list for other components
    const subjectNames = data.map(s => s.name);
    localStorage.setItem('customSubjects', subjectNames.join(','));

    toast.success('Updated everywhere!', {
      description: 'Changes synced to all components',
    });
  };

  // Add Subject
  const addSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error('Enter subject name');
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName.trim(),
      chapters: [],
    };

    saveData([...subjects, newSubject]);
    setNewSubjectName('');
  };

  // Update Subject
  const updateSubject = (id: string) => {
    if (!editingSubjectName.trim()) return;

    const updated = subjects.map(s =>
      s.id === id ? { ...s, name: editingSubjectName.trim() } : s
    );
    saveData(updated);
    setEditingSubjectId(null);
    setEditingSubjectName('');
  };

  // Delete Subject
  const deleteSubject = (id: string) => {
    saveData(subjects.filter(s => s.id !== id));
    if (selectedSubject === id) setSelectedSubject(null);
  };

  // Add Chapter
  const addChapter = (subjectId: string) => {
    if (!newChapterName.trim()) {
      toast.error('Enter chapter name');
      return;
    }

    const newChapter: Chapter = {
      id: Date.now().toString(),
      name: newChapterName.trim(),
      topics: [],
      revisionCompleted: false,
      questionsCompleted: false,
      lecturesCompleted: false,
    };

    const updated = subjects.map(s =>
      s.id === subjectId ? { ...s, chapters: [...s.chapters, newChapter] } : s
    );

    saveData(updated);
    setNewChapterName('');
  };

  // Delete Chapter
  const deleteChapter = (subjectId: string, chapterId: string) => {
    const updated = subjects.map(s =>
      s.id === subjectId
        ? { ...s, chapters: s.chapters.filter(c => c.id !== chapterId) }
        : s
    );
    saveData(updated);
    if (selectedChapter === chapterId) setSelectedChapter(null);
  };

  // Toggle Chapter Status
  const toggleChapterStatus = (subjectId: string, chapterId: string, field: 'revisionCompleted' | 'questionsCompleted' | 'lecturesCompleted') => {
    const updated = subjects.map(s =>
      s.id === subjectId
        ? {
            ...s,
            chapters: s.chapters.map(c =>
              c.id === chapterId ? { ...c, [field]: !c[field] } : c
            ),
          }
        : s
    );
    saveData(updated);
  };

  // Add Topic
  const addTopic = (subjectId: string, chapterId: string) => {
    if (!newTopicName.trim()) {
      toast.error('Enter topic name');
      return;
    }

    const newTopic: Topic = {
      id: Date.now().toString(),
      name: newTopicName.trim(),
      completed: false,
    };

    const updated = subjects.map(s =>
      s.id === subjectId
        ? {
            ...s,
            chapters: s.chapters.map(c =>
              c.id === chapterId ? { ...c, topics: [...c.topics, newTopic] } : c
            ),
          }
        : s
    );

    saveData(updated);
    setNewTopicName('');
  };

  // Delete Topic
  const deleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
    const updated = subjects.map(s =>
      s.id === subjectId
        ? {
            ...s,
            chapters: s.chapters.map(c =>
              c.id === chapterId
                ? { ...c, topics: c.topics.filter(t => t.id !== topicId) }
                : c
            ),
          }
        : s
    );
    saveData(updated);
  };

  // Toggle Topic Completion
  const toggleTopicCompletion = (subjectId: string, chapterId: string, topicId: string) => {
    const updated = subjects.map(s =>
      s.id === subjectId
        ? {
            ...s,
            chapters: s.chapters.map(c =>
              c.id === chapterId
                ? {
                    ...c,
                    topics: c.topics.map(t =>
                      t.id === topicId ? { ...t, completed: !t.completed } : t
                    ),
                  }
                : c
            ),
          }
        : s
    );
    saveData(updated);
  };

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find(c => c.id === selectedChapter);

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-7xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Subject/Chapter/Topic Management</h1>
          <p className="text-muted-foreground text-sm">
            Create unlimited subjects, chapters & topics - auto-updates everywhere
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subjects Panel */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Subjects ({subjects.length})
              </h2>
            </div>

            <div className="space-y-2 mb-4">
              <Input
                placeholder="New subject name..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <Button onClick={addSubject} className="w-full bg-primary hover:bg-primary/90 text-black" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedSubject === subject.id
                      ? 'bg-primary/20 border-primary'
                      : 'bg-secondary/30 border-border hover:bg-secondary/50'
                  }`}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setSelectedChapter(null);
                  }}
                >
                  {editingSubjectId === subject.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingSubjectName}
                        onChange={(e) => setEditingSubjectName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && updateSubject(subject.id)}
                        className="h-8"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-green-500 hover:bg-green-600"
                        onClick={() => updateSubject(subject.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingSubjectId(null);
                          setEditingSubjectName('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {subject.chapters.length} chapters
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubjectId(subject.id);
                            setEditingSubjectName(subject.name);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubject(subject.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {subjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No subjects yet. Add your first subject!
                </div>
              )}
            </div>
          </div>

          {/* Chapters Panel */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Chapters {selectedSubjectData && `(${selectedSubjectData.chapters.length})`}
              </h2>
            </div>

            {selectedSubjectData ? (
              <>
                <div className="space-y-2 mb-4">
                  <Input
                    placeholder="New chapter name..."
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addChapter(selectedSubject!)}
                  />
                  <Button
                    onClick={() => addChapter(selectedSubject!)}
                    className="w-full bg-accent hover:bg-accent/90 text-black"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chapter
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSubjectData.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedChapter === chapter.id
                          ? 'bg-accent/20 border-accent'
                          : 'bg-secondary/30 border-border hover:bg-secondary/50'
                      }`}
                      onClick={() => setSelectedChapter(chapter.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium flex-1">{chapter.name}</div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(selectedSubject!, chapter.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              chapter.lecturesCompleted
                                ? 'bg-green-400/20 text-green-400'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChapterStatus(selectedSubject!, chapter.id, 'lecturesCompleted');
                            }}
                          >
                            {chapter.lecturesCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Lectures
                          </button>
                          <button
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              chapter.revisionCompleted
                                ? 'bg-blue-400/20 text-blue-400'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChapterStatus(selectedSubject!, chapter.id, 'revisionCompleted');
                            }}
                          >
                            {chapter.revisionCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Revision
                          </button>
                          <button
                            className={`flex items-center gap-1 px-2 py-1 rounded ${
                              chapter.questionsCompleted
                                ? 'bg-purple-400/20 text-purple-400'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChapterStatus(selectedSubject!, chapter.id, 'questionsCompleted');
                            }}
                          >
                            {chapter.questionsCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Questions
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground">{chapter.topics.length} topics</div>
                      </div>
                    </div>
                  ))}

                  {selectedSubjectData.chapters.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No chapters yet. Add your first chapter!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Select a subject to view chapters
              </div>
            )}
          </div>

          {/* Topics Panel */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Topics {selectedChapterData && `(${selectedChapterData.topics.length})`}
              </h2>
            </div>

            {selectedChapterData ? (
              <>
                <div className="space-y-2 mb-4">
                  <Input
                    placeholder="New topic name..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && addTopic(selectedSubject!, selectedChapter!)
                    }
                  />
                  <Button
                    onClick={() => addTopic(selectedSubject!, selectedChapter!)}
                    className="w-full bg-green-500 hover:bg-green-600 text-black"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedChapterData.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-3 rounded-lg border transition-all ${
                        topic.completed
                          ? 'bg-green-400/10 border-green-400/30'
                          : 'bg-secondary/30 border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          className="flex items-center gap-2 flex-1 text-left"
                          onClick={() =>
                            toggleTopicCompletion(selectedSubject!, selectedChapter!, topic.id)
                          }
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              topic.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {topic.completed && <Check className="w-3 h-3 text-black" />}
                          </div>
                          <span className={topic.completed ? 'line-through text-muted-foreground' : ''}>
                            {topic.name}
                          </span>
                        </button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteTopic(selectedSubject!, selectedChapter!, topic.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {selectedChapterData.topics.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No topics yet. Add your first topic!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Select a chapter to view topics
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <motion.div
          className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-medium mb-4">Overall Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{subjects.length}</div>
              <div className="text-sm text-muted-foreground">Total Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {subjects.reduce((sum, s) => sum + s.chapters.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {subjects.reduce(
                  (sum, s) => sum + s.chapters.reduce((cSum, c) => cSum + c.topics.length, 0),
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Topics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {subjects.reduce(
                  (sum, s) =>
                    sum +
                    s.chapters.reduce((cSum, c) => cSum + c.topics.filter((t) => t.completed).length, 0),
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Topics Completed</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
