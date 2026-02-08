import { useState, useCallback, useRef } from 'react';
import { Plus, FolderPlus, MessageSquare, Folder as FolderIcon, LayoutDashboard } from 'lucide-react';
import type { ChatSession, Folder } from '@/types/chat';
import { FolderItem } from './FolderItem';
import { SortableSessionItem } from './SortableSessionItem';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

interface ChatSidebarProps {
  sessions: ChatSession[];
  folders: Folder[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onCreateFolder: () => Folder;
  onRenameFolder: (folderId: string, newName: string) => void;
  onToggleFolderExpand: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveSession: (sessionId: string, folderId: string | null) => void;
  onReorderFolders: (activeId: string, overId: string) => void;
  onReorderSessions: (activeId: string, overId: string) => void;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function ChatSidebar({
  sessions,
  folders,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onCreateFolder,
  onRenameFolder,
  onToggleFolderExpand,
  onDeleteFolder,
  onMoveSession,
  onReorderFolders,
  onReorderSessions,
}: ChatSidebarProps) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [tempFolderId, setTempFolderId] = useState<string | null>(null);

  // DnD State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<{ type: 'folder' | 'session'; data: Folder | ChatSession } | null>(null);

  // Auto-expand logic
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastOverFolderIdRef = useRef<string | null>(null);

  // Sessions without a folder (loose chats)
  const looseSessions = sessions.filter((s) => !s.folderId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateFolder = () => {
    const newFolder = onCreateFolder();
    setTempFolderId(newFolder.id);
    setEditingFolderId(newFolder.id);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    onRenameFolder(folderId, newName);
    setEditingFolderId(null);
    setTempFolderId(null);
  };

  const handleCancelEdit = () => {
    if (tempFolderId && editingFolderId === tempFolderId) {
      onDeleteFolder(tempFolderId);
    }
    setEditingFolderId(null);
    setTempFolderId(null);
  };

  const handleStartEdit = (folderId: string) => {
    setEditingFolderId(folderId);
  };

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.data.current?.type === 'folder') {
      setActiveItem({ type: 'folder', data: active.data.current.folder });
    } else if (active.data.current?.type === 'session') {
      setActiveItem({ type: 'session', data: active.data.current.session });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
        lastOverFolderIdRef.current = null;
      }
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Handle Auto-Expand for Folders
    if (activeType === 'session' && overType === 'folder') {
      const folderId = over.id as string;
      const folder = folders.find(f => f.id === folderId);

      if (folder && !folder.isExpanded) {
        if (lastOverFolderIdRef.current !== folderId) {
          // New folder hovered
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          lastOverFolderIdRef.current = folderId;
          hoverTimeoutRef.current = setTimeout(() => {
            onToggleFolderExpand(folderId);
          }, 500);
        }
      } else {
        // Already expanded or not a folder
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        lastOverFolderIdRef.current = null;
      }
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
        lastOverFolderIdRef.current = null;
      }
    }

    // Note: We don't necessarily need to move items here for reordering, 
    // unless we want real-time visual sorting across containers.
    // For folder reordering, SortableContext handles the visual placeholder locally.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('DEBUG_DND_V2 handleDragEnd details:', {
      activeType: active.data.current?.type,
      overType: over?.data.current?.type,
      activeId: active.id,
      overId: over?.id,
      equal: active.id === over?.id
    });

    // Clear auto-expand timer
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    lastOverFolderIdRef.current = null;

    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Folder Reordering
    if (activeData.type === 'folder' && overData.type === 'folder') {
      if (active.id !== over.id) {
        onReorderFolders(active.id as string, over.id as string);
      }
      return;
    }

    // Session Logic
    if (activeData.type === 'session') {
      const activeSessionId = active.id as string;

      // Dropped on Folder -> Move to Folder
      if (overData.type === 'folder') {
        onMoveSession(activeSessionId, over.id as string);
        return;
      }

      // Dropped on Session
      if (overData.type === 'session') {
        const overSession = overData.session as ChatSession;
        const activeSession = activeData.session as ChatSession;

        // If sessions are in the same container (same folder or both loose) -> Reorder
        if (activeSession.folderId === overSession.folderId) {
          if (active.id !== over.id) {
            onReorderSessions(active.id as string, over.id as string);
          }
        } else {
          // Different container -> Move to new folder (or root)
          onMoveSession(activeSessionId, overSession.folderId);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <aside className="w-64 flex-shrink-0 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full">
        <div className="p-4 border-b border-[hsl(var(--sidebar-border))]">
          <h2 className="text-sm font-semibold text-[hsl(var(--sidebar-text))] mb-3">
            Sessões do Chat
          </h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={onCreateSession}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova sessão</span>
            </button>
            <button
              onClick={handleCreateFolder}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Nova Pasta</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto chat-scrollbar p-2">
          {/* Folders Sortable Context */}
          <SortableContext
            items={folders.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                sessions={sessions}
                activeSessionId={activeSessionId}
                isEditing={editingFolderId === folder.id}
                onToggleExpand={onToggleFolderExpand}
                onSelectSession={onSelectSession}
                onRename={handleRenameFolder}
                onCancelEdit={handleCancelEdit}
                onStartEdit={handleStartEdit}
              />
            ))}
          </SortableContext>

          {/* Loose Sessions Sortable Context */}
          <SortableContext
            items={looseSessions.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {looseSessions.map((session) => (
              <SortableSessionItem
                key={session.id}
                session={session}
                activeSessionId={activeSessionId}
                onSelectSession={onSelectSession}
              />
            ))}
          </SortableContext>
        </div>

      </aside>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? (
          activeItem?.type === 'folder' ? (
            <div className="flex items-center gap-1 px-2 py-2 text-sm rounded-lg bg-[hsl(var(--sidebar-bg))] border border-[hsl(var(--sidebar-border))] shadow-lg opacity-80 w-56">
              <span className="p-0.5"><FolderIcon className="w-4 h-4 text-[hsl(var(--sidebar-text-muted))]" /></span>
              <span className="truncate text-[hsl(var(--sidebar-text))]">{(activeItem.data as Folder).name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-2.5 text-sm rounded-lg bg-[hsl(var(--sidebar-bg))] border border-[hsl(var(--sidebar-border))] shadow-lg opacity-80 w-56">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="truncate text-[hsl(var(--sidebar-text))]">{(activeItem?.data as ChatSession).title}</span>
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
