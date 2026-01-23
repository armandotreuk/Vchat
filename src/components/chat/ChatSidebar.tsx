import { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { ChatSession, Folder } from '@/types/chat';
import { FolderItem } from './FolderItem';

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
}

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
}: ChatSidebarProps) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [tempFolderId, setTempFolderId] = useState<string | null>(null);

  // Sessions without a folder (loose chats)
  const looseSessions = sessions.filter((s) => !s.folderId);

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
    // If it's a temp folder being created, delete it
    if (tempFolderId && editingFolderId === tempFolderId) {
      onDeleteFolder(tempFolderId);
    }
    setEditingFolderId(null);
    setTempFolderId(null);
  };

  const handleStartEdit = (folderId: string) => {
    setEditingFolderId(folderId);
  };

  return (
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
        {/* Folders */}
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

        {/* Loose sessions (without folder) */}
        {looseSessions.map((session) => {
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
