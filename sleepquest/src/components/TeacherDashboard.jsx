import { useNavigate } from "react-router-dom";
import { useTeacher } from "../hooks/useTeacher";
import { ThemeToggle, LoadingSpinner } from "./ui";
import AddQuestionForm from "./AddQuestionForm";
import ClassStudentCodes from "./ClassStudentCodes";
import { useState } from "react";
/**
 * TeacherDashboard Component
 * Main teacher interface showing class data, submissions, and question management
 */
export default function TeacherDashboard() {
  const { teacherState, isLoading, classData, questions, logout, refreshData } =
    useTeacher();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("main");

  // Check loading first to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <LoadingSpinner />
      </div>
    );
  }
  // Redirect if not authenticated
  if (!teacherState) {
    navigate("/teacher/login");
    return null;
  }

  if (currentView === "codes") {
    return (
      <div className="...">
        <div className="...">
          <button
            onClick={() => setCurrentView("main")}
            className="mb-4 px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ← הקודם
          </button>
          <ClassStudentCodes teacherState={teacherState} />
        </div>
      </div>
    );
  }


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <TeacherHeader
        teacherName={teacherState?.displayName}
        className={classData?.className}
        onLogout={handleLogout}
        onRefresh={refreshData}
        setCurrentView={setCurrentView}
        currentView={currentView}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Submissions Section */}
        <SubmissionsSection classData={classData} />

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

        {/* Add Question Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            📝 ניהול שאלות
          </h2>
          <AddQuestionForm />
        </div>

        {/* Questions Status Section */}
        {questions && questions.length > 0 && (
          <>
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
            <QuestionsStatusSection questions={questions} />
          </>
        )}
      </div>
    </div>
  );
}

function TeacherHeader({
  teacherName,
  className,
  onLogout,
  onRefresh,
  setCurrentView,
}) {
  return (
    <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                SleepQuest מורים
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {teacherName} 👋 | {className}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-colors"
              title="רענן נתונים"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            <ThemeToggle />
            <button
              onClick={() => setCurrentView("codes")}
              className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold text-sm transition-colors whitespace-nowrap"
            >
              📋 הקודים שלי עבור התלמידים
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 font-semibold text-sm transition-colors"
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SubmissionsSection({ classData }) {
  if (!classData) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        📊 הגשות תלמידים
      </h2>

      {/* Summary Card */}
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 mb-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {classData.className}
          </h3>
          <span className="text-3xl font-bold text-green-600 dark:text-green-400">
            {classData.totalStudents}
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">סה״כ תלמידים בכיתה</p>
      </div>

      {/* Submissions Table */}
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/30">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  📅 תאריך
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  ✓ הגשות
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  👥 סה״כ
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  📊 אחוז
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                  ⏰ שעה
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {classData.submissions &&
                classData.submissions.map((submission, idx) => {
                  const percentage = Math.round(
                    (submission.submitted / submission.total) * 100,
                  );
                  const date = new Date(submission.date);
                  const dateStr = date.toLocaleDateString("he-IL", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleTimeString(
                        "he-IL",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "-";

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-bold">
                          ✓ {submission.submitted}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {submission.total}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              percentage === 100
                                ? "text-green-600 dark:text-green-400"
                                : percentage >= 80
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                        {timeStr}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuestionsStatusSection({ questions }) {
  const approvedQuestions = questions.filter((q) => q.status === "approved");
  const pendingQuestions = questions.filter((q) => q.status === "pending");

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        📋 סטטוס שאלות
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved Questions */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              שאלות מאושרות
            </h3>
            <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-bold">
              {approvedQuestions.length}
            </span>
          </div>

          <div className="space-y-3">
            {approvedQuestions.length > 0 ? (
              approvedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/30"
                >
                  <p className="text-sm text-slate-900 dark:text-white">
                    {q.text}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    סוג: {getQuestionTypeLabel(q.type)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                אין שאלות מאושרות
              </p>
            )}
          </div>
        </div>

        {/* Pending Questions */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              שאלות בהמתנה
            </h3>
            <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-bold">
              {pendingQuestions.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingQuestions.length > 0 ? (
              pendingQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/30"
                >
                  <p className="text-sm text-slate-900 dark:text-white">
                    {q.text}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    סוג: {getQuestionTypeLabel(q.type)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                אין שאלות בהמתנה
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-300 flex items-start gap-2">
          <span className="mt-0.5">ℹ️</span>
          <span>
            רק שאלות מאושרות מופיעות בשאלון של התלמידים. שאלות בהמתנה יופיעו
            לאחר אישור המנהל.
          </span>
        </p>
      </div>
    </div>
  );
}

function getQuestionTypeLabel(type) {
  const labels = {
    text: "📝 טקסט חופשי",
    number: "🔢 מספר",
    radio: "⭕ בחירה אחת",
    checkbox: "☑️ בחירה מרובה",
    time: "⏰ שעה",
  };
  return labels[type] || type;
}
