import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Folder, MoreVertical } from 'lucide-react';
import { Folder as FolderType, ChatSession } from '@/types/chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableSessionItem } from './SortableSessionItem';
import { useDroppable } from '@dnd-kit/core';

interface FolderItemProps {
  folder: FolderType;
  sessions: ChatSession[];
  activeSessionId: string | null;
  isEditing: boolean;
  onToggleExpand: (folderId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  onCancelEdit: () => void;
  onStartEdit: (folderId: string) => void;
}

const MAX_NAME_LENGTH = 30; // UPDATED to 30

export function FolderItem({
  folder,
  sessions,
  activeSessionId,
  isEditing,
  onToggleExpand,
  onSelectSession,
  onRename,
  onCancelEdit,
  onStartEdit,
}: FolderItemProps) {
  const [editValue, setEditValue] = useState(folder.name);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const folderSessions = sessions.filter((s) => s.folderId === folder.id);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folder.id,
    data: { type: 'folder', folder },
    disabled: isEditing, // Disable drag while editing
  });

  // Make the folder drop target for sessions
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: folder.id,
    data: { type: 'folder', folder },
  });

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(folder.name);
  }, [folder.name]);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [folderSessions.length, folder.isExpanded]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = editValue.trim();
      if (trimmedValue.length > 0) {
        onRename(folder.id, trimmedValue);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelEdit();
    }
  };

  const handleFolderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleExpand(folder.id);
    }
  };

  const handleBlur = () => {
    // If we are dragging, blur might trigger unwanted saves or cancels. 
    // Usually fine, but if issues arise, check interaction.
    const trimmedValue = editValue.trim();
    if (trimmedValue.length > 0) {
      onRename(folder.id, trimmedValue);
    } else {
      onCancelEdit(); // Or revert to old name if strictly required not empty
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setEditValue(value);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit(folder.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-1"
      {...attributes}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={folder.isExpanded}
        aria-label={`Pasta ${folder.name}${folderSessions.length > 0 ? `, ${folderSessions.length} conversas` : ''}`}
        // Drag listeners need to be attached to the handle or the whole item
        // Attaching to the whole item for now, but excluding input
        // Using `listeners` on this div
        {...listeners}
        className={`flex items-center gap-1 px-2 py-2 text-sm rounded-lg transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-active-border))] focus:ring-offset-1 ${isOver ? 'bg-[hsl(var(--sidebar-hover))] ring-2 ring-blue-500' : 'hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
        onClick={() => !isEditing && onToggleExpand(folder.id)}
        onKeyDown={handleFolderKeyDown}
        onDoubleClick={handleDoubleClick}
      >
        <span
          className="p-0.5 transition-transform duration-200 ease-in-out"
          style={{ transform: folder.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <ChevronRight className="w-4 h-4 text-[hsl(var(--sidebar-text-muted))]" />
        </span>

        <Folder className={`w-4 h-4 text-[hsl(var(--sidebar-text-muted))] flex-shrink-0 ${isOver ? 'text-blue-500' : ''}`} />

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleBlur}
            className="flex-1 px-1 py-0.5 text-sm bg-[hsl(var(--sidebar-bg))] border border-[hsl(var(--sidebar-border))] rounded text-[hsl(var(--sidebar-text))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sidebar-active-border))]"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on input
            maxLength={MAX_NAME_LENGTH}
          />
        ) : (
          <span className="flex-1 truncate text-[hsl(var(--sidebar-text))]">
            {folder.name}
          </span>
        )}

        {folderSessions.length > 0 && !isEditing && (
          <span className="text-xs text-[hsl(var(--sidebar-text-muted))] bg-[hsl(var(--sidebar-hover))] px-1.5 py-0.5 rounded">
            {folderSessions.length}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--sidebar-hover))] rounded transition-opacity focus:opacity-100"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag
              aria-label="Menu da pasta"
            >
              <MoreVertical className="w-4 h-4 text-[hsl(var(--sidebar-text-muted))]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))] z-50"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(folder.id);
              }}
              className="text-[hsl(var(--sidebar-text))] focus:bg-[hsl(var(--sidebar-hover))] focus:text-[hsl(var(--sidebar-text))] cursor-pointer"
            >
              Renomear
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Animated accordion content */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: folder.isExpanded ? (contentHeight ? contentHeight + 500 : undefined) : 0, // Add buffer for DnD height changes
          opacity: folder.isExpanded ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="ml-4 pl-2 border-l border-[hsl(var(--sidebar-border))]"
        >
          <SortableContext
            items={folderSessions.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {folderSessions.length === 0 ? (
              <p className="text-xs text-[hsl(var(--sidebar-text-muted))] py-2 px-2 italic">
                Arraste conversas para cá
              </p>
            ) : (
              folderSessions.map((session) => (
                <SortableSessionItem
                  key={session.id}
                  session={session}
                  activeSessionId={activeSessionId}
                  onSelectSession={onSelectSession}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
