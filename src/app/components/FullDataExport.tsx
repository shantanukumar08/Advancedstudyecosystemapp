import { motion } from 'motion/react';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FullDataExportProps {
  studyEntries: any[];
  goals: any[];
  chapters: any[];
  tasks: any[];
  achievements: any[];
  streak: number;
  userLevel: number;
  userXP: number;
  appMode: string;
}

export default function FullDataExport({
  studyEntries,
  goals,
  chapters,
  tasks,
  achievements,
  streak,
  userLevel,
  userXP,
  appMode,
}: FullDataExportProps) {
  const handleExportExcel = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Overview
      const overviewData = [
        ['Study Tracker Report'],
        ['Export Date:', new Date().toLocaleDateString()],
        ['Study Mode:', appMode],
        [''],
        ['Summary Statistics'],
        ['User Level:', userLevel],
        ['Total XP:', userXP],
        ['Current Streak:', `${streak} days`],
        ['Total Study Sessions:', studyEntries.length],
        ['Active Goals:', goals.length],
        ['Tracked Chapters:', chapters.length],
        ['Pending Tasks:', tasks.filter((t) => !t.completed).length],
        ['Achievements Unlocked:', achievements.filter((a) => a.unlocked).length],
      ];
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

      // Sheet 2: Study Entries
      if (studyEntries.length > 0) {
        const studyData = studyEntries.map((entry) => ({
          Date: format(new Date(entry.date), 'yyyy-MM-dd'),
          Subject: entry.subject,
          Chapter: entry.chapter,
          Topic: entry.topic || '',
          'Lecture Number': entry.lectureNumber || '',
          'Lecture Time (min)': entry.lectureTime,
          'Practice Time (min)': entry.practiceTime,
          'Total Time (hrs)': ((entry.lectureTime + entry.practiceTime) / 60).toFixed(2),
          'DPP Completed': entry.dppCompleted ? 'Yes' : 'No',
          'Revisions Done': entry.revisionsDone || 0,
          'Score (%)': entry.score || '',
          'Focus Score': entry.focusScore || '',
          Notes: entry.notes || '',
        }));
        const wsStudy = XLSX.utils.json_to_sheet(studyData);
        XLSX.utils.book_append_sheet(wb, wsStudy, 'Study Sessions');
      }

      // Sheet 3: Chapters
      if (chapters.length > 0) {
        const chapterData = chapters.map((ch: any) => ({
          Subject: ch.subject,
          Chapter: ch.chapter,
          Team: ch.teamName,
          'Book Name': ch.bookName || '',
          'Page From': ch.pageFrom || '',
          'Page To': ch.pageTo || '',
          'Start Date': ch.startDate ? format(new Date(ch.startDate), 'yyyy-MM-dd') : '',
          'End Date': ch.endDate ? format(new Date(ch.endDate), 'yyyy-MM-dd') : '',
          Status: ch.status,
          Notes: ch.notes || '',
        }));
        const wsChapters = XLSX.utils.json_to_sheet(chapterData);
        XLSX.utils.book_append_sheet(wb, wsChapters, 'Chapters');
      }

      // Sheet 4: Tasks
      if (tasks.length > 0) {
        const taskData = tasks.map((task: any) => ({
          Title: task.title,
          Description: task.description || '',
          Deadline: format(new Date(task.deadline), 'yyyy-MM-dd'),
          Priority: task.priority,
          Category: task.category,
          Status: task.completed ? 'Completed' : 'Pending',
          'Created At': format(new Date(task.createdAt), 'yyyy-MM-dd'),
        }));
        const wsTasks = XLSX.utils.json_to_sheet(taskData);
        XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');
      }

      // Sheet 5: Goals
      if (goals.length > 0) {
        const goalData = goals.map((goal) => ({
          Subject: goal.subject,
          Type: goal.type,
          'Target Hours': goal.targetHours,
          'Current Hours': goal.currentHours,
          'Progress (%)': ((goal.currentHours / goal.targetHours) * 100).toFixed(1),
          Deadline: goal.deadline ? format(new Date(goal.deadline), 'yyyy-MM-dd') : '',
        }));
        const wsGoals = XLSX.utils.json_to_sheet(goalData);
        XLSX.utils.book_append_sheet(wb, wsGoals, 'Goals');
      }

      // Sheet 6: Achievements
      if (achievements.length > 0) {
        const achievementData = achievements.map((ach) => ({
          Title: ach.title,
          Description: ach.description,
          Status: ach.unlocked ? 'Unlocked' : 'Locked',
          'Unlocked Date': ach.unlockedDate ? format(new Date(ach.unlockedDate), 'yyyy-MM-dd') : '',
          'XP Reward': ach.xp,
        }));
        const wsAchievements = XLSX.utils.json_to_sheet(achievementData);
        XLSX.utils.book_append_sheet(wb, wsAchievements, 'Achievements');
      }

      // Generate Excel file
      const fileName = `Complete-Study-Data-${appMode}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Excel exported successfully!', {
        description: `${fileName} has been downloaded`,
      });
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Failed to export Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title Page
      doc.setFontSize(24);
      doc.text('Study Tracker Report', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Study Mode: ${appMode}`, 105, 35, { align: 'center' });
      doc.text(`Generated: ${format(new Date(), 'PPP')}`, 105, 42, { align: 'center' });

      // Summary Statistics
      doc.setFontSize(16);
      doc.text('Summary Statistics', 14, 60);

      doc.setFontSize(10);
      let yPos = 70;
      const stats = [
        ['User Level:', userLevel.toString()],
        ['Total XP:', userXP.toString()],
        ['Current Streak:', `${streak} days`],
        ['Total Study Sessions:', studyEntries.length.toString()],
        ['Active Goals:', goals.length.toString()],
        ['Tracked Chapters:', chapters.length.toString()],
        ['Pending Tasks:', tasks.filter((t) => !t.completed).length.toString()],
        ['Achievements Unlocked:', `${achievements.filter((a) => a.unlocked).length}/${achievements.length}`],
      ];

      stats.forEach(([label, value]) => {
        doc.text(`${label} ${value}`, 14, yPos);
        yPos += 7;
      });

      // Study Sessions Table
      if (studyEntries.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Study Sessions', 14, 15);

        const studyTableData = studyEntries.slice(0, 50).map((entry) => [
          format(new Date(entry.date), 'MM/dd/yyyy'),
          entry.subject,
          entry.chapter,
          entry.lectureNumber || '-',
          `${entry.lectureTime}m`,
          `${entry.practiceTime}m`,
          entry.dppCompleted ? 'Yes' : 'No',
          entry.score ? `${entry.score}%` : '-',
        ]);

        autoTable(doc, {
          head: [['Date', 'Subject', 'Chapter', 'Lec#', 'Lec Time', 'Practice', 'DPP', 'Score']],
          body: studyTableData,
          startY: 25,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [0, 217, 255] },
        });

        if (studyEntries.length > 50) {
          doc.setFontSize(8);
          doc.text(`Showing first 50 of ${studyEntries.length} sessions. Export Excel for complete data.`, 14, doc.lastAutoTable.finalY + 10);
        }
      }

      // Chapters Table
      if (chapters.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Chapter Tracker', 14, 15);

        const chapterTableData = chapters.map((ch: any) => [
          ch.subject,
          ch.chapter,
          ch.teamName,
          ch.bookName || '-',
          ch.pageFrom && ch.pageTo ? `${ch.pageFrom}-${ch.pageTo}` : '-',
          ch.status,
        ]);

        autoTable(doc, {
          head: [['Subject', 'Chapter', 'Team', 'Book', 'Pages', 'Status']],
          body: chapterTableData,
          startY: 25,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [0, 217, 255] },
        });
      }

      // Tasks Table
      if (tasks.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Tasks & Deadlines', 14, 15);

        const taskTableData = tasks.map((task: any) => [
          task.title,
          format(new Date(task.deadline), 'MM/dd/yyyy'),
          task.priority,
          task.completed ? 'Done' : 'Pending',
        ]);

        autoTable(doc, {
          head: [['Task', 'Deadline', 'Priority', 'Status']],
          body: taskTableData,
          startY: 25,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [0, 217, 255] },
        });
      }

      // Goals Table
      if (goals.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Goals Progress', 14, 15);

        const goalTableData = goals.map((goal) => [
          goal.subject,
          goal.type,
          `${goal.targetHours}h`,
          `${goal.currentHours.toFixed(1)}h`,
          `${((goal.currentHours / goal.targetHours) * 100).toFixed(0)}%`,
        ]);

        autoTable(doc, {
          head: [['Subject', 'Type', 'Target', 'Current', 'Progress']],
          body: goalTableData,
          startY: 25,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [0, 217, 255] },
        });
      }

      // Save PDF
      const fileName = `Complete-Study-Data-${appMode}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      toast.success('PDF exported successfully!', {
        description: `${fileName} has been downloaded`,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    }
  };

  const totalDataPoints =
    studyEntries.length + goals.length + chapters.length + tasks.length + achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Export Buttons */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-400/10 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg mb-2">Complete Excel Export</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export ALL data to Excel with multiple sheets: Study Sessions, Chapters, Tasks, Goals, and Achievements
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xs text-muted-foreground">
                📊 {studyEntries.length} Sessions • 📚 {chapters.length} Chapters • ✅ {tasks.length} Tasks • 🎯{' '}
                {goals.length} Goals
              </div>
            </div>
            <Button onClick={handleExportExcel} className="bg-green-400 hover:bg-green-500 text-black">
              <Download className="w-4 h-4 mr-2" />
              Export Complete Excel ({totalDataPoints} items)
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-card border border-border rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-400/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg mb-2">Complete PDF Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a comprehensive PDF report with all your study data, formatted and ready to print or share
            </p>
            <div className="text-xs text-muted-foreground mb-4">
              ⚠️ Note: PDF shows up to 50 study sessions. Use Excel for complete data.
            </div>
            <Button onClick={handleExportPDF} className="bg-red-400 hover:bg-red-500 text-black">
              <Download className="w-4 h-4 mr-2" />
              Export Complete PDF Report
            </Button>
          </div>
        </div>
      </motion.div>

      {totalDataPoints === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl mb-2">No Data to Export</h3>
          <p className="text-muted-foreground">Start adding study sessions, chapters, and tasks to generate exports</p>
        </div>
      )}
    </div>
  );
}
