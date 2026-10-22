import React, { useEffect, useRef } from 'react';
import { Download, Globe, Monitor, Moon, RotateCcw, SlidersHorizontal, Sun, Trash2, X } from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearChat: () => void;
  onExportChat: (format: 'json' | 'csv' | 'txt') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings, onClearChat, onExportChat }) => {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement;
    const element = dialog.current;
    element?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key === 'Tab' && element) {
        const controls = [...element.querySelectorAll<HTMLElement>('button:not([disabled]), select, input, [tabindex="0"]')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previouslyFocused?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;
  const reset = () => setSettings({ theme: 'dark', language: 'en', temperature: 0.7, showTimestamps: true, enableSentiment: true, contextMemory: true });
  return <div className="settings-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="settings-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="settings-title" aria-describedby="settings-description">
      <div className="settings-heading"><span className="ws-feature-icon"><SlidersHorizontal size={21} /></span><div><span className="ws-eyebrow">YOUR WORKSPACE, YOUR WAY</span><h2 id="settings-title">Preferences & settings</h2></div><button type="button" className="ws-icon-button" aria-label="Close settings" onClick={onClose}><X size={19} /></button></div>
      <p id="settings-description" className="settings-description">A few thoughtful choices for a more personal conversation.</p>
      <div className="settings-body">
        <fieldset className="settings-section"><legend>Appearance</legend><div className="theme-options">{[{ id: 'dark', label: 'Dark', icon: Moon }, { id: 'light', label: 'Light', icon: Sun }, { id: 'system', label: 'System', icon: Monitor }].map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-pressed={settings.theme === id} className={settings.theme === id ? 'selected' : ''} onClick={() => setSettings(previous => ({ ...previous, theme: id as AppSettings['theme'] }))}><Icon size={18} /><span>{label}</span></button>)}</div></fieldset>
        <div className="settings-section"><label htmlFor="response-language"><Globe size={13} />Response language</label><select id="response-language" value={settings.language} onChange={event => setSettings(previous => ({ ...previous, language: event.target.value as AppSettings['language'] }))}><option value="en">English</option><option value="hi">Hindi (हिन्दी)</option><option value="hinglish">Hinglish (Hindi in Roman script)</option></select></div>
        <div className="settings-section"><div className="setting-label-row"><label htmlFor="temperature">AI temperature</label><output htmlFor="temperature">{settings.temperature.toFixed(1)}</output></div><input id="temperature" type="range" min="0.1" max="1" step="0.1" value={settings.temperature} onChange={event => setSettings(previous => ({ ...previous, temperature: Number(event.target.value) }))} /><div className="range-labels"><span>More focused</span><span>More creative</span></div><p>Adjusts variation in Gemini responses when the provider is configured.</p></div>
        <fieldset className="settings-section"><legend>Conversation preferences</legend><div className="setting-toggles">{[{ key: 'showTimestamps', label: 'Show message timestamps', description: 'Keep track of when messages were sent.' }, { key: 'enableSentiment', label: 'Show sentiment badges', description: 'See the sentiment estimated by the backend.' }, { key: 'contextMemory', label: 'Contextual conversation memory', description: 'Saved preference. The context window is configured on the backend.' }].map(({ key, label, description }) => <label key={key} className="setting-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={settings[key as 'showTimestamps' | 'enableSentiment' | 'contextMemory']} onChange={event => setSettings(previous => ({ ...previous, [key]: event.target.checked }))} /></label>)}</div></fieldset>
        <div className="settings-section"><h3>Your conversation data</h3><p>Download a copy of the current conversation.</p><div className="export-options">{(['json', 'csv', 'txt'] as const).map(format => <button type="button" className="ws-button" key={format} onClick={() => onExportChat(format)}><Download size={13} />Export {format.toUpperCase()}</button>)}</div></div>
      </div>
      <div className="settings-footer"><button type="button" className="ws-text-button" onClick={reset}><RotateCcw size={13} />Reset to defaults</button><button type="button" className="ws-button danger" onClick={() => { onClearChat(); onClose(); }}><Trash2 size={13} />Clear messages</button></div>
    </div>
  </div>;
};
