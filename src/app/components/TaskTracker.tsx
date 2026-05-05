import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, CheckCircle2, Circle, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { differenceInDays, format, isPast, isToday, isTomorrow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'urgent' | 'important' | 'normal';
  category: 'assignment' | 'exam' | 'project' | 'other';
  completed: boolean;
  createdAt: string;
}

interface TaskTrackerProps {
  appMode: string;
}

export default function TaskTracker({ appMode }: TaskTrackerProps) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${appMode}_tasks`);
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'normal' as 'urgent' | 'important' | 'normal',
    category: 'assignment' as 'assignment' | 'exam' | 'project' | 'other',
  });

  const saveTasks = (data: Task[]) => {
    setTasks(data);
    localStorage.setItem(`${appMode}_tasks`, JSON.stringify(data));
  };

  const handleAddTask = () => {
    if (!formData.title || !formData.deadline) {
      toast.error('Please fill title and deadline');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      ...formData,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    toast.success('Task added!');

    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'normal',
      category: 'assignment',
    });
    setShowForm(false);
  };

  const handleToggleComplete = (id: string) => {
    saveTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDelete = (id: string) => {
    saveTasks(tasks.filter((task) => task.id !== id));
    toast.success('Task deleted');
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysLeft = differenceInDays(new Date(deadline), new Date());

    if (isPast(new Date(deadline)) && !isToday(new Date(deadline))) {
      return { text: 'Overdue', color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/30' };
    } else if (isToday(new Date(deadline))) {
      return { text: 'Today', color: 'text-orange-400', bgColor: 'bg-orange-400/10', borderColor: 'border-orange-400/30' };
    } else if (isTomorrow(new Date(deadline))) {
      return { text: 'Tomorrow', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/30' };
    } else if (daysLeft <= 2) {
      return { text: `${daysLeft}d left (High Alert)`, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/30' };
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30' };
    } else {
      return { text: `${daysLeft} days left`, color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/30' };
    }
  };

  const priorityColors = {
    urgent: 'bg-red-400/10 text-red-400 border-red-400/30',
    important: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
    normal: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  };

  const urgentTasks = tasks.filter((t) => !t.completed && t.priority === 'urgent');
  const importantTasks = tasks.filter((t) => !t.completed && t.priority === 'important');
  const normalTasks = tasks.filter((t) => !t.completed && t.priority === 'normal');
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 tracking-tight">Task & Deadline Tracker</h1>
            <p className="text-muted-foreground text-sm">Priority-based task management</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Task'}
          </Button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h3 className="text-lg mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Physics Assignment"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddTask} className="w-full bg-primary hover:bg-primary/90 text-black">
                Add Task
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tasks by Priority */}
        <div className="space-y-6">
          {/* Urgent Tasks */}
          {urgentTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Urgent ({urgentTasks.length})
              </h2>
              <div className="space-y-3">
                {urgentTasks.map((task) => {
                  const status = getDeadlineStatus(task.deadline);
                  return (
                    <motion.div
                      key={task.id}
                      className="bg-card border border-border rounded-xl p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <button onClick={() => handleToggleComplete(task.id)} className="mt-1">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h3>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs border ${priorityColors[task.priority]}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {status.text}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(task.deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Important Tasks */}
          {importantTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2 text-orange-400">
                Important ({importantTasks.length})
              </h2>
              <div className="space-y-3">
                {importantTasks.map((task) => {
                  const status = getDeadlineStatus(task.deadline);
                  return (
                    <motion.div
                      key={task.id}
                      className="bg-card border border-border rounded-xl p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <button onClick={() => handleToggleComplete(task.id)} className="mt-1">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h3>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs border ${priorityColors[task.priority]}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {status.text}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(task.deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Normal Tasks */}
          {normalTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">Normal Tasks ({normalTasks.length})</h2>
              <div className="space-y-3">
                {normalTasks.map((task) => {
                  const status = getDeadlineStatus(task.deadline);
                  return (
                    <motion.div
                      key={task.id}
                      className="bg-card border border-border rounded-xl p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <button onClick={() => handleToggleComplete(task.id)} className="mt-1">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h3>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {status.text}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(task.deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3 text-green-400">Completed ({completedTasks.length})</h2>
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <motion.div
                    key={task.id}
                    className="bg-secondary/30 border border-border rounded-xl p-4 opacity-60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium line-through text-muted-foreground">{task.title}</h3>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl mb-2">No Tasks Yet</h3>
              <p className="text-muted-foreground">Add your first task to start tracking deadlines</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
