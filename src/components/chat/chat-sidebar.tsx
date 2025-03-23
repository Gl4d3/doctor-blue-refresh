
import React from 'react';
import { cn } from '@/lib/utils';
import { ChatSession } from '@/types/chat';
import { useChat } from '@/hooks/use-chat';
import { format } from 'date-fns';
import { MessageSquare, PlusCircle, Trash2, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatSidebar() {
  const { 
    sessions, 
    currentSession, 
    startNewSession, 
    switchSession, 
    deleteSession 
  } = useChat();
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
          onClick={startNewSession} 
          className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {sessions.map(session => (
            <ChatHistoryItem
              key={session.id}
              session={session}
              isActive={session.id === currentSession.id}
              onClick={() => switchSession(session.id)}
              onDelete={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
            />
          ))}
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
  // Get the first user message or default to the session title
  const chatPreview = session.messages.find(m => m.role === 'user')?.content.slice(0, 30) || session.title;
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
      <div className="flex-1 truncate">{chatPreview}</div>
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
