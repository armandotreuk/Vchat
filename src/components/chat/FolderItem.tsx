import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, MoreVertical } from 'lucide-react';
import { Folder as FolderType, ChatSession } from '@/types/chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const MAX_NAME_LENGTH = 24;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const folderSessions = sessions.filter((s) => s.folderId === folder.id);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(folder.name);
  }, [folder.name]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleBlur = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue.length > 0) {
      onRename(folder.id, trimmedValue);
    } else {
      onCancelEdit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setEditValue(value);
    }
  };

  return (
    <div className="mb-1">
      <div
        className="flex items-center gap-1 px-2 py-2 text-sm rounded-lg transition-colors hover:bg-[hsl(var(--sidebar-hover))] group cursor-pointer"
        onClick={() => !isEditing && onToggleExpand(folder.id)}
      >
        <button
          className="p-0.5 hover:bg-[hsl(var(--sidebar-hover))] rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(folder.id);
          }}
          aria-expanded={folder.isExpanded}
          aria-label={folder.isExpanded ? 'Colapsar pasta' : 'Expandir pasta'}
        >
          {folder.isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[hsl(var(--sidebar-text-muted))]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[hsl(var(--sidebar-text-muted))]" />
          )}
        </button>

        <Folder className="w-4 h-4 text-[hsl(var(--sidebar-text-muted))] flex-shrink-0" />

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="flex-1 px-1 py-0.5 text-sm bg-[hsl(var(--sidebar-bg))] border border-[hsl(var(--sidebar-border))] rounded text-[hsl(var(--sidebar-text))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sidebar-active-border))]"
            onClick={(e) => e.stopPropagation()}
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
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--sidebar-hover))] rounded transition-opacity"
              onClick={(e) => e.stopPropagation()}
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

      {folder.isExpanded && (
        <div
          className="ml-4 pl-2 border-l border-[hsl(var(--sidebar-border))] transition-all duration-200 ease-in-out"
        >
          {folderSessions.length === 0 ? (
            <p className="text-xs text-[hsl(var(--sidebar-text-muted))] py-2 px-2 italic">
              Arraste conversas para cá
            </p>
          ) : (
            folderSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-1 transition-colors truncate ${
                    isActive
                      ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] border-l-2 border-[hsl(var(--sidebar-active-border))]'
                      : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))]'
                  }`}
                >
                  {session.title}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
