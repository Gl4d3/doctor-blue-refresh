
import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatSession, Message, Model } from "@/types/chat";
import { sendChatCompletion, streamChatCompletion } from "@/services/groq";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_MODEL: Model = "llama3-70b-8192";

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("chat-sessions");
    return saved ? JSON.parse(saved) : [createNewSession()];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem("current-session-id");
    return saved || sessions[0].id;
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  
  // Save sessions to local storage when they change
  useEffect(() => {
    localStorage.setItem("chat-sessions", JSON.stringify(sessions));
  }, [sessions]);
  
  // Save current session ID to local storage when it changes
  useEffect(() => {
    localStorage.setItem("current-session-id", currentSessionId);
  }, [currentSessionId]);

  // Create a new chat session
  function createNewSession(): ChatSession {
    return {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      model: DEFAULT_MODEL,
      createdAt: new Date().toISOString(), // Ensure ISO string format for JSON serialization
      updatedAt: new Date().toISOString()
    };
  }

  // Start a new chat session
  const startNewSession = useCallback(() => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession;
  }, []);

  // Switch to a different session
  const switchSession = useCallback((sessionId: string) => {
    console.log("Switching to session:", sessionId);
    
    if (sessions.some(s => s.id === sessionId)) {
      setCurrentSessionId(sessionId);
    } else {
      console.error(`Session with ID ${sessionId} not found`);
      
      // If the session doesn't exist, switch to the first available session
      if (sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      } else {
        // If no sessions exist at all, create a new one
        const newSession = createNewSession();
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      }
    }
  }, [sessions]);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      
      // If we're deleting the current session, switch to another one
      if (currentSessionId === sessionId) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
        } else {
          // If no sessions left, create a new one
          const newSession = createNewSession();
          setCurrentSessionId(newSession.id);
          return [newSession];
        }
      }
      
      return updated;
    });
  }, [currentSessionId]);

  // Rename a session
  const renameSession = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title, updatedAt: new Date().toISOString() } 
        : session
    ));
  }, []);

  // Generate a title for the chat based on the first user message
  const generateSessionTitle = useCallback(async (sessionId: string, userMessage: string) => {
    try {
      // Only generate a title for "New Chat" sessions
      const session = sessions.find(s => s.id === sessionId);
      if (!session || session.title !== "New Chat") return;
      
      // Create a summarized title from the user message
      let title = userMessage.substring(0, 30);
      if (userMessage.length > 30) title += "...";
      
      // Update the session title
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, title, updatedAt: new Date().toISOString() } 
          : s
      ));
    } catch (error) {
      console.error("Error generating session title:", error);
    }
  }, [sessions]);

  // Add a user message to the current session
  const addUserMessage = useCallback((content: string) => {
    const message: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };
    
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, message],
            updatedAt: new Date().toISOString()
          } 
        : session
    ));
    
    return message;
  }, [currentSessionId]);

  // Add an assistant message to the current session
  const addAssistantMessage = useCallback((content: string) => {
    const message: Message = {
      id: uuidv4(),
      role: "assistant",
      content,
      createdAt: new Date().toISOString()
    };
    
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, message],
            updatedAt: new Date().toISOString()
          } 
        : session
    ));
    
    return message;
  }, [currentSessionId]);

  // Update the last message in the current session
  const updateLastMessage = useCallback((content: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== currentSessionId) return session;
      
      const messages = [...session.messages];
      if (messages.length === 0) return session;
      
      const lastIndex = messages.length - 1;
      messages[lastIndex] = {
        ...messages[lastIndex],
        content
      };
      
      return {
        ...session,
        messages,
        updatedAt: new Date().toISOString()
      };
    }));
  }, [currentSessionId]);

  // Send a message and get a response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      // Add user message
      addUserMessage(content);
      
      // Generate chat title from first user message if this is a new chat
      const updatedSession = sessions.find(s => s.id === currentSessionId);
      
      if (updatedSession && (
          updatedSession.messages.length === 0 ||
          (updatedSession.messages.length === 1 && updatedSession.title === "New Chat")
      )) {
        generateSessionTitle(currentSessionId, content);
      }
      
      // Start generating response
      setIsGenerating(true);
      
      // Prepare for streaming response
      let responseContent = "";
      const responseId = uuidv4();
      
      // Add empty assistant message that will be updated
      addAssistantMessage("");
      
      // Set up abort controller for the streaming request
      abortControllerRef.current = new AbortController();
      
      // Get all messages for the request including the new user message
      const currentSessionWithUserMessage = sessions.find(s => s.id === currentSessionId);
      if (!currentSessionWithUserMessage) throw new Error("Session not found");
      
      const messages = [
        ...currentSessionWithUserMessage.messages,
        { role: "user" as const, content }
      ].map(({ role, content }) => ({ role, content }));
      
      // Stream the response
      await streamChatCompletion(
        {
          messages,
          model: currentSession.model,
          temperature: 0.7,
          stream: true
        },
        (chunk) => {
          // Update content with the new chunk
          const content = chunk.choices[0]?.delta?.content || "";
          responseContent += content;
          updateLastMessage(responseContent);
        },
        () => {
          // Streaming complete
          setIsGenerating(false);
          abortControllerRef.current = null;
        },
        (error) => {
          // Error handling
          console.error("Error streaming response:", error);
          updateLastMessage(responseContent + "\n\n*Error: Failed to complete response.*");
          setIsGenerating(false);
          abortControllerRef.current = null;
          
          toast({
            title: "Error",
            description: error.message || "Failed to generate response",
            variant: "destructive"
          });
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setIsGenerating(false);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  }, [
    addUserMessage, 
    addAssistantMessage, 
    updateLastMessage, 
    currentSessionId, 
    sessions, 
    currentSession.model,
    generateSessionTitle,
    toast
  ]);

  // Stop message generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  // Clear messages in the current session
  const clearMessages = useCallback(() => {
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: [], title: "New Chat", updatedAt: new Date().toISOString() } 
        : session
    ));
  }, [currentSessionId]);

  // Update the model for the current session
  const setModel = useCallback((model: Model) => {
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, model, updatedAt: new Date().toISOString() } 
        : session
    ));
  }, [currentSessionId]);

  return {
    sessions,
    currentSession,
    isGenerating,
    startNewSession,
    switchSession,
    deleteSession,
    renameSession,
    sendMessage,
    stopGeneration,
    clearMessages,
    setModel
  };
}
