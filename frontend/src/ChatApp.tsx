import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatContainer } from './components/Chat/ChatContainer';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { AboutView } from './components/About/AboutView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { api } from './services/api';
import { MessageItem, AppSettings, HealthStatus } from './types';
import './workspace.css';

export const App: React.FC<{ initialTab?: 'chat' | 'analytics'; visible?: boolean }> = ({ initialTab = 'chat', visible = true }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'about'>(initialTab);
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('chatbot_session_id') || self.crypto.randomUUID();
  });
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [notice, setNotice] = useState('');
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Keep workspace state when visitors return to the landing page.
  useEffect(() => {
    const syncView = () => {
      if (window.location.hash === '#app/analytics') setActiveTab('analytics');
      if (window.location.hash === '#app/chat') setActiveTab('chat');
    };
    window.addEventListener('hashchange', syncView);
    return () => window.removeEventListener('hashchange', syncView);
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('chatbot_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      theme: 'dark',
      language: 'en',
      temperature: 0.7,
      showTimestamps: true,
      enableSentiment: true,
      contextMemory: true,
    };
  });

  // Persist session ID
  useEffect(() => {
    localStorage.setItem('chatbot_session_id', sessionId);
  }, [sessionId]);

  // Persist settings & Theme Effect
  useEffect(() => {
    localStorage.setItem('chatbot_settings', JSON.stringify(settings));

    const root = document.documentElement;
    if (
      settings.theme === 'dark' ||
      (settings.theme === 'system' && systemDark)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings, systemDark]);

  // Check backend health status
  useEffect(() => {
    api
      .checkHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (isLoading) return;
    const userMsg: MessageItem = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendMessage({
        message: text,
        session_id: sessionId,
        language: settings.language,
        temperature: settings.temperature,
      });

      const assistantMsg: MessageItem = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date().toISOString(),
        analysis: response.analysis,
        performance: response.performance,
        provider: response.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: Date.now() + 1,
        role: 'assistant',
        content: err.message || 'An error occurred while generating response.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleRetryLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearConversation(sessionId);
    } catch (e) {
      // ignore
    }
    const newSession = self.crypto.randomUUID();
    setSessionId(newSession);
    setMessages([]);
  };

  const handleExportChat = async (format: 'json' | 'csv' | 'txt' = 'json') => {
    try {
      await api.exportChat(sessionId, format);
      setNotice(`Conversation exported as ${format.toUpperCase()}.`);
    } catch {
      setNotice('Unable to export. Check the backend connection and try again.');
    }
  };

  if (!visible) return null;

  return (
    <div className="workspace" data-theme={settings.theme === 'light' || (settings.theme === 'system' && !systemDark) ? 'light' : 'dark'}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        openSettingsModal={() => setIsSettingsOpen(true)}
        health={health}
        isDark={settings.theme === 'dark' || (settings.theme === 'system' && systemDark)}
      />

      <main className="workspace-main">
        {activeTab === 'chat' && (
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            settings={settings}
            health={health}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onExportChat={() => handleExportChat('json')}
            onRegenerateLast={messages.length > 0 ? handleRegenerateLast : undefined}
            onRetryLast={messages.some((m) => m.isError) ? handleRetryLast : undefined}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'about' && <AboutView health={health} />}
      </main>

      {notice && <div className="workspace-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
      />
    </div>
  );
};

export default App;
