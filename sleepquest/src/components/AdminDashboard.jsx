import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/adminHelpers';
import { ThemeToggle, LoadingSpinner } from './ui';
import QuestionsApprovalModal from './QuestionsApprovalModal';
import { exportStudentDataToExcel } from '../utils/ExcelExportUtility';
import { db } from "../firebase";

/**
 * AdminDashboard Component - FIXED VERSION
 * Main admin control panel for managing classes, questions, and data export
 *
 * FIXED:
 * - Now exports actual data from Firestore
 * - Uses proper Excel format (xlsx)
 * - Shows export progress
 * - Handles errors properly
 */
export default function AdminDashboard() {
  const { adminState, isLoading, classes, logout, refreshData } = useAdmin();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Check loading first to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect if not admin
  if (!adminState) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleExportAllData = async () => {
    await handleExportData(null);
  };

  const handleExportData = async (classId = null) => {
    setIsExporting(true);
    setExportMessage('');

    try {
      const className = classId
        ? classes.find(c => c.id === classId)?.name
        : 'כל הכיתות';

      setExportMessage(`📊 ייצוא נתונים מ${className}...`);

      // Call the fixed export function
      const result = await exportStudentDataToExcel(db, classId);

      setExportMessage(`✅ יוצאו בהצלחה ${result.submissionCount} תשובות לקובץ ${result.filename}`);

      // Clear message after 5 seconds
      setTimeout(() => setExportMessage(''), 5000);

    } catch (error) {
      console.error('Export error:', error);

      let errorMsg = 'שגיאה בייצוא הנתונים';

      if (error.message.includes('XLSX library not found')) {
        errorMsg = '❌ ספרייה xlsx חסרה. הרץ: npm install xlsx';
      } else if (error.message.includes('No student submissions')) {
        errorMsg = '⚠️ אין תשובות לתלמידים לייצוא';
      } else {
        errorMsg = `❌ שגיאה: ${error.message}`;
      }

      setExportMessage(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <AdminHeader
        adminName={adminState?.displayName}
        onLogout={handleLogout}
        onExport={handleExportAllData}
        isExporting={isExporting}
        onRefresh={refreshData}
        exportMessage={exportMessage}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats Cards */}
        <StatsSection classes={classes} />

        {/* Classes Table */}
        <ClassesTable
          classes={classes}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          isExporting={isExporting}
          onExportClass={handleExportData}
        />

        {/* Questions Approval Modal */}
        {selectedClass && (
          <QuestionsApprovalModal
            classData={selectedClass}
            onClose={() => setSelectedClass(null)}
          />
        )}
      </div>
    </div>
  );
}

function AdminHeader({ adminName, onLogout, onExport, isExporting, onRefresh, exportMessage }) {
  return (
    <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SleepQuest Admin</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                שלום {adminName} 👋
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-colors"
              title="רענן נתונים"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={onExport}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold text-sm transition-all transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center gap-2 whitespace-nowrap"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  מייצא...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-3-3m3 3l3-3M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  ייצוא נתונים
                </>
              )}
            </button>

            <ThemeToggle />

            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 font-semibold text-sm transition-colors whitespace-nowrap"
            >
              התנתק
            </button>
          </div>
        </div>

        {/* Export Message */}
        {exportMessage && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-sm">
            {exportMessage}
          </div>
        )}
      </div>
    </header>
  );
}

function StatsSection({ classes }) {
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
  const activeStudents = classes.reduce((sum, c) => sum + c.activeStudents, 0);
  const totalPending = classes.reduce((sum, c) => sum + c.pendingQuestionsCount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon="🏫"
        title="כיתות"
        value={totalClasses}
        color="indigo"
      />
      <StatCard
        icon="👥"
        title="סה״כ תלמידים"
        value={totalStudents}
        color="blue"
      />
      <StatCard
        icon="✓"
        title="תלמידים פעילים"
        value={activeStudents}
        color="green"
      />
      <StatCard
        icon="⏳"
        title="שאלות בהמתנה"
        value={totalPending}
        color="orange"
      />
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30',
    orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
  };

  const textClasses = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-6 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textClasses[color]}`}>{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

function ClassesTable({ classes, onSelectClass, isExporting, onExportClass }) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">ניהול כיתות</h2>
      </div>

      {classes.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">אין כיתות זמינות</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/30">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">שם כיתה</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">תלמידים</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">פעילים</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">בהמתנה</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    {classItem.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {classItem.totalStudents}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-medium">
                      ✓ {classItem.activeStudents}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {classItem.pendingQuestionsCount > 0 ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-sm font-bold">
                        ⏳ {classItem.pendingQuestionsCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => onSelectClass(classItem)}
                        disabled={classItem.pendingQuestionsCount === 0}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        אישור שאלות
                      </button>
                      <button
                        onClick={() => onExportClass(classItem.id)}
                        disabled={isExporting}
                        className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                        title="ייצוא נתונים של כיתה זו"
                      >
                        📊 ייצוא
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}