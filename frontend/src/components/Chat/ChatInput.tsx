import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  ArrowUp,
  Download,
  Mic,
  MicOff,
  RotateCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  onExportChat: () => void;
  onRegenerateLast?: () => void;
  language?: string;
  hasMessages: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onClearChat,
  onExportChat,
  onRegenerateLast,
  language = 'en',
  hasMessages,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, supported, error, setError, toggleListening } = useVoice(
    (transcript) =>
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript)),
    language
  );

  const send = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const keyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [text]);

  const hasText = Boolean(text.trim());

  return (
    <div className="gemini-input-wrapper">
      {error && (
        <div className="gemini-voice-alert" role="status">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="gemini-capsule">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={keyDown}
          maxLength={4000}
          placeholder={
            isListening
              ? 'Listening to your voice…'
              : 'Ask Gemini anything...'
          }
          rows={1}
          className="gemini-textarea"
          aria-label="Ask Gemini anything"
        />

        <div className="gemini-capsule-actions">
          {/* Voice Input Button */}
          <button
            type="button"
            className={`gemini-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={
              isListening
                ? 'Stop listening'
                : supported
                ? `Voice input · ${language.toUpperCase()}`
                : 'Microphone unavailable'
            }
          >
            {isListening ? (
              <span className="gemini-mic-pulse">
                <MicOff size={18} />
              </span>
            ) : (
              <Mic size={18} />
            )}
          </button>

          {/* Send Button */}
          <button
            type="button"
            className={`gemini-send-btn ${hasText && !isLoading ? 'can-send' : ''}`}
            onClick={send}
            disabled={!hasText || isLoading}
            aria-label="Send message"
            title="Send message"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      {/* Gemini Sub-bar toolbar */}
      <div className="gemini-input-subbar">
        <div className="gemini-subbar-left">
          <button
            type="button"
            onClick={onClearChat}
            disabled={isLoading || !hasMessages}
            className="gemini-subbar-btn"
            title="Clear chat history"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={onExportChat}
            disabled={!hasMessages || isLoading}
            className="gemini-subbar-btn"
            title="Export conversation"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          {onRegenerateLast && (
            <button
              type="button"
              onClick={onRegenerateLast}
              disabled={isLoading || !hasMessages}
              className="gemini-subbar-btn"
              title="Regenerate last answer"
            >
              <RotateCw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>

        <div className="gemini-subbar-right">
          <span className="gemini-disclaimer">
            <Sparkles size={11} className="inline mr-1 text-purple-400" />
            Gemini may display inaccurate info, so double-check its responses.
          </span>
        </div>
      </div>
    </div>
  );
};
