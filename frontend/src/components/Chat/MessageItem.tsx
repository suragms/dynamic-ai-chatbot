import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Cpu,
  RotateCw,
  ThumbsDown,
  ThumbsUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MessageItem as MessageType, AppSettings } from '../../types';
import { useVoice } from '../../hooks/useVoice';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GeminiLogo } from '../GeminiLogo';

interface MessageItemProps {
  message: MessageType;
  settings: AppSettings;
  onRegenerate?: (text: string) => void;
  onRetry?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  settings,
  onRegenerate,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const isUser = message.role === 'user';
  const { speak, stopSpeaking, isSpeaking, error: voiceError } = useVoice(
    undefined,
    settings.language
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setCopyError(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  };

  const sentiment = message.analysis?.sentiment;

  return (
    <article
      className={`gemini-message-row ${
        isUser ? 'gemini-user-row' : 'gemini-assistant-row'
      } ${message.isError ? 'gemini-error-row' : ''}`}
    >
      <div className="gemini-message-inner">
        {/* Avatar */}
        <div className="gemini-avatar-wrapper">
          {isUser ? (
            <div className="gemini-user-avatar" title="You">
              <User size={16} />
            </div>
          ) : message.isError ? (
            <div className="gemini-error-avatar" title="Error">
              <AlertCircle size={18} />
            </div>
          ) : (
            <div className="gemini-assistant-avatar" title="Gemini">
              <GeminiLogo size={22} />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="gemini-content-col">
          <div className="gemini-meta-header">
            <span className="gemini-sender-name">
              {isUser ? 'You' : 'Gemini'}
            </span>
            {settings.showTimestamps && message.timestamp && (
              <time className="gemini-timestamp" dateTime={message.timestamp}>
                <Clock size={10} />
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            )}
            {!isUser && message.provider && (
              <span className="gemini-model-badge">
                {message.provider}
              </span>
            )}
          </div>

          <div className={`gemini-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Assistant Actions Bar */}
          {!isUser && (
            <div className="gemini-action-bar">
              <button
                type="button"
                onClick={() =>
                  isSpeaking ? stopSpeaking() : speak(message.content, settings.language)
                }
                className="gemini-action-btn"
                aria-label={isSpeaking ? 'Stop speech' : 'Listen to response'}
                title={isSpeaking ? 'Stop speech' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                type="button"
                onClick={copy}
                className="gemini-action-btn"
                aria-label="Copy response"
                title={copied ? 'Copied' : 'Copy'}
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setFeedback((f) => (f === 'liked' ? null : 'liked'))}
                className={`gemini-action-btn ${feedback === 'liked' ? 'is-active text-blue-400' : ''}`}
                aria-label="Good response"
                title="Good response"
              >
                <ThumbsUp size={14} />
              </button>

              <button
                type="button"
                onClick={() => setFeedback((f) => (f === 'disliked' ? null : 'disliked'))}
                className={`gemini-action-btn ${feedback === 'disliked' ? 'is-active text-rose-400' : ''}`}
                aria-label="Bad response"
                title="Bad response"
              >
                <ThumbsDown size={14} />
              </button>

              {message.isError && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message.content)}
                  className="gemini-action-btn retry-btn"
                >
                  <RotateCw size={13} />
                  <span>Retry</span>
                </button>
              )}

              {!message.isError && onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate(message.content)}
                  className="gemini-action-btn"
                  title="Regenerate draft"
                  aria-label="Regenerate response"
                >
                  <RotateCw size={14} />
                </button>
              )}

              {/* Analysis Pills */}
              {message.analysis?.intent && message.analysis.intent !== 'unknown' && (
                <span className="gemini-intent-pill">
                  {message.analysis.intent.replace(/_/g, ' ')}
                </span>
              )}

              {settings.enableSentiment && sentiment && (
                <span className={`gemini-sentiment-pill sentiment-${sentiment}`}>
                  {sentiment}
                </span>
              )}

              {message.performance && (
                <span className="gemini-perf-tag">
                  <Cpu size={10} />
                  {message.performance.response_time_ms}ms
                </span>
              )}
            </div>
          )}

          {copyError && (
            <p className="gemini-hint-error">Select text to copy manually.</p>
          )}
          {voiceError && (
            <p className="gemini-hint-error">{voiceError}</p>
          )}
        </div>
      </div>
    </article>
  );
};
