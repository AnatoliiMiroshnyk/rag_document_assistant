export interface DocumentChunk {
  id: string;
  documentTitle: string;
  content: string;
  embedding: number[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}