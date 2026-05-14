import { Router, type Request, type Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ToolUseBlock } from '@anthropic-ai/sdk/resources';
import { createHeaders } from 'portkey-ai';
import dotenv from 'dotenv';
import 'dotenv/config';

import { CALCULATOR_TOOLS, executeTool } from '../tools/calculator.js';

dotenv.config({ path: '.env.local', override: true });

type ChatMessage = {
    content: string;
    role: 'user' | 'assistant';
};

const API_KEY = process.env.PORTKEY_API_KEY;
const BASE_URL = process.env.PORTKEY_BASE_URL || 'https://www.google.com';
const MAX_TOKENS = process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS, 10) : 512;
const MODEL = process.env.MODEL || '@dsvertex/anthropic.claude-haiku-4-5@20251001';

const client = new Anthropic({
    apiKey: API_KEY,
    baseURL: BASE_URL,
    defaultHeaders: createHeaders({
        apiKey: API_KEY,
        'x-Api-Key': API_KEY,
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
        // Step 1: Non-streaming call with tool definitions
        const firstResponse = await client.messages.create({
            max_tokens: MAX_TOKENS,
            messages: validMessages,
            model: MODEL,
            tools: CALCULATOR_TOOLS,
        });

        console.log('First response stop_reason:', firstResponse.stop_reason);

        if (firstResponse.stop_reason === 'tool_use') {
            // Find the tool_use content block
            const toolUseBlock = firstResponse.content.find(
                (block): block is ToolUseBlock => block.type === 'tool_use',
            );

            if (!toolUseBlock) {
                const fallbackText = firstResponse.content
                    .filter((b) => b.type === 'text')
                    .map((b) => (b.type === 'text' ? b.text : ''))
                    .join('');
                res.write(`data: ${JSON.stringify({ delta: fallbackText })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
                return;
            }

            console.log('Tool called:', toolUseBlock.name, 'Input:', toolUseBlock.input);

            // Execute the tool locally
            const toolResult = executeTool(
                toolUseBlock.name,
                toolUseBlock.input as Record<string, unknown>,
            );

            console.log('Tool result:', toolResult);

            // Build messages array for the follow-up streaming call
            const followUpMessages: MessageParam[] = [
                ...validMessages,
                { role: 'assistant', content: firstResponse.content },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'tool_result',
                            tool_use_id: toolUseBlock.id,
                            content: toolResult,
                        },
                    ],
                },
            ];

            // Step 2d: Stream the final response
            const stream = client.messages.stream({
                max_tokens: MAX_TOKENS,
                messages: followUpMessages,
                model: MODEL,
                tools: CALCULATOR_TOOLS,
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
        } else {
            // No tool use — send the text content as a single SSE delta
            const textContent = firstResponse.content
                .filter((b) => b.type === 'text')
                .map((b) => (b.type === 'text' ? b.text : ''))
                .join('');

            res.write(`data: ${JSON.stringify({ delta: textContent })}\n\n`);
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
