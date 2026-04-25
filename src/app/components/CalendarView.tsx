import { motion } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Button } from './ui/button';

interface CalendarViewProps {
  studyEntries: any[];
}

export default function CalendarView({ studyEntries }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntriesForDate = (date: Date) => {
    return studyEntries.filter((entry) => isSameDay(new Date(entry.date), date));
  };

  const getDayIntensity = (date: Date) => {
    const entries = getEntriesForDate(date);
    if (entries.length === 0) return null;

    const totalMinutes = entries.reduce((sum, entry) => sum + entry.lectureTime + entry.practiceTime, 0);

    if (totalMinutes < 60) return 'light';
    if (totalMinutes < 180) return 'medium';
    return 'heavy';
  };

  const selectedEntries = selectedDate ? getEntriesForDate(selectedDate) : [];

  const intensityColors = {
    light: 'bg-primary/30',
    medium: 'bg-primary/60',
    heavy: 'bg-primary',
  };

  return (
    <div className="min-h-full p-6 pb-20">
      <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl mb-2 tracking-tight">Calendar View</h1>
          <p className="text-muted-foreground text-sm">Track your study activity over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium p-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Days */}
              {daysInMonth.map((day) => {
                const intensity = getDayIntensity(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary'
                        : intensity
                        ? intensityColors[intensity]
                        : 'bg-secondary/30 hover:bg-secondary/50'
                    } ${isToday ? 'ring-2 ring-accent' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={intensity ? 'text-black font-medium' : ''}>{format(day, 'd')}</span>
                    {intensity && <div className="w-1 h-1 rounded-full bg-black mt-1" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">Activity:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/30" />
                <span>Light</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/60" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span>Heavy</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a Date'}
            </h3>

            {selectedEntries.length > 0 ? (
              <div className="space-y-3">
                {selectedEntries.map((entry) => (
                  <div key={entry.id} className="bg-secondary/30 rounded-lg p-3">
                    <div className="font-medium text-sm">{entry.subject}</div>
                    <div className="text-xs text-muted-foreground">{entry.chapter}</div>
                    <div className="mt-2 text-xs font-mono text-primary">
                      {((entry.lectureTime + entry.practiceTime) / 60).toFixed(1)}h
                    </div>
                    {entry.dppCompleted && <div className="text-xs text-green-400 mt-1">✓ DPP</div>}
                  </div>
                ))}

                <div className="pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">Total Time</div>
                  <div className="text-xl font-mono text-primary">
                    {(
                      selectedEntries.reduce((sum, entry) => sum + entry.lectureTime + entry.practiceTime, 0) / 60
                    ).toFixed(1)}
                    h
                  </div>
                </div>
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-sm text-muted-foreground">No study sessions on this date</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👆</div>
                <p className="text-sm text-muted-foreground">Click a date to view details</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
