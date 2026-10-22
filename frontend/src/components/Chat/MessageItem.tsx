import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Check, Clock, Copy, Cpu, Frown, Meh, RotateCw, Smile, Tag, User, Volume2, VolumeX } from 'lucide-react';
import { MessageItem as MessageType, AppSettings } from '../../types';
import { useVoice } from '../../hooks/useVoice';

interface MessageItemProps {
  message: MessageType;
  settings: AppSettings;
  onRegenerate?: (text: string) => void;
  onRetry?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, settings, onRegenerate, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const isUser = message.role === 'user';
  const { speak, stopSpeaking, isSpeaking, error: voiceError } = useVoice(undefined, settings.language);
  const copy = async () => {
    try { await navigator.clipboard.writeText(message.content); setCopied(true); setCopyError(false); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2000); }
    catch { setCopyError(true); }
  };
  const sentiment = message.analysis?.sentiment;
  const SentimentIcon = sentiment === 'positive' ? Smile : sentiment === 'negative' ? Frown : Meh;
  return <article className={`conversation-message ${isUser ? 'user-message' : 'assistant-message'} ${message.isError ? 'error-message' : ''}`}>
    <span className="message-avatar">{isUser ? <User size={17} /> : message.isError ? <AlertCircle size={17} /> : <Bot size={18} />}</span>
    <div className="message-body">
      <div className="message-author-line"><span>{isUser ? 'YOU' : 'DYNAMIC AI'}</span>{settings.showTimestamps && message.timestamp && <time dateTime={message.timestamp}><Clock size={10} />{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>}</div>
      <div className="message-bubble"><p>{message.content}</p></div>
      {!isUser && <>
        <div className="message-analysis">
          {settings.enableSentiment && sentiment && <span className={`analysis-tag sentiment-${sentiment}`}><SentimentIcon size={12} />{sentiment}{message.analysis?.sentiment_score !== undefined && <small>{Math.round(message.analysis.sentiment_score * 100)}%</small>}</span>}
          {message.analysis?.intent && message.analysis.intent !== 'unknown' && <span className="analysis-tag"><Tag size={11} />{message.analysis.intent.replace(/_/g, ' ')}<small>{Math.round(message.analysis.intent_confidence * 100)}%</small></span>}
          {message.analysis?.entities.map((entity, index) => <span className="entity-tag" key={index}>{entity.label}: {entity.text}</span>)}
          {message.performance && <span className="message-performance"><Cpu size={11} />{message.performance.response_time_ms} ms{message.provider && <span>· {message.provider}</span>}</span>}
        </div>
        <div className="message-actions">
          <button type="button" onClick={() => isSpeaking ? stopSpeaking() : speak(message.content, settings.language)} aria-label={isSpeaking ? 'Stop Speech' : 'Listen to Response'} title={isSpeaking ? 'Stop speech' : 'Listen to response'}>{isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}</button>
          <button type="button" onClick={copy} aria-label={copied ? 'Response copied' : 'Copy Response'} title={copied ? 'Copied' : 'Copy response'}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
          {message.isError && onRetry && <button type="button" onClick={() => onRetry(message.content)} aria-label="Retry Message"><RotateCw size={13} />Retry</button>}
          {!message.isError && onRegenerate && <button type="button" onClick={() => onRegenerate(message.content)} aria-label="Regenerate Response" title="Regenerate response"><RotateCw size={14} /></button>}
          <span role="status">{copyError ? 'Clipboard unavailable. Select the text to copy.' : copied ? 'Copied to clipboard' : ''}</span>
        </div>
        {voiceError && <p className="ws-inline-error" role="status">{voiceError}</p>}
      </>}
    </div>
  </article>;
};
