# Multi-Turn Chat

A full-stack multi-turn chat application built with React + Vite on the client and Express on the server. The app demonstrates a streaming conversation with Claude, where the full message history is sent on every request so Claude maintains context across turns.

## Project Structure

```
multi-turn/
├── client/          # React 18, TypeScript, Vite
│   └── src/
│       ├── App.tsx                      # Root component, message state, SSE consumer
│       └── components/
│           ├── ChatInput.tsx            # Auto-resizing textarea, Enter to send
│           └── ChatMessage.tsx          # Single message bubble (user or assistant)
└── server/          # Express, TypeScript, Anthropic SDK
    └── src/
        ├── index.ts                     # Express app setup, CORS, /api/chat mount
        └── routes/chat.ts               # POST /api/chat — streams Claude's response
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Portkey](https://portkey.ai) API key (used as the gateway to Claude)

### Installation

```bash
npm run install:all
```

This installs dependencies for the root, client, and server.

### Configuration

Copy `server/.env.example` to `server/.env.local` and fill in the values:

```env
PORTKEY_API_KEY="your_api_key_here"
PORTKEY_BASE_URL="https://gateway.portkey.com"
MODEL="your_model_name_here"
PORT=3001
```

`MAX_TOKENS` is optional and defaults to `512`.

### Running

```bash
npm run dev
```

This starts both the Vite dev server (client) and the Express server concurrently. The client runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:3001`.

## How It Works

### Multi-turn conversation

Every time the user sends a message, the client sends the **entire conversation history** to `POST /api/chat` — not just the latest message. Claude has no built-in memory between API calls; the only way to give it context is to include all prior messages in each request. This is the standard pattern for building multi-turn chat with the Anthropic API.

### Why `messages.stream` instead of `messages.create`

The server uses `client.messages.stream(...)` rather than `client.messages.create(...)`. The difference matters a lot for user experience.

**`messages.create`** is a standard HTTP request/response: the server calls Claude, waits for the entire response to be generated, and only then sends it back to the client. If Claude is writing a long answer, the user stares at a blank bubble for several seconds before anything appears.

**`messages.stream`** opens a persistent connection to the Anthropic API and receives the response as a sequence of small `content_block_delta` events — one per token (or small group of tokens) as Claude generates them. The server can forward each chunk to the client the moment it arrives, so the user sees text appearing word-by-word in real time.

To deliver that streaming data, the server uses **Server-Sent Events (SSE)**. Before touching the Anthropic API, the route sets three response headers:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

This keeps the HTTP response open. The server then loops over the async stream and writes each text delta as an SSE frame:

```
data: {"delta":"Hello"}\n\n
```

When the stream ends, it writes the sentinel:

```
data: [DONE]\n\n
```

and calls `res.end()`.

On the client side, `App.tsx` reads the response body through the [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) (`res.body.getReader()`), decodes each chunk, splits on newlines, and parses every `data:` line. Each parsed delta is appended to the `accumulated` string, and React state is updated immediately — so the assistant message bubble grows in real time as tokens arrive.

An empty assistant message is added to state *before* the fetch begins, so the bubble appears instantly and fills in progressively rather than popping in all at once at the end.

### Streaming flow summary

```
User sends message
       │
       ▼
App.tsx: append user message + empty assistant bubble to state
       │
       ▼
POST /api/chat  ← full conversation history in body
       │
       ▼
server/routes/chat.ts: set SSE headers, call messages.stream()
       │
       ▼  (for each content_block_delta event)
res.write(`data: {"delta":"..."}`)  ──► client reader loop
                                              │
                                              ▼
                                    accumulated += delta
                                    setMessages(...)  → React re-renders bubble
       │
       ▼  (stream ends)
res.write(`data: [DONE]`)
res.end()
       │
       ▼
client reader loop exits, setIsStreaming(false)
```

## Key Design Decisions

- **Vite proxy** — `vite.config.ts` proxies `/api` to `localhost:3001` so the client can use relative paths and avoid CORS issues in development.
- **Input disabled during streaming** — `ChatInput` is disabled while `isStreaming` is true, preventing overlapping requests and out-of-order message state.
- **Auto-resizing textarea** — `ChatInput` expands as the user types and resets after sending.
- **Enter to send, Shift+Enter for newline** — standard chat UX.
- **Empty message filtering** — both the client and server strip messages with blank content before sending to the API.
