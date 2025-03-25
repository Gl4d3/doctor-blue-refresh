
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChatSession } from '@/types/chat';
import { useChat } from '@/hooks/use-chat';
import { format } from 'date-fns';
import { MessageSquare, PlusCircle, Trash2, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function ChatSidebar() {
  const { 
    sessions, 
    currentSession, 
    startNewSession, 
    switchSession, 
    deleteSession 
  } = useChat();
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();
  
  // Log sessions on mount to help debugging
  useEffect(() => {
    console.log("ChatSidebar: Sessions loaded", sessions);
    console.log("ChatSidebar: Current session", currentSession);
  }, []);
  
  const handleSwitchSession = (sessionId: string) => {
    console.log("ChatSidebar: Switching to session", sessionId);
    
    try {
      switchSession(sessionId);
      
      // Find the session to get its title for the toast
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        toast({
          title: "Switched chat",
          description: `Switched to "${session.title}"`,
        });
      }
    } catch (error) {
      console.error("Error switching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to switch chat session",
        variant: "destructive"
      });
    }
  };
  
  const handleStartNewSession = () => {
    console.log("ChatSidebar: Starting new session");
    
    try {
      const newSession = startNewSession();
      console.log("ChatSidebar: New session created", newSession);
      
      toast({
        title: "New chat",
        description: "Started a new chat session",
      });
    } catch (error) {
      console.error("Error starting new session:", error);
      toast({
        title: "Error",
        description: "Failed to start new chat session",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("ChatSidebar: Deleting session", sessionId);
    
    try {
      // Find the session to get its title for the toast
      const session = sessions.find(s => s.id === sessionId);
      
      deleteSession(sessionId);
      
      toast({
        title: "Chat deleted",
        description: session ? `Deleted "${session.title}"` : "Chat session deleted",
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-64 h-screen border-r border-border flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="font-semibold">Doctor Blue</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="h-8 w-8"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="p-2">
        <Button 
          onClick={handleStartNewSession}
          className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No chat sessions yet
            </div>
          ) : (
            sessions.map(session => (
              <ChatHistoryItem
                key={session.id}
                session={session}
                isActive={session.id === currentSession?.id}
                onClick={() => handleSwitchSession(session.id)}
                onDelete={(e) => handleDeleteSession(session.id, e)}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 text-xs text-center text-muted-foreground border-t border-border">
        Powered by Groq
      </div>
    </div>
  );
}

interface ChatHistoryItemProps {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ChatHistoryItem({ session, isActive, onClick, onDelete }: ChatHistoryItemProps) {
  // Get the first user message or display the session title
  const firstUserMessage = session.messages.find(m => m.role === 'user');
  const chatTitle = session.title !== 'New Chat' && session.title ? session.title : 
                   firstUserMessage ? firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') : 
                   'New Chat';
  
  const formattedDate = format(new Date(session.updatedAt), 'MMM d');
  
  return (
    <div
      className={cn(
        "flex items-center rounded-md p-2 text-sm cursor-pointer transition-colors group relative",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
      )}
      onClick={onClick}
    >
      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
      <div className="flex-1 truncate">{chatTitle}</div>
      <span className="text-xs text-muted-foreground ml-1">{formattedDate}</span>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-1 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
