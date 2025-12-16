/**
 * QuestionInput Component
 * Renders different input types based on question configuration.
 * Supports: time, number, radio, and text inputs.
 */
export default function QuestionInput({ question, value, onChange }) {
  switch (question.type) {
    case 'time':
      return <TimeInput value={value} onChange={onChange} />;

    case 'number':
      return <NumberInput question={question} value={value} onChange={onChange} />;

    case 'radio':
      return <RadioInput question={question} value={value} onChange={onChange} />;

    default:
      return <TextInput value={value} onChange={onChange} />;
  }
}

// Time Input Component
function TimeInput({ value, onChange }) {
  return (
    <div className="flex justify-center">
      <input
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-4xl font-mono bg-slate-800/50 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl px-8 py-6 text-white text-center outline-none transition-colors"
        style={{ direction: 'ltr' }}
      />
    </div>
  );
}

// Number Input Component
function NumberInput({ question, value, onChange }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <button
          onClick={() => onChange(Math.max(0, (value || 0) - 5))}
          className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-3xl font-bold transition-colors flex items-center justify-center"
        >
          −
        </button>
        <div className="w-32 text-center">
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onChange(Math.max(0, val));
            }}
            className="w-full text-5xl font-bold bg-transparent text-white text-center outline-none"
            style={{ direction: 'ltr' }}
            min={0}
          />
          {question.unit_he && (
            <span className="text-slate-400 text-sm">{question.unit_he}</span>
          )}
        </div>
        <button
          onClick={() => onChange((value || 0) + 5)}
          className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-3xl font-bold transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Radio Input Component
function RadioInput({ question, value, onChange }) {
  return (
    <div className="space-y-3">
      {question.options_he.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`w-full p-5 rounded-xl border-2 text-right transition-all duration-200 ${
            value === option
              ? 'bg-indigo-500/20 border-indigo-500 text-white'
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                value === option
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-slate-600'
              }`}
            >
              {value === option && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-lg flex-1">{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// Text Input Component
function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-slate-800/50 border-2 border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
      placeholder="הכנס תשובה..."
    />
  );
}
