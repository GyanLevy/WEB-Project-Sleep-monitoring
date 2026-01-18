/**
 * Features:
 * - Add different question types (text, number, radio, checkbox, time)
 * - Custom emojis for questions and options
 * - Multi-class distribution
 * - Form validation
 * - Success/error messaging
 */

import { useAddQuestion } from "../hooks/useAddQuestion";

export default function AddQuestionForm() {
  const {
    questionText,
    setQuestionText,
    questionType,
    handleTypeChange,
    emoji,
    setEmoji,
    options,
    handleOptionChange,
    optionsEmoji,
    handleOptionEmojiChange,
    addOption,
    removeOption,
    unitHe,
    setUnitHe,
    isSubmitting,
    successMessage,
    errorMessage,
    classSelection,
    setClassSelection,
    selectedClasses,
    allClasses,
    handleClassSelection,
    questionCount,
    isFormDisabled,
    MAX_QUESTIONS,
    MAX_OPTIONS_PER_QUESTION,
    handleSubmit,
  } = useAddQuestion();

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800/80 dark:to-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                הוסף שאלה חדשה
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isFormDisabled
                  ? "❌ הבעת למקסימום של 5 שאלות"
                  : `${questionCount}/${MAX_QUESTIONS} שאלות בשימוש`}
              </p>
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              isFormDisabled
                ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                : "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
            }`}
          >
            {questionCount}/{MAX_QUESTIONS}
          </div>
        </div>

        <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              questionCount >= MAX_QUESTIONS
                ? "bg-red-500"
                : questionCount >= 3
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Question Text Input */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            טקסט השאלה *
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            disabled={isFormDisabled}
            placeholder="כתוב את השאלה שברצונך להוסיף לשאלון..."
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none h-24 ${
              isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {questionText.length} / 200 תווים
          </p>
        </div>

        {/* Question Type Select */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            סוג השאלה *
          </label>
          <select
            value={questionType}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isFormDisabled}
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="text">📝 טקסט חופשי</option>
            <option value="number">🔢 מספר</option>
            <option value="radio">⭕ בחירה אחת (רדיו)</option>
            <option value="checkbox">☑️ כן / לא</option>
            <option value="time">⏰ שעה</option>
          </select>
        </div>

        {/* Emoji Picker */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            אימוג'י לשאלה
          </label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
            disabled={isFormDisabled}
            maxLength={2}
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-3xl text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="😀"
          />
        </div>

        {/* Unit for Number Questions */}
        {questionType === "number" && (
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              יחידת מידה (אופציונלי)
            </label>
            <input
              type="text"
              value={unitHe}
              onChange={(e) => setUnitHe(e.target.value)}
              disabled={isFormDisabled}
              placeholder="לדוגמה: שעות, דקות, מ״מ"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
        )}

        {/* Info Message for Checkbox Questions */}
        {questionType === "checkbox" && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-blue-600 dark:text-blue-300">
              ℹ️ שאלות כן/לא יציגו אוטומטית שתי אפשרויות: <strong>כן</strong> ו
              <strong>לא</strong> עם אימוג'ים ✅ ❌
            </p>
          </div>
        )}

        {/* Radio Options - Only show for radio type */}
        {questionType === "radio" && (
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              אפשרויות * (לפחות 2)
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    disabled={isFormDisabled}
                    placeholder={`אפשרות ${index + 1}`}
                    className={`flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                  <input
                    type="text"
                    value={optionsEmoji[index] || ""}
                    onChange={(e) =>
                      handleOptionEmojiChange(index, e.target.value)
                    }
                    disabled={isFormDisabled}
                    maxLength={2}
                    placeholder="😀"
                    className={`w-16 px-2 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-2xl text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={isFormDisabled}
                      className={`px-3 py-2 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-colors ${
                        isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                disabled={
                  isFormDisabled || options.length >= MAX_OPTIONS_PER_QUESTION
                }
                className={`w-full px-4 py-2 border-2 border-dashed border-green-500 dark:border-green-400 text-green-600 dark:text-green-400 rounded-lg font-medium transition-colors ${
                  isFormDisabled || options.length >= MAX_OPTIONS_PER_QUESTION
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-50 dark:hover:bg-green-500/10"
                }`}
              >
                + הוסף אפשרות
              </button>
            </div>
          </div>
        )}

        {/* Multi-Class Selection */}
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            🎯 איזו כיתה צריכה לראות את השאלה? *
          </label>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 cursor-pointer rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="radio"
                name="classSelection"
                value="current"
                checked={classSelection === "current"}
                onChange={(e) => setClassSelection(e.target.value)}
                className="w-4 h-4 text-green-600"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  הכיתה שלי בלבד
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  השאלה תופיע רק לתלמידי הכיתה שלי
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 cursor-pointer rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="radio"
                name="classSelection"
                value="all"
                checked={classSelection === "all"}
                onChange={(e) => setClassSelection(e.target.value)}
                className="w-4 h-4 text-green-600"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  כל הכיתות
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  השאלה תופיע לכל התלמידים בבית הספר
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 cursor-pointer rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="radio"
                name="classSelection"
                value="specific"
                checked={classSelection === "specific"}
                onChange={(e) => setClassSelection(e.target.value)}
                className="w-4 h-4 text-green-600"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  כיתות ספציפיות
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  בחר את הכיתות שיראו את השאלה
                </div>
              </div>
            </label>
          </div>

          {classSelection === "specific" && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/30">
              <div className="grid grid-cols-2 gap-2">
                {allClasses.map((cls) => (
                  <label
                    key={cls.id}
                    className="flex items-center gap-2 p-2 cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.id)}
                      onChange={() => handleClassSelection(cls.id)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {cls.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4 text-green-600 dark:text-green-300 text-sm animate-pulse">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isFormDisabled || isSubmitting || !questionText.trim()}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform flex items-center justify-center gap-2 ${
            isFormDisabled
              ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:scale-[1.02] active:scale-100"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              שומר...
            </>
          ) : isFormDisabled ? (
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              הטופס נעול - הבעת למקסימום
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-4-2m4 2l4-2"
                />
              </svg>
              הוסף שאלה
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {isFormDisabled
            ? "אינך יכול להוסיף שאלות כאשר הבעת לחמש שאלות בשימוש"
            : `💡 אתה יכול להוסיף עד ${MAX_QUESTIONS} שאלות. לאחר הוספה, השאלות ממתינות לאישור`}
        </p>
      </form>
    </div>
  );
}
