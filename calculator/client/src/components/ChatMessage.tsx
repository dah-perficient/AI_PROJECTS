import ReactMarkdown from 'react-markdown';

import type { Message } from '../App';
import './ChatMessage.css';

type Props = {
    message: Message;
};

export default function ChatMessage({ message }: Props) {
    return (
        <div className={`message message--${message.role}`}>
            <span className="message__role">{message.role === 'user' ? 'You' : 'Claude'}</span>
            <div className="message__content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
        </div>
    );
}
