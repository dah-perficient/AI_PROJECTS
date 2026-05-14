import { useState, useRef, type KeyboardEvent } from 'react';
import './ChatInput.css';

type Props = {
    onSend: (text: string) => void;
    disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }

    function submit() {
        const text = value.trim();
        if (!text || disabled) return;
        onSend(text);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }

    function handleInput() {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }

    return (
        <div className="chat-input">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder="Message Claude… (Enter to send, Shift+Enter for newline)"
                disabled={disabled}
                rows={1}
            />
            <button onClick={submit} disabled={disabled || !value.trim()}>
                Send
            </button>
        </div>
    );
}
