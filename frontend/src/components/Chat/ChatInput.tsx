import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, RefreshCw, Trash2, Download, AlertCircle, X } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  onExportChat: () => void;
  onRegenerateLast?: () => void;
  language?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onClearChat,
  onExportChat,
  onRegenerateLast,
  language = 'en',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    supported: voiceSupported,
    error: voiceError,
    setError: setVoiceError,
    toggleListening,
  } = useVoice((transcript) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, language);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-md">
      <div className="flex flex-col gap-2 max-w-4xl mx-auto">
        {/* Voice Warning Banner */}
        {voiceError && (
          <div className="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              onClick={() => setVoiceError(null)}
              className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Controls Bar above input */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearChat}
              className="flex items-center gap-1 hover:text-rose-500 transition-colors p-1 rounded"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <span>•</span>
            <button
              onClick={onExportChat}
              className="flex items-center gap-1 hover:text-teal-500 transition-colors p-1 rounded"
              title="Export Conversation"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {onRegenerateLast && (
              <>
                <span>•</span>
                <button
                  onClick={onRegenerateLast}
                  className="flex items-center gap-1 hover:text-teal-500 transition-colors p-1 rounded"
                  title="Regenerate Last Response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Regenerate</span>
                </button>
              </>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            Shift+Enter for new line • Enter to send
          </span>
        </div>

        {/* Input Box */}
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          {/* Voice Input Button (Always present with graceful fallback) */}
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
            title={
              isListening
                ? 'Listening... Click to stop'
                : voiceSupported
                ? `Voice Input (Language: ${language.toUpperCase()})`
                : 'Speech Recognition unavailable in this browser'
            }
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening to speech...' : 'Ask a question or type a message...'}
            rows={1}
            className="flex-1 bg-transparent border-none focus:outline-none resize-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 max-h-32 py-1 px-2"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20 shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
