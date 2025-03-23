
import React, { useEffect } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useDarkMode } from '@/hooks/use-dark-mode';

const Index = () => {
  const { isDarkMode } = useDarkMode();
  
  // Apply dark mode class to html element on initial render
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ChatInterface />
    </div>
  );
};

export default Index;
