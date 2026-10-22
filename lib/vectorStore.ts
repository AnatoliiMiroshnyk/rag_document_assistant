import { DocumentChunk } from '@/types';

class VectorStore {
  private chunks: DocumentChunk[] = [];

  public addChunks(newChunks: DocumentChunk[]): void {
    this.chunks.push(...newChunks);
  }

  public getChunks(): DocumentChunk[] {
    return this.chunks;
  }

  public clear(): void {
    this.chunks = [];
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public search(queryEmbedding: number[], topK: number = 3): { chunk: DocumentChunk; score: number }[] {
    if (this.chunks.length === 0) return [];

    const scored = this.chunks.map((chunk) => ({
      chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

declare global {
  var vectorStoreInstance: VectorStore | undefined;
}

export const vectorStore = global.vectorStoreInstance || new VectorStore();
if (process.env.NODE_ENV !== 'production') {
  global.vectorStoreInstance = vectorStore;
}