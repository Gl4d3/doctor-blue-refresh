
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage, ChatInfoMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useChat } from '@/hooks/use-chat';
import { PlusCircle, MenuIcon, Building2 } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HospitalFinder } from '@/components/hospitals/hospital-finder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  
  // Scroll to bottom when messages change or generation starts/stops
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages, isGenerating]);
  
  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };
  
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ChatSidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild className="absolute left-4 top-3 md:hidden z-10">
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <ChatSidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex flex-col flex-1 h-screen">
        {/* Chat header */}
        <header className="flex justify-center items-center h-14 border-b sticky top-0 bg-background/80 backdrop-blur-lg z-10">
          <div className="flex justify-between items-center w-full max-w-4xl px-4 md:px-8">
            <div className="w-8 md:hidden" /> {/* Spacer for mobile */}
            <h1 className="text-lg font-medium">{currentSession.title}</h1>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="hidden md:block"
            >
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="hospitals">
                  <Building2 className="h-4 w-4 mr-2" />
                  Hospitals
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearMessages}
              className="text-muted-foreground md:hidden"
              disabled={currentSession.messages.length === 0}
            >
              Clear Chat
            </Button>
          </div>
        </header>
        
        {/* Mobile Tabs */}
        <div className="md:hidden border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="hospitals" className="flex-1">
                <Building2 className="h-4 w-4 mr-2" />
                Hospitals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto pb-32 pt-4 scrollbar-thin">
          <TabsContent value="chat" className="m-0 outline-none">
            {currentSession.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-fade-in">
                  <PlusCircle className="h-10 w-10 text-primary/60" />
                </div>
                <h2 className="text-2xl font-medium mb-2 animate-fade-in">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md animate-fade-in">
                  Ask me any medical questions or concerns you have. I can also help find nearby hospitals for you.
                </p>
              </div>
            ) : (
              <>
                <ChatInfoMessage>
                  Doctor Blue AI Assistant - Model: {currentSession.model}
                </ChatInfoMessage>
                
                {currentSession.messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isLast={index === currentSession.messages.length - 1}
                  />
                ))}
                
                {isGenerating && (
                  <div className="chat-message-container chat-message-assistant animate-fade-in">
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
          </TabsContent>
          
          <TabsContent value="hospitals" className="m-0 outline-none p-4">
            <HospitalFinder />
          </TabsContent>
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area - only shown in chat tab */}
        {activeTab === "chat" && (
          <ChatInput 
            onSend={handleSendMessage} 
            onStop={stopGeneration} 
            isGenerating={isGenerating} 
          />
        )}
      </div>
    </div>
  );
}
