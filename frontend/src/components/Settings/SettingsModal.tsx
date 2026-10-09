import React from 'react';
import { X, Moon, Sun, Monitor, Globe, Sliders, Download, Trash2, RotateCcw } from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearChat: () => void;
  onExportChat: (format: 'json' | 'csv' | 'txt') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  onClearChat,
  onExportChat,
}) => {
  if (!isOpen) return null;

  const resetSettings = () => {
    setSettings({
      theme: 'system',
      language: 'en',
      temperature: 0.7,
      showTimestamps: true,
      enableSentiment: true,
      contextMemory: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-500" />
            <span>Chatbot Preferences & Settings</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Appearance Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSettings((prev) => ({ ...prev, theme: id as any }))}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                    settings.theme === id
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Multilingual Support */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Response Language</span>
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value as any }))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="en">English (Default)</option>
              <option value="hi">Hindi (हिन्दी - Devanagari)</option>
              <option value="hinglish">Hinglish (Hindi in Roman script)</option>
            </select>
          </div>

          {/* AI Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold uppercase tracking-wider text-slate-400">
                AI Temperature (Creativity)
              </label>
              <span className="font-bold text-teal-600 dark:text-teal-400">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full accent-teal-500"
            />
            <p className="text-[11px] text-slate-400">
              Lower values (0.1–0.4) are more deterministic & factual; higher values (0.7–1.0) increase creativity.
            </p>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chat Features & Badges
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                <span>Show Message Timestamps</span>
                <input
                  type="checkbox"
                  checked={settings.showTimestamps}
                  onChange={(e) => setSettings((prev) => ({ ...prev, showTimestamps: e.target.checked }))}
                  className="accent-teal-500 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                <span>Enable Real-time Sentiment Badges</span>
                <input
                  type="checkbox"
                  checked={settings.enableSentiment}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enableSentiment: e.target.checked }))}
                  className="accent-teal-500 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                <span>Contextual Conversation Memory</span>
                <input
                  type="checkbox"
                  checked={settings.contextMemory}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contextMemory: e.target.checked }))}
                  className="accent-teal-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Export & Danger Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Data & Conversation Management
            </label>
            <div className="flex flex-wrap gap-2">
              {(['json', 'csv', 'txt'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onExportChat(fmt)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-teal-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export {fmt.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={resetSettings}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
              <button
                onClick={() => {
                  onClearChat();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Messages</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
