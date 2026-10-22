import React from 'react';
import { ArrowLeft, BarChart3, Bot, Info, Moon, Settings, Sun } from 'lucide-react';
import { AppSettings, HealthStatus } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'analytics' | 'about';
  setActiveTab: (tab: 'chat' | 'analytics' | 'about') => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  openSettingsModal: () => void;
  health: HealthStatus | null;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, setSettings, openSettingsModal, health, isDark }) => {
  const tabs = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  return (
    <header className="workspace-header">
      <div className="workspace-header-inner">
        <a className="workspace-brand" href="#home" aria-label="Dynamic AI - suragzidio">
          <span className="workspace-logo" aria-hidden="true">
            <Bot size={18} />
          </span>
          <span className="workspace-brand-text">
            Dynamic AI
            <span className="workspace-brand-subtitle">suragzidio</span>
          </span>
        </a>
        <nav className="workspace-tabs" aria-label="Workspace navigation">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              aria-label={`Open ${label} view`}
              aria-current={activeTab === id ? 'page' : undefined}
              className={activeTab === id ? 'selected' : ''}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
        <div className="workspace-header-tools">
          <span
            className={`workspace-connection ${health ? 'connected' : 'unavailable'}`}
            title={
              health?.gemini_api_configured
                ? 'Gemini API configured. Live responses active.'
                : health
                ? 'Backend connected. Local NLP mode.'
                : 'Start the Flask backend to enable chat.'
            }
          >
            <i />
            {health ? (health.gemini_api_configured ? 'Gemini configured' : 'Local NLP mode') : 'Backend unavailable'}
          </span>
          <button
            type="button"
            className="ws-icon-button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            onClick={() => setSettings((previous) => ({ ...previous, theme: isDark ? 'light' : 'dark' }))}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            type="button"
            className="ws-icon-button"
            aria-label="Open Settings"
            title="Settings"
            onClick={openSettingsModal}
          >
            <Settings size={15} />
          </button>
          <a className="workspace-home" href="#home">
            <ArrowLeft size={13} />
            <span>Back to home</span>
          </a>
        </div>
      </div>
    </header>
  );
};
