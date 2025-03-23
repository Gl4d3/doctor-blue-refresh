
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isGenerating: boolean;
}

export function ChatInput({ onSend, onStop, isGenerating }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isGenerating) {
      onSend(message);
      setMessage('');
    }
  };
  
  // Handle textarea input including auto-resizing
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4">
        <div className="relative flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message Doctor Blue..."
            className="min-h-[56px] max-h-[200px] overflow-y-auto py-3 pr-16 resize-none focus-visible:ring-1"
            disabled={isGenerating}
          />
          <div className="absolute right-4 bottom-3">
            {isGenerating ? (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={onStop} 
                className="h-8 w-8 rounded-full transition-all"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                disabled={!message.trim()} 
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  message.trim() ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>
        <div className="text-xs text-center text-muted-foreground mt-2">
          Doctor Blue is powered by Groq. Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to submit.
        </div>
      </form>
    </div>
  );
}

import { cn } from '@/lib/utils';
