import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ArrowUp, Download, Mic, MicOff, RotateCw, Trash2, X } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
  onExportChat: () => void;
  onRegenerateLast?: () => void;
  language?: string;
  hasMessages: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onClearChat, onExportChat, onRegenerateLast, language = 'en', hasMessages }) => {
  const [text, setText] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const { isListening, supported, error, setError, toggleListening } = useVoice(transcript => setText(previous => previous ? `${previous} ${transcript}` : transcript), language);
  const send = () => { if (!text.trim() || isLoading) return; onSendMessage(text.trim()); setText(''); textarea.current?.focus(); };
  const keyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } };
  useEffect(() => { if (textarea.current) { textarea.current.style.height = 'auto'; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 120)}px`; } }, [text]);
  return <div className="chat-input-wrapper">
    {error && <div className="voice-warning" role="status"><AlertCircle size={15} /><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Dismiss voice message"><X size={14} /></button></div>}
    <div className="chat-input-box"><textarea ref={textarea} aria-label="Message" value={text} onChange={event => setText(event.target.value)} onKeyDown={keyDown} maxLength={4000} placeholder={isListening ? 'Listening to speech…' : 'Ask a question or type a message…'} rows={1} /><div className="composer-input-actions"><button type="button" className={`ws-icon-button ${isListening ? 'is-listening' : ''}`} onClick={toggleListening} aria-label={isListening ? 'Stop voice input' : 'Start voice input'} title={isListening ? 'Stop listening' : supported ? `Voice input · ${language.toUpperCase()}` : 'Speech recognition unavailable in this browser'}>{isListening ? <MicOff size={17} /> : <Mic size={17} />}</button><button type="button" className="send-message" onClick={send} disabled={!text.trim() || isLoading} aria-label="Send Message" title="Send message"><ArrowUp size={20} /></button></div></div>
    <div className="composer-toolbar"><div><button type="button" onClick={onClearChat} disabled={isLoading || !hasMessages} aria-label="Clear Conversation"><Trash2 size={13} /><span>Clear</span></button><button type="button" onClick={onExportChat} disabled={!hasMessages || isLoading} aria-label="Export Conversation"><Download size={13} /><span>Export</span></button>{onRegenerateLast && <button type="button" onClick={onRegenerateLast} disabled={isLoading} aria-label="Regenerate Last Response"><RotateCw size={13} /><span>Regenerate</span></button>}</div><span><kbd>Enter</kbd> to send <span className="composer-shortcut-detail">· <kbd>Shift + Enter</kbd> for a new line</span></span></div>
  </div>;
};
