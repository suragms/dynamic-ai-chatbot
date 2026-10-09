import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickSuggestionsProps {
  onSelectSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  "Hello",
  "What can you do?",
  "Explain machine learning",
  "Analyze my sentiment",
  "Help me with Python"
];

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 gap-1 mr-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Suggestions:</span>
      </div>
      {SUGGESTIONS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelectSuggestion(prompt)}
          className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-xs"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};
