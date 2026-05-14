import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ChatMessage from '@/components/ChatMessage';

describe('ChatMessage', () => {
    it('renders the "You" label for user messages', () => {
        render(<ChatMessage message={{ role: 'user', content: 'Hello' }} />);
        expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('renders the "Claude" label for assistant messages', () => {
        render(<ChatMessage message={{ role: 'assistant', content: 'Hi there' }} />);
        expect(screen.getByText('Claude')).toBeInTheDocument();
    });

    it('renders message content', () => {
        render(<ChatMessage message={{ role: 'user', content: 'What is 2 + 2?' }} />);
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    it('applies the user modifier class', () => {
        const { container } = render(
            <ChatMessage message={{ role: 'user', content: 'Hello' }} />,
        );
        expect(container.firstChild).toHaveClass('message--user');
    });

    it('applies the assistant modifier class', () => {
        const { container } = render(
            <ChatMessage message={{ role: 'assistant', content: 'Hello' }} />,
        );
        expect(container.firstChild).toHaveClass('message--assistant');
    });

    it('renders markdown bold text', async () => {
        render(<ChatMessage message={{ role: 'assistant', content: '**bold**' }} />);
        const bold = await screen.findByText('bold');
        expect(bold.tagName).toBe('STRONG');
    });

    it('renders markdown inline code', async () => {
        render(<ChatMessage message={{ role: 'assistant', content: '`code`' }} />);
        const code = await screen.findByText('code');
        expect(code.tagName).toBe('CODE');
    });
});
