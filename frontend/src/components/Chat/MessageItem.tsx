import React, { useState } from 'react';
import { Bot, User, Copy, Check, Smile, Frown, Meh, Tag, Clock, Cpu, RotateCw, AlertCircle, Volume2, VolumeX } from 'lucide-react';
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
  const isUser = message.role === 'user';

  const { speak, stopSpeaking, isSpeaking } = useVoice(undefined, settings.language);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(message.content, settings.language);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-3.5 h-3.5 text-emerald-500" />;
      case 'negative':
        return <Frown className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Meh className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={`flex gap-3 my-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
            : message.isError
            ? 'bg-rose-500 text-white shadow-rose-500/20'
            : 'bg-teal-600 text-white shadow-teal-500/20'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : message.isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs relative group ${
            isUser
              ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-xs'
              : message.isError
              ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-tl-xs'
              : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Action Tools for Bot Message */}
          {!isUser && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs">
              {/* Text-to-Speech Button */}
              <button
                onClick={handleToggleSpeak}
                className={`p-1 transition-colors ${
                  isSpeaking ? 'text-teal-500 animate-pulse' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={isSpeaking ? 'Stop Speech' : 'Listen to Response (Text-to-Speech)'}
                aria-label="Toggle Text to Speech"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleCopy}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Copy Response"
                aria-label="Copy Response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {message.isError && onRetry && (
                <button
                  onClick={() => onRetry(message.content)}
                  className="p-1 text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                  title="Retry Message"
                  aria-label="Retry Message"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}

              {!message.isError && onRegenerate && (
                <button
                  onClick={() => onRegenerate(message.content)}
                  className="p-1 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title="Regenerate Response"
                  aria-label="Regenerate Response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Metadata Badges & Analysis Info */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 px-1">
          {/* Timestamp */}
          {settings.showTimestamps && message.timestamp && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          {/* Sentiment Indicator */}
          {settings.enableSentiment && message.analysis?.sentiment && (
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-medium">
              {getSentimentIcon(message.analysis.sentiment)}
              <span className="capitalize">{message.analysis.sentiment}</span>
              {message.analysis.sentiment_score !== undefined && (
                <span className="text-[10px] text-slate-400">({Math.round(message.analysis.sentiment_score * 100)}%)</span>
              )}
            </span>
          )}

          {/* Intent Tag */}
          {message.analysis?.intent && message.analysis.intent !== 'unknown' && (
            <span className="flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800/60 font-medium">
              <Tag className="w-3 h-3" />
              <span>{message.analysis.intent}</span>
              {message.analysis.intent_confidence !== undefined && (
                <span className="text-[10px] opacity-75">({Math.round(message.analysis.intent_confidence * 100)}%)</span>
              )}
            </span>
          )}

          {/* Entity Tags */}
          {message.analysis?.entities && message.analysis.entities.length > 0 && (
            <div className="flex items-center gap-1">
              {message.analysis.entities.map((ent, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px] border border-indigo-200/50 dark:border-indigo-800/50"
                >
                  {ent.label}: {ent.text}
                </span>
              ))}
            </div>
          )}

          {/* Latency & Provider */}
          {!isUser && message.performance?.response_time_ms !== undefined && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Cpu className="w-3 h-3" />
              <span>{message.performance.response_time_ms}ms</span>
              {message.provider && <span className="uppercase font-semibold">({message.provider})</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
