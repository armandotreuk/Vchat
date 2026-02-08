import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatSessions } from '@/hooks/useChatSessions';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { AdminSessionView } from '@/components/chat/AdminSessionView';
import MainLayout from "@/components/MainLayout";

interface AdminSessionData {
  sessionId: string;
  agentTitle: string;
  interactions: any[];
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('adminMode') === 'true';
  const [adminSessionData, setAdminSessionData] = useState<AdminSessionData | null>(null);

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

  // Load admin session data from sessionStorage
  useEffect(() => {
    if (isAdminMode) {
      const storedData = sessionStorage.getItem('adminSessionView');
      if (storedData) {
        try {
          setAdminSessionData(JSON.parse(storedData));
        } catch (e) {
          console.error('Failed to parse admin session data', e);
        }
      }
    } else {
      setAdminSessionData(null);
      sessionStorage.removeItem('adminSessionView');
    }
  }, [isAdminMode]);

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

  // If in admin mode with session data, show the admin view
  if (isAdminMode && adminSessionData) {
    return (
      <MainLayout>
        <AdminSessionView sessionData={adminSessionData} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col overflow-hidden">
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
    </MainLayout>
  );
};

export default Index;
