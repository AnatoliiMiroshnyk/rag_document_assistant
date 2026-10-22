import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { vectorStore } from '@/lib/vectorStore';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || !messages.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;
    const apiKey = process.env.OPENAI_API_KEY;

    let queryEmbedding: number[] = [];
    if (!apiKey) {
      queryEmbedding = Array.from({ length: 1536 }, () => Math.random() - 0.5);
    } else {
      const openai = new OpenAI({ apiKey });
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: latestMessage,
      });
      queryEmbedding = embeddingRes.data[0].embedding;
    }

    const searchResults = vectorStore.search(queryEmbedding, 3);
    const contextText = searchResults
      .map((r, idx) => `[Source ${idx + 1}: ${r.chunk.documentTitle}]\n${r.chunk.content}`)
      .join('\n\n');

    const sources = Array.from(new Set(searchResults.map((r) => r.chunk.documentTitle)));

    const systemPrompt = `You are DocMind, an expert AI assistant specialized in analyzing user documents. 
Answer the user's question accurately using ONLY the provided context snippets below. If the answer cannot be found in the context, state clearly that you do not have enough information in the uploaded documents.

CONTEXT:
${contextText}`;

    let reply = '';
    if (!apiKey) {
      reply = `[MOCK MODE - Add OPENAI_API_KEY in .env.local to enable live LLM answers]\n\nBased on your uploaded documents, here is what I found regarding "${latestMessage}":\n\n${searchResults.length > 0 ? searchResults[0].chunk.content : 'No relevant document chunks found.'}`;
    } else {
      const openai = new OpenAI({ apiKey });
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.3,
      });
      reply = chatCompletion.choices[0].message.content || 'No response generated.';
    }

    return NextResponse.json({
      reply,
      sources,
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}