'use client';

import React, { useState } from 'react';
import { Bot, Upload, Send, FileText, CheckCircle2, Sparkles, Database, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function RAGDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI RAG Assistant. Upload a text or markdown document on the left, and ask me any questions about its content.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadStatus(data.message);
      setTotalChunks(data.totalChunks);
      setFile(null);
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat request failed');

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.reply, sources: data.sources },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              DocMind RAG Assistant
            </h1>
            <p className="text-xs text-slate-400">Retrieval-Augmented Generation Knowledge Hub</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Vector Chunks Indexed: <strong className="text-slate-100">{totalChunks}</strong></span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-80 border-r border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-slate-200 flex items-center space-x-2 mb-1">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Upload Document</span>
              </h2>
              <p className="text-xs text-slate-400">Upload text or markdown files to ingest into the vector database.</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center transition cursor-pointer bg-slate-900">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
                  <span className="text-xs text-slate-300 block font-medium">
                    {file ? file.name : 'Click to select .txt or .md'}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Chunking & Embedding...</span>
                  </>
                ) : (
                  <span>Ingest Document</span>
                )}
              </button>
            </form>

            {uploadStatus && (
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">{uploadStatus}</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-6 border-t border-slate-800">
            Tip: Set your <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">OPENAI_API_KEY</code> in <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">.env.local</code> for live embeddings and GPT answers.
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex space-x-3 max-w-2xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-400'
                  }`}
                >
                  {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-sm space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>Sources:</span>
                      {msg.sources.map((src, sIdx) => (
                        <span key={sIdx} className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-medium">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Searching vector database & generating response...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-900 flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your uploaded documents..."
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition font-medium flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}