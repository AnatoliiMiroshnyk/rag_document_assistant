# DocMind: AI-Powered Document RAG Assistant

DocMind is an enterprise-grade Retrieval-Augmented Generation (RAG) platform built with Next.js, OpenAI embeddings, and custom vector similarity search. It allows users to ingest unstructured markdown or text documents, chunk them semantically, store high-dimensional embeddings, and perform context-grounded AI chat with automatic source attribution.

---

## Key Features

- **Semantic Document Chunking**: Intelligent paragraph-aware text splitting algorithm ensuring coherent context boundaries.
- **In-Memory Vector Search Engine**: High-performance vector indexing with custom 1536-dimensional Cosine Similarity math.
- **Context-Grounded LLM Responses**: Dynamic prompt injection using OpenAI `gpt-4o-mini` with source citations.
- **Instant Development Mock Mode**: Full local functionality out of the box using deterministic dummy vector embeddings when `OPENAI_API_KEY` is omitted.
- **Modern Developer UX**: Responsive split-screen dashboard styled with Tailwind CSS, featuring file upload feedback and indexing metrics.

---

## System Architecture

```
                                  ┌─────────────────────────┐
                                  │   User Document (.md)   │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ Paragraph-Aware Chunking│
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ Vector Embedding API    │
                                  │ (text-embedding-3-small)│
                                  └────────────┬────────────┘
                                               │
                                               ▼
┌────────────────────────┐        ┌─────────────────────────┐
│ User Chat Query        │───────>│ Cosine Similarity Search│
└────────────────────────┘        └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ Top-K Context Injection │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │   Grounded Answer +     │
                                  │   Source Citations      │
                                  └─────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Actions, API Routes) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS & Lucide Icons |
| **AI Infrastructure** | OpenAI SDK (`text-embedding-3-small`, `gpt-4o-mini`) |
| **Vector Engine** | In-Memory Singleton Vector Index with Cosine Similarity |

---

## Getting Started

### Prerequisites

- Node.js `18.x` or higher
- `npm`, `yarn`, or `pnpm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rag-document-assistant.git
   cd rag-document-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (Optional):
   Create a `.env.local` file in the project root:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   *Note: If no API key is provided, the application automatically operates in Mock Mode.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.