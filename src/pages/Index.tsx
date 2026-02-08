import { useState, useCallback } from 'react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatHeader } from '@/components/chat/ChatHeader';

const Index = () => {
  const {
    sessions,
    folders,
    activeSession,
    activeSessionId,
    createSession,
    addMessage,
    selectSession,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolderExpand,
    moveSessionToFolder,
    reorderFolders,
    reorderSessions,
  } = useChatSessions();

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeSessionId) return;

      // Add user message
      addMessage(activeSessionId, { role: 'user', content });

      setIsLoading(true);

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        addMessage(activeSessionId, {
          role: 'assistant',
          content: `Obrigado pela sua mensagem! Esta é uma resposta simulada.\n\nSua pergunta foi: "${content}"\n\nEm uma implementação real, aqui você conectaria a uma API de IA para gerar respostas inteligentes.`,
        });
        setIsLoading(false);
      }, 1000);
    },
    [activeSessionId, addMessage]
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatHeader
        title="VitruChat"
        subtitle={activeSession?.title || 'Aprenda a Usar'}
      />

      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          sessions={sessions}
          folders={folders}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          onCreateSession={createSession}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onToggleFolderExpand={toggleFolderExpand}
          onDeleteFolder={deleteFolder}
          onMoveSession={moveSessionToFolder}
          onReorderFolders={reorderFolders}
          onReorderSessions={reorderSessions}
        />

        <ChatArea
          session={activeSession}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
