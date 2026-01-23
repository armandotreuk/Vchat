import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 rounded-xl border border-[hsl(var(--input-border))] bg-[hsl(var(--input-bg))] focus-within:border-[hsl(var(--input-focus-border))] transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 resize-none bg-transparent px-4 py-3 text-sm focus:outline-none min-h-[48px] max-h-[200px]"
            rows={1}
            disabled={disabled}
          />
          <div className="flex items-center gap-1 pr-2 pb-2">
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--feedback-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--feedback-hover))] transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
