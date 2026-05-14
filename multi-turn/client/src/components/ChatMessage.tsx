import type { Message } from '../App';
import './ChatMessage.css';

type Props = {
    message: Message;
};

export default function ChatMessage({ message }: Props) {
    return (
        <div className={`message message--${message.role}`}>
            <span className="message__role">{message.role === 'user' ? 'You' : 'Claude'}</span>
            <p className="message__content">{message.content}</p>
        </div>
    );
}
