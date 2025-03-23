
import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { MarkdownRenderer } from '@/components/markdown-renderer';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div 
      className={cn(
        "chat-message-container animate-slide-in",
        isUser ? "chat-message-user" : "chat-message-assistant"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-primary-foreground font-medium">
          {isUser ? 'U' : 'A'}
        </div>
        <div className="flex-1 overflow-hidden">
          <MarkdownRenderer content={message.content || ''} />
        </div>
      </div>
    </div>
  );
}

export function ChatInfoMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-message-info animate-fade-in">
      {children}
    </div>
  );
}
