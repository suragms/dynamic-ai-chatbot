import React from 'react';
import { Bot, BarChart2, Settings, Moon, Sun, Globe, Info } from 'lucide-react';
import { AppSettings, HealthStatus } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'analytics' | 'about';
  setActiveTab: (tab: 'chat' | 'analytics' | 'about') => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  openSettingsModal: () => void;
  health: HealthStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  setSettings,
  openSettingsModal,
  health,
}) => {
  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 flex items-center justify-between shadow-sm transition-colors duration-200">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-teal-700 to-slate-800 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dynamic AI Chatbot
          </h1>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${health?.gemini_api_configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {health?.gemini_api_configured ? 'Gemini AI Online' : 'Local NLP Fallback'}
            </span>
            <span>•</span>
            <span>{settings.language.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Navigation & Tools */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Tab Switcher */}
        <div className="bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg flex items-center border border-slate-200 dark:border-slate-600">
          <button
            onClick={() => setActiveTab('chat')}
            aria-label="Open Chat view"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            aria-label="Open Analytics view"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            aria-label="Open About view"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </div>

        {/* Quick Language Toggle */}
        <div className="hidden sm:flex items-center space-x-1 text-xs bg-slate-100 dark:bg-slate-700/60 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['en', 'hi', 'hinglish'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSettings((prev) => ({ ...prev, language: lang }))}
              aria-label={`Switch language to ${lang}`}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                settings.language === lang
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={openSettingsModal}
          aria-label="Open Settings"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
