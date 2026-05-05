import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, GraduationCap, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface ExamMode {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface ExamModeManagerProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

export default function ExamModeManager({ currentMode, onModeChange }: ExamModeManagerProps) {
  const [examModes, setExamModes] = useState<ExamMode[]>(() => {
    const saved = localStorage.getItem('customExamModes');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default modes
    return [
      { id: 'JEE', name: 'JEE', description: 'Joint Entrance Examination', color: '#00d9ff', icon: '🎯' },
      { id: 'NEET', name: 'NEET', description: 'Medical Entrance Exam', color: '#ff6b35', icon: '🏥' },
      { id: 'BOARDS', name: 'Boards', description: 'Board Examinations', color: '#10b981', icon: '📚' },
      { id: 'UPSC', name: 'UPSC', description: 'Civil Services Exam', color: '#8b5cf6', icon: '🏛️' },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#00d9ff',
    icon: '🎓',
  });

  const saveExamModes = (modes: ExamMode[]) => {
    setExamModes(modes);
    localStorage.setItem('customExamModes', JSON.stringify(modes));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#00d9ff', icon: '🎓' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Enter exam mode name');
      return;
    }

    if (editingId) {
      const updated = examModes.map((mode) =>
        mode.id === editingId
          ? { ...formData, id: editingId, name: formData.name.trim() }
          : mode
      );
      saveExamModes(updated);
      toast.success('Exam mode updated!');
    } else {
      const newMode: ExamMode = {
        id: formData.name.trim().toUpperCase().replace(/\s+/g, '_'),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
      };

      if (examModes.find((m) => m.id === newMode.id)) {
        toast.error('Exam mode with this name already exists');
        return;
      }

      saveExamModes([...examModes, newMode]);
      toast.success('Exam mode added!', {
        description: 'You can now switch to this mode from settings',
      });
    }

    resetForm();
  };

  const handleEdit = (mode: ExamMode) => {
    setFormData({
      name: mode.name,
      description: mode.description,
      color: mode.color,
      icon: mode.icon,
    });
    setEditingId(mode.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (currentMode === id) {
      toast.error('Cannot delete active mode', {
        description: 'Switch to another mode first',
      });
      return;
    }

    saveExamModes(examModes.filter((m) => m.id !== id));
    toast.success('Exam mode deleted');
  };

  const emojiList = ['🎯', '📚', '🏥', '🏛️', '💼', '⚖️', '🔬', '💻', '🎓', '📝', '🧮', '🌟', '🚀', '⚡'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">Exam Mode Manager</h2>
          <p className="text-sm text-muted-foreground">Create unlimited custom competitive exam modes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-black">
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Mode'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h3 className="text-lg mb-4">{editingId ? 'Edit Exam Mode' : 'Add New Exam Mode'}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mode Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CAT, GATE, SSC"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Common Admission Test for MBA"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground font-mono">{formData.color}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Icon</label>
              <div className="grid grid-cols-7 gap-2">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                      formData.icon === emoji
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {editingId ? 'Update Mode' : 'Add Mode'}
              </Button>
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exam Modes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examModes.map((mode, index) => (
          <motion.div
            key={mode.id}
            className={`bg-card border-2 rounded-xl p-5 transition-all cursor-pointer ${
              currentMode === mode.id
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onModeChange(mode.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${mode.color}20` }}
                >
                  {mode.icon}
                </div>
                <div>
                  <div className="font-semibold text-lg">{mode.name}</div>
                  {currentMode === mode.id && (
                    <div className="text-xs text-primary font-medium">Active Mode</div>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(mode);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(mode.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {mode.description && (
              <p className="text-sm text-muted-foreground">{mode.description}</p>
            )}

            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Click to switch to this mode
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {examModes.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl mb-2">No Exam Modes</h3>
          <p className="text-muted-foreground">Add your first custom exam mode</p>
        </div>
      )}
    </div>
  );
}
