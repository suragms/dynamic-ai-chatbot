import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Bot, BrainCircuit, Code2, HeartPulse, Sparkles } from 'lucide-react';
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
const starters = [
  { icon: BrainCircuit, title: 'Explore an idea', text: 'Explain supervised vs unsupervised machine learning' },
  { icon: Code2, title: 'Build something', text: 'Help me write a Python script for web scraping' },
  { icon: HeartPulse, title: 'Understand sentiment', text: 'Analyze my sentiment about this project' },
  { icon: Sparkles, title: 'Discover the possibilities', text: 'What features and capabilities do you possess?' },
];

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, settings, onSelectSuggestion, onRegenerate, onRetry }) => {
  const feed = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = feed.current;
    if (element) element.scrollTo({ top: messages.length === 0 ? 0 : element.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [messages, isLoading]);
  return <div ref={feed} className={`conversation-feed ${messages.length === 0 ? 'is-empty' : ''}`} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
    {messages.length === 0 ? <div className="chat-welcome">
      <span className="welcome-symbol"><Sparkles size={29} /></span>
      <span className="ws-eyebrow">A SPACE FOR YOUR CURIOSITY</span>
      <h2>A little curiosity.<br /><span>A better conversation.</span></h2>
      <p>Ask a question, explore an idea, or work through a challenge. Let’s start with what’s on your mind.</p>
      <div className="chat-starters">{starters.map(({ icon: Icon, title, text }) => <button type="button" key={title} disabled={isLoading} onClick={() => onSelectSuggestion(text)}><span className="starter-heading"><Icon size={17} />{title}<ArrowUpRight size={14} /></span><span className="starter-description">{text}</span></button>)}</div>
      <span className="welcome-note"><Bot size={13} /> Local NLP + optional backend Gemini integration</span>
    </div> : <div className="message-feed-inner">{messages.map((message, index) => <MessageItem key={message.id || index} message={message} settings={settings} onRegenerate={!isLoading ? onRegenerate : undefined} onRetry={!isLoading ? onRetry : undefined} />)}</div>}
    {isLoading && <div className="typing-indicator" role="status"><span className="message-avatar"><Bot size={18} /></span><div><span className="typing-dots"><i /><i /><i /></span><span>Understanding your message…</span></div></div>}
  </div>;
};
