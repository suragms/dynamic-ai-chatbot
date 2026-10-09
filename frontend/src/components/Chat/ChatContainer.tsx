import React from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickSuggestions } from './QuickSuggestions';
import { MessageItem, AppSettings } from '../../types';

interface ChatContainerProps {
  messages: MessageItem[];
  isLoading: boolean;
  settings: AppSettings;
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
  onSendMessage,
  onClearChat,
  onExportChat,
  onRegenerateLast,
  onRetryLast,
}) => {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100/50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Messages Feed */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        settings={settings}
        onSelectSuggestion={onSendMessage}
        onRegenerate={onRegenerateLast ? () => onRegenerateLast() : undefined}
        onRetry={onRetryLast ? () => onRetryLast() : undefined}
      />

      {/* Quick Suggestions Banner */}
      <QuickSuggestions onSelectSuggestion={onSendMessage} />

      {/* Input Box */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        onClearChat={onClearChat}
        onExportChat={onExportChat}
        onRegenerateLast={onRegenerateLast}
        language={settings.language}
      />
    </div>
  );
};
