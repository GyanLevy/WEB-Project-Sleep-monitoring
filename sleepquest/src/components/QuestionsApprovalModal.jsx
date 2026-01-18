import { useState } from "react";
import { useAdmin } from "../context/adminHelpers";

/**
 * QuestionsApprovalModal Component - Multi-Class Edition
 * Modal for approving or rejecting pending questions from a class
 */
export default function QuestionsApprovalModal({ classData, onClose }) {
  const { handleQuestionApproval } = useAdmin();
  const [processing, setProcessing] = useState(null);

  if (!classData?.pending || classData.pending.length === 0) {
    return (
      <ModalBackdrop onClose={onClose}>
        <ModalContent>
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              אין שאלות בהמתנה לאישור
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
            >
              סגור
            </button>
          </div>
        </ModalContent>
      </ModalBackdrop>
    );
  }

  const handleApprove = async (question) => {
    setProcessing(question.id);
    const result = await handleQuestionApproval(
      classData.id,
      question.id,
      true,
    );
    if (result.success) {
      console.log("✅ Question approved");
    }
    setProcessing(null);
  };

  const handleReject = async (question) => {
    setProcessing(question.id);
    const result = await handleQuestionApproval(
      classData.id,
      question.id,
      false,
    );
    if (result.success) {
      console.log("✅ Question rejected");
    }
    setProcessing(null);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalContent isLarge>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            אישור שאלות - {classData.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-slate-600 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Questions List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {classData.pending.map((question) => (
            <QuestionApprovalCard
              key={question.id}
              question={question}
              isProcessing={processing === question.id}
              onApprove={() => handleApprove(question)}
              onReject={() => handleReject(question)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-700/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors"
          >
            סגור
          </button>
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
}

function QuestionApprovalCard({ question, isProcessing, onApprove, onReject }) {
  // Support both old format (questionText) and new format (text_he)
  const questionText = question.text_he || question.questionText || "שאלה";
  const questionType = question.type || "text";
  const emoji = question.emoji || "📝";
  const classIds = question.classIds || [];

  // Determine which classes this applies to
  const classDisplay = classIds.includes("all")
    ? "🌍 כל הכיתות"
    : classIds.length > 1
      ? `📚 ${classIds.length} כיתות`
      : classIds.length === 1
        ? `📚 כיתה אחת`
        : "כל הכיתות";

  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 transition-all duration-300 hover:shadow-md dark:hover:shadow-xl">
      {/* Question Info */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{emoji}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {questionText}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full">
                {getQuestionTypeLabel(questionType)}
              </span>
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full">
                {classDisplay}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold">
            ⏳ בהמתנה
          </span>
        </div>

        {/* Show options if radio question */}
        {questionType === "radio" && question.options_he && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border-r-4 border-indigo-500">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              אפשרויות:
            </p>
            <div className="flex flex-wrap gap-2">
              {question.options_he.map((option, idx) => {
                const optionEmoji = question.options_emoji?.[idx];
                return (
                  <div
                    key={idx}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm"
                  >
                    {optionEmoji && <span className="mr-1">{optionEmoji}</span>}
                    {option}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show unit if number question */}
        {questionType === "number" && question.unit_he && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border-r-4 border-green-500">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              יחידת מידה:
            </p>
            <p className="text-slate-900 dark:text-white font-medium">
              {question.unit_he}
            </p>
          </div>
        )}

        {/* Proposed Text (for old-style custom questions) */}
        {question.proposedText && (
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-500/30">
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-2 font-medium">
              💡 טקסט מוצע:
            </p>
            <p className="text-blue-900 dark:text-blue-100">
              "{question.proposedText}"
            </p>
          </div>
        )}

        {/* Reason (for old-style custom questions) */}
        {question.reason && (
          <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-lg p-4 mb-4 border border-yellow-200 dark:border-yellow-500/30">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2 font-medium">
              📝 סיבת הצעה:
            </p>
            <p className="text-yellow-900 dark:text-yellow-100">
              {question.reason}
            </p>
          </div>
        )}

        {/* Timestamp */}
        {question.submittedAt && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            ⏰ הוגש:{" "}
            {new Date(question.submittedAt).toLocaleDateString("he-IL")} בשעה{" "}
            {new Date(question.submittedAt).toLocaleTimeString("he-IL")}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              מעדכן...
            </>
          ) : (
            <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              ✅ אישור
            </>
          )}
        </button>

        <button
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              מעדכן...
            </>
          ) : (
            <>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              ❌ דחייה
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ModalBackdrop({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalContent({ children, isLarge = false }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl transition-colors duration-300 ${
        isLarge ? "max-w-2xl w-full" : "max-w-md w-full"
      }`}
    >
      {children}
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
