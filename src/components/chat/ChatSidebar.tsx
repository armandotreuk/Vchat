import { Plus } from 'lucide-react';
import { ChatSession } from '@/types/chat';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
}: ChatSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full">
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))]">
        <h2 className="text-sm font-semibold text-[hsl(var(--sidebar-text))] mb-3">
          Sessões do Chat
        </h2>
        <button
          onClick={onCreateSession}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova sessão</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto chat-scrollbar p-2">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;

          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg mb-1 transition-colors truncate ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] border-l-2 border-[hsl(var(--sidebar-active-border))]'
                  : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))]'
              }`}
            >
              {session.title}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={onCreateSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[hsl(var(--sidebar-text-muted))] hover:text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
        >
          New session
        </button>
      </div>
    </aside>
  );
}
