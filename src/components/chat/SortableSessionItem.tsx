import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChatSession } from '@/types/chat';

interface SortableSessionItemProps {
    session: ChatSession;
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
}

export function SortableSessionItem({
    session,
    activeSessionId,
    onSelectSession,
}: SortableSessionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: session.id, data: { type: 'session', session } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isActive = session.id === activeSessionId;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <button
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg mb-1 transition-colors truncate ${isActive
                    ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] border-l-2 border-[hsl(var(--sidebar-active-border))]'
                    : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))]'
                    }`}
            >
                {session.title}
            </button>
        </div>
    );
}
