import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';

interface ChapterRecord {
  id: string;
  subject: string;
  chapter: string;
  teamName: string;
  startDate: string;
  endDate: string;
  bookName: string;
  pageFrom: string;
  pageTo: string;
  status: 'ongoing' | 'completed' | 'pending';
  notes?: string;
}

interface ChapterTrackerProps {
  appMode: string;
}

export default function ChapterTracker({ appMode }: ChapterTrackerProps) {
  const [chapters, setChapters] = useState<ChapterRecord[]>(() => {
    const saved = localStorage.getItem(`${appMode}_chapters`);
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    teamName: '',
    startDate: '',
    endDate: '',
    bookName: '',
    pageFrom: '',
    pageTo: '',
    status: 'ongoing' as 'ongoing' | 'completed' | 'pending',
    notes: '',
  });

  // Get custom subjects from settings
  const customSubjects = localStorage.getItem('customSubjects');
  const subjectsList = customSubjects
    ? customSubjects.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Other'];

  const saveChapters = (data: ChapterRecord[]) => {
    setChapters(data);
    localStorage.setItem(`${appMode}_chapters`, JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!formData.subject || !formData.chapter || !formData.teamName) {
      toast.error('Please fill required fields');
      return;
    }

    if (editingId) {
      const updated = chapters.map((ch) =>
        ch.id === editingId ? { ...formData, id: editingId } : ch
      );
      saveChapters(updated);
      toast.success('Chapter updated!');
    } else {
      const newChapter: ChapterRecord = {
        ...formData,
        id: Date.now().toString(),
      };
      saveChapters([newChapter, ...chapters]);
      toast.success('Chapter added!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      chapter: '',
      teamName: '',
      startDate: '',
      endDate: '',
      bookName: '',
      pageFrom: '',
      pageTo: '',
      status: 'ongoing',
      notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (chapter: ChapterRecord) => {
    setFormData(chapter);
    setEditingId(chapter.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    saveChapters(chapters.filter((ch) => ch.id !== id));
    toast.success('Chapter deleted');
  };

  const statusColors = {
    ongoing: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    completed: 'bg-green-400/10 text-green-400 border-green-400/30',
    pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  };

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 tracking-tight">Chapter Tracker</h1>
            <p className="text-muted-foreground text-sm">Track chapters by team with book details</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Chapter'}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h3 className="text-lg mb-4">{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectsList.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter Name *</Label>
                <Input
                  id="chapter"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="e.g., Thermodynamics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="e.g., Team A, Batch 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookName">Book Name</Label>
                <Input
                  id="bookName"
                  value={formData.bookName}
                  onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                  placeholder="e.g., NCERT Physics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageFrom">Page From</Label>
                <Input
                  id="pageFrom"
                  value={formData.pageFrom}
                  onChange={(e) => setFormData({ ...formData, pageFrom: e.target.value })}
                  placeholder="e.g., 45"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageTo">Page To</Label>
                <Input
                  id="pageTo"
                  value={formData.pageTo}
                  onChange={(e) => setFormData({ ...formData, pageTo: e.target.value })}
                  placeholder="e.g., 78"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {editingId ? 'Update Chapter' : 'Add Chapter'}
              </Button>
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Chapters List */}
        {chapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                className="bg-card border border-border rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium">{chapter.chapter}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[chapter.status]}`}>
                        {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <BookOpen className="w-4 h-4" />
                      <span>{chapter.subject}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(chapter)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(chapter.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Team:</span>
                      <span className="font-medium">{chapter.teamName}</span>
                    </div>

                    {chapter.bookName && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Book:</span>
                        <span className="font-medium">{chapter.bookName}</span>
                      </div>
                    )}

                    {(chapter.pageFrom || chapter.pageTo) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Pages:</span>
                        <span className="font-medium">
                          {chapter.pageFrom || '?'} - {chapter.pageTo || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {chapter.startDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Started:</span>
                        <span className="font-medium">{format(new Date(chapter.startDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}

                    {chapter.endDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ended:</span>
                        <span className="font-medium">{format(new Date(chapter.endDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}

                    {chapter.notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        <span>{chapter.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl mb-2">No Chapters Tracked</h3>
            <p className="text-muted-foreground">Start tracking your team's chapter progress with book details</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
