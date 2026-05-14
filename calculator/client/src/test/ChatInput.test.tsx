import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ChatInput from '@/components/ChatInput';

describe('ChatInput', () => {
    it('renders the textarea and Send button', () => {
        render(<ChatInput onSend={vi.fn()} disabled={false} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('Send button is disabled when input is empty', () => {
        render(<ChatInput onSend={vi.fn()} disabled={false} />);
        expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    it('Send button is enabled once text is typed', async () => {
        const user = userEvent.setup();
        render(<ChatInput onSend={vi.fn()} disabled={false} />);
        await user.type(screen.getByRole('textbox'), 'hello');
        expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
    });

    it('calls onSend with trimmed text when Send is clicked', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn();
        render(<ChatInput onSend={onSend} disabled={false} />);
        await user.type(screen.getByRole('textbox'), '  add 1 2 3  ');
        await user.click(screen.getByRole('button', { name: /send/i }));
        expect(onSend).toHaveBeenCalledOnce();
        expect(onSend).toHaveBeenCalledWith('add 1 2 3');
    });

    it('clears the textarea after sending', async () => {
        const user = userEvent.setup();
        render(<ChatInput onSend={vi.fn()} disabled={false} />);
        const textarea = screen.getByRole('textbox');
        await user.type(textarea, 'hello');
        await user.click(screen.getByRole('button', { name: /send/i }));
        expect(textarea).toHaveValue('');
    });

    it('calls onSend when Enter is pressed (without Shift)', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn();
        render(<ChatInput onSend={onSend} disabled={false} />);
        await user.type(screen.getByRole('textbox'), 'hello{Enter}');
        expect(onSend).toHaveBeenCalledOnce();
        expect(onSend).toHaveBeenCalledWith('hello');
    });

    it('does not call onSend when Shift+Enter is pressed', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn();
        render(<ChatInput onSend={onSend} disabled={false} />);
        await user.type(screen.getByRole('textbox'), 'hello{Shift>}{Enter}{/Shift}');
        expect(onSend).not.toHaveBeenCalled();
    });

    it('disables textarea and button when disabled prop is true', () => {
        render(<ChatInput onSend={vi.fn()} disabled={true} />);
        expect(screen.getByRole('textbox')).toBeDisabled();
        expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    it('does not call onSend when disabled and Enter is pressed', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn();
        render(<ChatInput onSend={onSend} disabled={true} />);
        await user.type(screen.getByRole('textbox'), 'hello');
        expect(onSend).not.toHaveBeenCalled();
    });
});
