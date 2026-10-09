import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { MessageItem as MessageType, AppSettings } from '../../types';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  settings: AppSettings;
  onSelectSuggestion: (text: string) => void;
  onRegenerate?: (text: string) => void;
  onRetry?: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  settings,
  onSelectSuggestion,
  onRegenerate,
  onRetry,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Welcome to Dynamic AI Chatbot!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Powered by Machine Learning Intent Classifier, spaCy NER, Sentiment Engine, and Google Gemini Generative AI.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Try asking questions like:
            </p>
            <div className="flex flex-col space-y-2">
              {[
                "Explain supervised vs unsupervised machine learning",
                "Help me write a Python script for web scraping",
                "Analyze my sentiment about this project",
                "What features and capabilities do you possess?",
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => onSelectSuggestion(query)}
                  className="text-xs text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-2xs flex items-center justify-between group"
                >
                  <span>"{query}"</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-teal-500 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        messages.map((msg, index) => (
          <MessageItem
            key={msg.id || index}
            message={msg}
            settings={settings}
            onRegenerate={onRegenerate}
            onRetry={onRetry}
          />
        ))
      )}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex gap-3 my-4 max-w-3xl mr-auto">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/20">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-xs shadow-xs flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-150" />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-300" />
            <span className="text-xs text-slate-400 ml-2 font-medium">Processing NLP & AI response...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
