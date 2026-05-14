import { Router, type Request, type Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { createHeaders } from 'portkey-ai';

import dotenv from 'dotenv';
import 'dotenv/config';
dotenv.config({ path: '.env.local', override: true });

type ChatMessage = {
    content: string;
    role: 'user' | 'assistant';
};

const API_KEY = process.env.PORTKEY_API_KEY;
const BASE_URL = process.env.PORTKEY_BASE_URL || 'https://www.google.com';
const MAX_TOKENS = process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS, 10) : 512;
const MODEL = process.env.MODEL || "@dsvertex/anthropic.claude-haiku-4-5@20251001";

const client = new Anthropic({
    apiKey: API_KEY,
    baseURL: BASE_URL,
    defaultHeaders: createHeaders({
        apiKey: API_KEY,
        "x-Api-Key": API_KEY,
    }),
});
const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { messages } = req.body as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'messages array is required' });
        return;
    }

    console.log('Received message(s) from app:', messages);

    const validMessages = messages.filter((m) => m.content.trim() !== '');

    if (validMessages.length === 0) {
        res.status(400).json({ error: 'no non-empty messages provided' });
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = client.messages.stream({
            max_tokens: MAX_TOKENS,
            messages: validMessages,
            model: MODEL,
        });

        stream.on('error', (err) => console.error('Stream error event:', err));

        for await (const event of stream) {
            console.log('Stream event:', event.type);
            if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
            ) {
                res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    } finally {
        res.end();
    }
});

export default router;
