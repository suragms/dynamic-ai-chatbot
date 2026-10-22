import React from 'react';
import { BrainCircuit, ChevronRight, History, Languages, MessageSquare, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickSuggestions } from './QuickSuggestions';
import { MessageItem, AppSettings, HealthStatus } from '../../types';

interface ChatContainerProps {
  messages: MessageItem[];
  isLoading: boolean;
  settings: AppSettings;
  health: HealthStatus | null;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onRegenerateLast?: () => void;
  onRetryLast?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading, settings, health, onSendMessage, onClearChat, onExportChat, onRegenerateLast, onRetryLast }) => {
  const last = [...messages].reverse().find(message => message.role === 'assistant' && !message.isError);
  return <div className="chat-layout">
    <section className="conversation-panel" aria-label="Chat workspace">
      <div className="conversation-panel-heading"><div><span className="ws-eyebrow">YOUR CONVERSATION</span><h1>Make room for a good question.</h1></div><span className="conversation-mode"><i />{health ? 'Backend connected' : 'Backend unavailable'}</span></div>
      <MessageList messages={messages} isLoading={isLoading} settings={settings} onSelectSuggestion={onSendMessage} onRegenerate={onRegenerateLast} onRetry={onRetryLast} />
      <div className="conversation-compose"><QuickSuggestions onSelectSuggestion={onSendMessage} disabled={isLoading} /><ChatInput onSendMessage={onSendMessage} isLoading={isLoading} onClearChat={onClearChat} onExportChat={onExportChat} onRegenerateLast={onRegenerateLast} language={settings.language} hasMessages={messages.length > 0} /><p className="composer-note">{health ? 'AI can make mistakes. Review responses before using them.' : 'Start the project backend to send messages.'}</p></div>
    </section>
    <aside className="conversation-sidebar" aria-label="Conversation context">
      <div className="context-card"><span className="context-card-label"><BrainCircuit size={15} />BEHIND THE CONVERSATION</span><h2>Understanding,<br /><span>one message at a time.</span></h2><p>Language, intent, and context help shape every response.</p><div className="context-pipeline">{['Understand the message', 'Retrieve recent context', 'Choose the response route'].map((label, i) => <span key={label}><i>{i + 1}</i>{label}<ChevronRight size={12} /></span>)}</div></div>
      <div className="context-card session-card"><h3><History size={15} />This session</h3><dl><div><dt><MessageSquare size={12} />Messages</dt><dd>{messages.length}</dd></div><div><dt><Languages size={12} />Language</dt><dd>{settings.language === 'hi' ? 'Hindi' : settings.language === 'hinglish' ? 'Hinglish' : 'English'}</dd></div><div><dt><History size={12} />Context window</dt><dd>{health ? `${health.max_context_messages} messages` : 'Backend required'}</dd></div></dl></div>
      <div className="context-card latest-analysis"><h3><Sparkles size={15} />Latest understanding</h3>{last?.analysis ? <dl><div><dt><Tag size={12} />Intent</dt><dd>{last.analysis.intent.replace(/_/g, ' ')}</dd></div><div><dt>Sentiment</dt><dd className={`sentiment-${last.analysis.sentiment}`}>{last.analysis.sentiment}</dd></div><div><dt>Response route</dt><dd>{last.provider || 'Not reported'}</dd></div>{last.analysis.entities.length > 0 && <div><dt>Entities</dt><dd>{last.analysis.entities.map(entity => entity.text).join(', ')}</dd></div>}</dl> : <div className="analysis-placeholder"><span className="analysis-placeholder-lines"><i /><i /><i /></span><p>Intent and sentiment appear here after your first response.</p></div>}</div>
      <p className="context-security"><ShieldCheck size={14} /><span>Gemini credentials stay on the backend. {health?.gemini_api_configured ? 'Live provider connectivity is unverified.' : 'Local replies work without an API key.'}</span></p>
    </aside>
  </div>;
};
