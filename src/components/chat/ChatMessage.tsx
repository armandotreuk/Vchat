import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message } from '@/types/chat';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isAssistant = message.role === 'assistant';

  return (
    <div className={`py-6 ${isAssistant ? 'bg-[hsl(var(--chat-assistant-bg))]' : ''}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !String(children).includes('\n');

                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-[hsl(var(--code-bg))] text-[hsl(var(--code-text))] text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    language={match?.[1] || ''}
                    code={String(children).replace(/\n$/, '')}
                  />
                );
              },
              p({ children }) {
                return <p className="mb-4 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="mb-4 ml-4 list-disc space-y-2">{children}</ul>;
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>;
              },
              strong({ children }) {
                return <strong className="font-semibold">{children}</strong>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-semibold mb-3 mt-5">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold mb-2 mt-4">{children}</h3>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {isAssistant && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground mr-2">Esta resposta foi útil?</span>
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-2 rounded-full transition-colors ${feedback === 'up'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-[hsl(var(--feedback-hover))] hover:text-foreground'
                }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-2 rounded-full transition-colors ${feedback === 'down'
                  ? 'bg-destructive/10 text-destructive'
                  : 'text-muted-foreground hover:bg-[hsl(var(--feedback-hover))] hover:text-foreground'
                }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
