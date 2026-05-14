import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import './App.css';

export type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function sendMessage(text: string) {
        const userMessage: Message = { role: 'user', content: text };
        const nextMessages = [...messages.filter((m) => m.content.trim() !== ''), userMessage];
        setMessages(nextMessages);
        setIsStreaming(true);

        const assistantPlaceholder: Message = { role: 'assistant', content: '' };
        setMessages([...nextMessages, assistantPlaceholder]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: nextMessages }),
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') break;

                        try {
                            console.log('Received SSE data:', data);
                            const parsed = JSON.parse(data);

                            if (parsed.delta) {
                                accumulated += parsed.delta;
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        role: 'assistant',
                                        content: accumulated,
                                    };
                                    return updated;
                                });
                            }
                        } catch {
                            // skip malformed SSE lines
                        }
                    }
                }
            }
        } catch (err) {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
                };
                return updated;
            });
        } finally {
            setIsStreaming(false);
        }
    }

    return (
        <div className="app">
            <header className="header">
                <h1>Multi-Turn Chat</h1>
            </header>

            <main className="messages">
                {messages.length === 0 && (
                    <div className="empty-state">Send a message to start the conversation.</div>
                )}
                {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                ))}
                <div ref={bottomRef} />
            </main>

            <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
    );
}
