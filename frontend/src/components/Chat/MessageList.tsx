import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, BrainCircuit, Code2, HeartPulse, Sparkles } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { MessageItem as MessageType, AppSettings } from '../../types';
import { GeminiLogo } from '../GeminiLogo';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  settings: AppSettings;
  onSelectSuggestion: (text: string) => void;
  onRegenerate?: (text: string) => void;
  onRetry?: (text: string) => void;
}

const geminiStarters = [
  {
    icon: BrainCircuit,
    title: 'Explain concepts',
    prompt: 'Explain the core difference between supervised and unsupervised machine learning in simple terms.',
  },
  {
    icon: Code2,
    title: 'Code assistance',
    prompt: 'Write a Python function with error handling for parsing JSON and calculating metrics.',
  },
  {
    icon: HeartPulse,
    title: 'Sentiment analysis',
    prompt: 'Analyze my sentiment and give feedback on how to improve team productivity.',
  },
  {
    icon: Sparkles,
    title: 'Explore capabilities',
    prompt: 'What AI and NLP features are built into this Gemini assistant?',
  },
];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  settings,
  onSelectSuggestion,
  onRegenerate,
  onRetry,
}) => {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = feedRef.current;
    if (el) {
      el.scrollTo({
        top: messages.length === 0 ? 0 : el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={feedRef}
      className={`gemini-chat-feed ${messages.length === 0 ? 'is-empty' : ''}`}
      role="log"
      aria-label="Conversation"
      aria-live="polite"
    >
      {messages.length === 0 ? (
        <div className="gemini-welcome-container">
          <div className="gemini-welcome-header">
            <div className="gemini-sparkle-halo">
              <GeminiLogo size={52} />
            </div>
            <h1 className="gemini-welcome-title">
              Hello, friend
              <br />
              <span className="gemini-gradient-text">
                How can I help you today?
              </span>
            </h1>
            <p className="gemini-welcome-subtitle">
              Ask anything, write code, explore machine learning, or analyze data.
            </p>
          </div>

          <div className="gemini-cards-grid">
            {geminiStarters.map(({ icon: Icon, title, prompt }) => (
              <button
                type="button"
                key={title}
                disabled={isLoading}
                onClick={() => onSelectSuggestion(prompt)}
                className="gemini-starter-card"
              >
                <div className="gemini-card-header">
                  <div className="gemini-card-icon">
                    <Icon size={18} />
                  </div>
                  <ArrowUpRight size={15} className="gemini-card-arrow" />
                </div>
                <div className="gemini-card-title">{title}</div>
                <div className="gemini-card-desc">{prompt}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="gemini-messages-column">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id || index}
              message={message}
              settings={settings}
              onRegenerate={!isLoading ? onRegenerate : undefined}
              onRetry={!isLoading ? onRetry : undefined}
            />
          ))}

          {isLoading && (
            <div className="gemini-typing-row" role="status">
              <div className="gemini-assistant-avatar animate-pulse">
                <GeminiLogo size={22} />
              </div>
              <div className="gemini-typing-body">
                <div className="gemini-shimmer-bar" />
                <div className="gemini-shimmer-bar short" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
