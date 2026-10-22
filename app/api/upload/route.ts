import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chunkText } from '@/lib/rag';
import { vectorStore } from '@/lib/vectorStore';
import { DocumentChunk } from '@/types';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = (formData.get('title') as string) || (file ? file.name : 'Untitled Document');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const textContent = await file.text();
    if (!textContent.trim()) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    const rawChunks = chunkText(textContent, 600, 50);
    const apiKey = process.env.OPENAI_API_KEY;

    const newChunks: DocumentChunk[] = [];

    if (!apiKey) {
      rawChunks.forEach((chunk, index) => {
        const dummyEmbedding = Array.from({ length: 1536 }, () => Math.random() - 0.5);
        newChunks.push({
          id: `${Date.now()}-${index}`,
          documentTitle: title,
          content: chunk,
          embedding: dummyEmbedding,
        });
      });
    } else {
      const openai = new OpenAI({ apiKey });
      for (let i = 0; i < rawChunks.length; i++) {
        const chunk = rawChunks[i];
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
        });
        const embedding = response.data[0].embedding;
        newChunks.push({
          id: `${Date.now()}-${i}`,
          documentTitle: title,
          content: chunk,
          embedding,
        });
      }
    }

    vectorStore.addChunks(newChunks);

    return NextResponse.json({
      success: true,
      message: `Successfully processed "${title}" into ${newChunks.length} chunks.`,
      totalChunks: vectorStore.getChunks().length,
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}