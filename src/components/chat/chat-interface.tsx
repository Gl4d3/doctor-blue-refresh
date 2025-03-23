
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage, ChatInfoMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useChat } from '@/hooks/use-chat';
import { PlusCircle } from 'lucide-react';

export function ChatInterface() {
  const { 
    currentSession, 
    isGenerating, 
    sendMessage, 
    stopGeneration, 
    startNewSession, 
    clearMessages 
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or generation starts/stops
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages, isGenerating]);
  
  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <header className="flex justify-center items-center h-14 border-b sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="flex justify-between items-center w-full max-w-4xl px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={startNewSession}
            className="text-muted-foreground"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          <h1 className="text-lg font-medium">Doctor Blue</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearMessages}
            className="text-muted-foreground"
            disabled={currentSession.messages.length === 0}
          >
            Clear Chat
          </Button>
        </div>
      </header>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto pb-32 pt-4 scrollbar-thin">
        {currentSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <PlusCircle className="h-10 w-10 text-primary/60" />
            </div>
            <h2 className="text-2xl font-medium mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground max-w-md">
              Ask me any medical questions or concerns you have. I'm here to provide information and guidance.
            </p>
          </div>
        ) : (
          <>
            <ChatInfoMessage>
              Doctor Blue AI Assistant - Powered by Groq
            </ChatInfoMessage>
            
            {currentSession.messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isLast={index === currentSession.messages.length - 1}
              />
            ))}
            
            {isGenerating && (
              <div className="chat-message-container chat-message-assistant">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-primary-foreground font-medium">
                    A
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <ChatInput 
        onSend={handleSendMessage} 
        onStop={stopGeneration} 
        isGenerating={isGenerating} 
      />
    </div>
  );
}
