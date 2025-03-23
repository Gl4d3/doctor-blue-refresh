
import { ChatCompletionRequest, ChatCompletionResponse, ChatCompletionChunk } from "@/types/chat";

// Constants
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "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";

// Add a system message to ensure the AI is aware of the hospital finder feature
const addSystemContext = (request: ChatCompletionRequest): ChatCompletionRequest => {
  const systemMessage = {
    role: "system" as const,
    content: `You are Doctor Blue, a friendly and knowledgeable medical AI assistant. You provide helpful medical information and advice, but always remind users to consult healthcare professionals for personalized medical advice, diagnosis, or treatment.

Important context:
1. This interface has a hospital finder feature that can show nearby hospitals based on the user's location.
2. If a user asks about finding hospitals, going to a hospital, or appears to need urgent care, kindly let them know they can use the "Hospitals" tab to find nearby hospitals.
3. Be empathetic, clear, and thorough in your responses.
4. Users can switch between different chat sessions using the sidebar.
`
  };

  return {
    ...request,
    messages: [systemMessage, ...request.messages]
  };
};

// Regular chat completion
export const sendChatCompletion = async (
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> => {
  const requestWithSystem = addSystemContext(request);
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify(requestWithSystem)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get a response");
  }

  return response.json();
};

// Streaming chat completion
export const streamChatCompletion = async (
  request: ChatCompletionRequest,
  onChunk: (chunk: ChatCompletionChunk) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    const requestWithSystem = addSystemContext(request);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestWithSystem),
      signal
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get a response");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("ReadableStream not supported");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process all complete messages in the buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          // Skip empty messages or [DONE]
          if (!data || data === "[DONE]") continue;
          
          try {
            const chunk = JSON.parse(data);
            onChunk(chunk);
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request was aborted");
    } else {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
};
