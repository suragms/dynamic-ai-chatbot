import React, { useState } from 'react';
import {
  BrainCircuit,
  ChevronRight,
  History,
  Languages,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
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

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  settings,
  health,
  onSendMessage,
  onClearChat,
  onExportChat,
  onRegenerateLast,
  onRetryLast,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const last = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && !m.isError);

  return (
    <div className={`gemini-chat-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Central Conversational Mainstage */}
      <section className="gemini-main-stage" aria-label="Gemini chat workspace">
        {/* Subtle sub-header bar */}
        <div className="gemini-stage-header">
          <div className="gemini-header-status">
            <span className="gemini-model-pill">
              <Sparkles size={13} className="text-purple-400" />
              <span>{health?.gemini_model || 'Gemini 3.5 Flash'}</span>
            </span>
            <span
              className={`gemini-live-indicator ${
                health?.gemini_api_configured ? 'online' : 'local'
              }`}
            >
              <i />
              {health?.gemini_api_configured
                ? 'Gemini Cloud Ready'
                : 'Local NLP Active'}
            </span>
          </div>

          <button
            type="button"
            className="gemini-sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? 'Hide analysis sidebar' : 'Show analysis sidebar'}
            title={isSidebarOpen ? 'Collapse inspector' : 'Inspect AI understanding'}
          >
            {isSidebarOpen ? (
              <>
                <PanelRightClose size={15} />
                <span>Hide Inspector</span>
              </>
            ) : (
              <>
                <PanelRightOpen size={15} />
                <span>AI Inspector</span>
              </>
            )}
          </button>
        </div>

        {/* Message Feed */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          settings={settings}
          onSelectSuggestion={onSendMessage}
          onRegenerate={onRegenerateLast}
          onRetry={onRetryLast}
        />

        {/* Floating Gemini Input Capsule */}
        <div className="gemini-bottom-anchor">
          {messages.length > 0 && (
            <QuickSuggestions
              onSelectSuggestion={onSendMessage}
              disabled={isLoading}
            />
          )}

          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            onClearChat={onClearChat}
            onExportChat={onExportChat}
            onRegenerateLast={onRegenerateLast}
            language={settings.language}
            hasMessages={messages.length > 0}
          />
        </div>
      </section>

      {/* Slide-out / Collapsible AI Inspector Drawer */}
      {isSidebarOpen && (
        <aside className="gemini-inspector-aside" aria-label="Conversation context inspector">
          <div className="gemini-inspector-header">
            <h3>
              <BrainCircuit size={16} className="text-purple-400" />
              <span>AI Inspector</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="gemini-close-btn"
              aria-label="Close inspector"
            >
              ×
            </button>
          </div>

          <div className="gemini-inspector-body">
            {/* Live Understanding */}
            <div className="gemini-inspector-card">
              <span className="card-badge">
                <Sparkles size={12} />
                LATEST UNDERSTANDING
              </span>
              {last?.analysis ? (
                <dl className="gemini-dl">
                  <div>
                    <dt><Tag size={11} /> Intent</dt>
                    <dd>{last.analysis.intent.replace(/_/g, ' ')}</dd>
                  </div>
                  <div>
                    <dt>Sentiment</dt>
                    <dd className={`sentiment-${last.analysis.sentiment}`}>
                      {last.analysis.sentiment}
                    </dd>
                  </div>
                  <div>
                    <dt>Response Provider</dt>
                    <dd className="font-mono text-xs">{last.provider || 'Gemini AI'}</dd>
                  </div>
                  {last.analysis.entities.length > 0 && (
                    <div>
                      <dt>Entities Detected</dt>
                      <dd>
                        {last.analysis.entities.map((e) => e.text).join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="gemini-placeholder-text">
                  Send a message to view live intent classification and sentiment breakdown.
                </p>
              )}
            </div>

            {/* Session Stats */}
            <div className="gemini-inspector-card">
              <span className="card-badge">
                <History size={12} />
                SESSION METRICS
              </span>
              <dl className="gemini-dl">
                <div>
                  <dt><MessageSquare size={11} /> Total Messages</dt>
                  <dd>{messages.length}</dd>
                </div>
                <div>
                  <dt><Languages size={11} /> Language</dt>
                  <dd>
                    {settings.language === 'hi'
                      ? 'Hindi'
                      : settings.language === 'hinglish'
                      ? 'Hinglish'
                      : 'English'}
                  </dd>
                </div>
                <div>
                  <dt><History size={11} /> Context Window</dt>
                  <dd>{health?.max_context_messages || 20} messages</dd>
                </div>
              </dl>
            </div>

            {/* Pipeline Steps */}
            <div className="gemini-inspector-card">
              <span className="card-badge">
                <BrainCircuit size={12} />
                ROUTING PIPELINE
              </span>
              <div className="gemini-pipeline-list">
                {[
                  'NLP tokenization & cleaning',
                  'Intent & entity recognition',
                  'Context memory retrieval',
                  'Multi-tier Gemini generation',
                ].map((step, idx) => (
                  <div key={step} className="gemini-pipeline-step">
                    <span className="step-num">{idx + 1}</span>
                    <span className="step-text">{step}</span>
                    <ChevronRight size={12} className="opacity-40" />
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials Note */}
            <p className="gemini-security-note">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <span>Credentials stay safe on backend serverless functions.</span>
            </p>
          </div>
        </aside>
      )}
    </div>
  );
};
