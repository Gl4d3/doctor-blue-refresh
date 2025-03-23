
import { ChatCompletionChunk, ChatCompletionRequest, ChatCompletionResponse } from "@/types/chat";

// Groq API endpoint
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "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";

/**
 * Send a chat completion request to Groq
 */
export async function sendChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to send message to Groq API");
  }

  return response.json();
}

/**
 * Send a streaming chat completion request to Groq
 */
export async function streamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (chunk: ChatCompletionChunk) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to send message to Groq API");
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const processChunks = async (): Promise<void> => {
      const { done, value } = await reader.read();
      if (done) {
        onComplete();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.trim() === "data: [DONE]") continue;

        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.substring(6));
            onChunk(json);
          } catch (err) {
            console.error("Error parsing chunk:", line, err);
          }
        }
      }

      processChunks();
    };

    processChunks().catch(onError);
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get available models from Groq
 */
export async function getModels() {
  const response = await fetch("https://api.groq.com/openai/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch models from Groq API");
  }

  return response.json();
}
