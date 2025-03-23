
import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { User, Bot } from 'lucide-react';

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
      <div className="flex items-start gap-4 max-w-4xl mx-auto">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
          isUser 
            ? "bg-blue-600 text-white" 
            : "bg-primary text-primary-foreground"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
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
