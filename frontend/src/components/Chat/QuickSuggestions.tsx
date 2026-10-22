import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickSuggestionsProps { onSelectSuggestion: (text: string) => void; disabled?: boolean; }
const suggestions = ['Hello', 'What can you do?', 'Explain machine learning', 'Analyze my sentiment', 'Help me with Python'];

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSelectSuggestion, disabled }) => <div className="quick-suggestions" aria-label="Suggested messages"><span><Sparkles size={13} />Try asking</span><div>{suggestions.map(prompt => <button type="button" key={prompt} disabled={disabled} onClick={() => onSelectSuggestion(prompt)}>{prompt}</button>)}</div></div>;
