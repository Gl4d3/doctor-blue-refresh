
export type Model = 'llama3-8b-8192' | 'llama3-70b-8192' | 'mixtral-8x7b-32768' | 'gemma-7b-it';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: Model;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatCompletionRequest {
  messages: Pick<Message, 'role' | 'content'>[];
  model: Model;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: Role;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: Role;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}
