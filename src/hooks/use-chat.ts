import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatSession, Message, Model } from "@/types/chat";
import { sendChatCompletion, streamChatCompletion } from "@/services/groq";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_MODEL: Model = "llama3-70b-8192";

// Debug wrapper for localStorage operations
const storageHelper = {
  getItem: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      console.log(`Retrieved from localStorage: ${key}`, value ? "exists" : "not found");
      return value;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: string) => {
    try {
      console.log(`Saving to localStorage: ${key}`, value.slice(0, 50) + "...");
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }
};

// Create a new chat session with default values
function createNewSession(): ChatSession {
  const timestamp = new Date().toISOString();
  return {
    id: uuidv4(),
    title: "New Chat",
    messages: [],
    model: DEFAULT_MODEL,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function useChat() {
  // Initialize sessions from localStorage or create a new one
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = storageHelper.getItem("chat-sessions");
      const parsedSessions = saved ? JSON.parse(saved) : [createNewSession()];
      
      // Validate parsed sessions
      if (!Array.isArray(parsedSessions) || parsedSessions.length === 0) {
        console.log("No valid sessions found, creating a new one");
        return [createNewSession()];
      }
      
      return parsedSessions;
    } catch (error) {
      console.error("Error parsing sessions from localStorage:", error);
      return [createNewSession()];
    }
  });
  
  // Initialize currentSessionId from localStorage or use the first session
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      const saved = storageHelper.getItem("current-session-id");
      if (saved && sessions.some(s => s.id === saved)) {
        return saved;
      }
      return sessions[0].id;
    } catch (error) {
      console.error("Error setting current session ID:", error);
      return sessions[0].id;
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Computed property to get the current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  
  // Log the current state (for debugging)
  useEffect(() => {
    console.log("useChat: Current sessions", sessions);
    console.log("useChat: Current session ID", currentSessionId);
    console.log("useChat: Current session", currentSession);
  }, [sessions, currentSessionId, currentSession]);
  
  // Save sessions to localStorage when they change
  useEffect(() => {
    try {
      storageHelper.setItem("chat-sessions", JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving sessions to localStorage:", error);
    }
  }, [sessions]);
  
  // Save current session ID to localStorage when it changes
  useEffect(() => {
    try {
      if (currentSessionId) {
        storageHelper.setItem("current-session-id", currentSessionId);
      }
    } catch (error) {
      console.error("Error saving current session ID to localStorage:", error);
    }
  }, [currentSessionId]);

  // Start a new chat session
  const startNewSession = useCallback(() => {
    try {
      const newSession = createNewSession();
      console.log("Creating new session:", newSession.id);
      
      setSessions(prev => {
        // Check if session already exists to avoid duplicates
        if (prev.some(s => s.id === newSession.id)) {
          console.warn("Session with this ID already exists!");
          // Create another new session with a different ID
          const anotherNewSession = createNewSession();
          return [anotherNewSession, ...prev];
        }
        return [newSession, ...prev];
      });
      
      setCurrentSessionId(newSession.id);
      
      return newSession;
    } catch (error) {
      console.error("Error creating new session:", error);
      toast({
        title: "Error",
        description: "Failed to create a new chat session",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Switch to a different session
  const switchSession = useCallback((sessionId: string) => {
    console.log("Switching to session:", sessionId);
    
    try {
      // Validate the session exists before switching
      if (sessions.some(s => s.id === sessionId)) {
        setCurrentSessionId(sessionId);
      } else {
        console.error(`Session with ID ${sessionId} not found`);
        
        // If the session doesn't exist, switch to the first available session
        if (sessions.length > 0) {
          console.log("Falling back to first available session:", sessions[0].id);
          setCurrentSessionId(sessions[0].id);
        } else {
          // If no sessions exist at all, create a new one
          console.log("No sessions exist, creating a new one");
          const newSession = createNewSession();
          setSessions([newSession]);
          setCurrentSessionId(newSession.id);
        }
      }
    } catch (error) {
      console.error("Error switching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to switch chat session",
        variant: "destructive"
      });
      throw error;
    }
  }, [sessions, toast]);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      try {
        const updated = prev.filter(s => s.id !== sessionId);
        
        // If we're deleting the current session, switch to another one
        if (currentSessionId === sessionId) {
          if (updated.length > 0) {
            console.log("Switching to first available session after delete:", updated[0].id);
            setCurrentSessionId(updated[0].id);
          } else {
            // If no sessions left, create a new one
            console.log("No sessions left after delete, creating a new one");
            const newSession = createNewSession();
            setCurrentSessionId(newSession.id);
            return [newSession];
          }
        }
        
        return updated;
      } catch (error) {
        console.error("Error deleting session:", error);
        toast({
          title: "Error",
          description: "Failed to delete chat session",
          variant: "destructive"
        });
        return prev;
      }
    });
  }, [currentSessionId, toast]);

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
      
      console.log("Generating title for session:", sessionId, "->", title);
      
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
      const userMessage = {
        id: uuidv4(),
        role: "user" as const,
        content,
        createdAt: new Date().toISOString()
      };
      
      // Update sessions with the new user message
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, userMessage],
              updatedAt: new Date().toISOString()
            } 
          : session
      ));
      
      // Generate chat title from first user message if this is a new chat
      if (currentSession.messages.length === 0 && currentSession.title === "New Chat") {
        // Create a summarized title from the user message
        let title = content.substring(0, 30);
        if (content.length > 30) title += "...";
        
        console.log("Generating title for session:", currentSessionId, "->", title);
        
        // Update the session title
        setSessions(prev => prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, title, updatedAt: new Date().toISOString() } 
            : s
        ));
      }
      
      // Start generating response
      setIsGenerating(true);
      
      // Prepare for streaming response
      let responseContent = "";
      const responseId = uuidv4();
      
      // Add empty assistant message that will be updated
      const assistantMessage = {
        id: responseId,
        role: "assistant" as const,
        content: "",
        createdAt: new Date().toISOString()
      };
      
      // Update sessions with the new empty assistant message
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, assistantMessage],
              updatedAt: new Date().toISOString()
            } 
          : session
      ));
      
      // Set up abort controller for the streaming request
      abortControllerRef.current = new AbortController();
      
      // Get all messages for the request including the new user message
      const messagesForRequest = [
        ...currentSession.messages.map(({ role, content }) => ({ role, content })),
        { role: userMessage.role, content: userMessage.content }
      ];
      
      // Stream the response
      await streamChatCompletion(
        {
          messages: messagesForRequest,
          model: currentSession.model,
          temperature: 0.7,
          stream: true
        },
        (chunk) => {
          // Update content with the new chunk
          const content = chunk.choices[0]?.delta?.content || "";
          responseContent += content;
          
          // Update the assistant message content
          setSessions(prev => prev.map(session => {
            if (session.id !== currentSessionId) return session;
            
            const updatedMessages = [...session.messages];
            const lastIndex = updatedMessages.length - 1;
            
            if (lastIndex >= 0) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: responseContent
              };
            }
            
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: new Date().toISOString()
            };
          }));
        },
        () => {
          // Streaming complete
          setIsGenerating(false);
          abortControllerRef.current = null;
        },
        (error) => {
          // Error handling
          console.error("Error streaming response:", error);
          
          // Update the last message with an error note
          setSessions(prev => prev.map(session => {
            if (session.id !== currentSessionId) return session;
            
            const updatedMessages = [...session.messages];
            const lastIndex = updatedMessages.length - 1;
            
            if (lastIndex >= 0) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: responseContent + "\n\n*Error: Failed to complete response.*"
              };
            }
            
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: new Date().toISOString()
            };
          }));
          
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
  }, [currentSession, currentSessionId, toast]);

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
    generateSessionTitle,
    addUserMessage,
    addAssistantMessage,
    updateLastMessage,
    sendMessage,
    stopGeneration,
    clearMessages,
    setModel
  };
}
