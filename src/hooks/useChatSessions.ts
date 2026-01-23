import { useState, useCallback } from 'react';
import { ChatSession, Message, Folder } from '@/types/chat';

const generateId = () => Math.random().toString(36).substring(2, 15);

const createNewSession = (): ChatSession => ({
  id: generateId(),
  title: 'Nova sessão',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  folderId: null,
});

const createNewFolder = (): Folder => ({
  id: generateId(),
  name: 'Nova Pasta',
  createdAt: new Date(),
  isExpanded: true,
});

// Demo sessions for initial state
const createDemoSessions = (): ChatSession[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      id: 'demo-1',
      title: 'Teste 08/01/2026',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'Como calcular o BLEU score em Python?',
          timestamp: yesterday,
        },
        {
          id: 'm2',
          role: 'assistant',
          content: `O BLEU (Bilingual Evaluation Understudy) é uma métrica usada para avaliar a qualidade de traduções automáticas. Vou te mostrar como calcular usando a biblioteca **sacrebleu**:

\`\`\`python
# 📦 Instalação
# pip install sacrebleu

import sacrebleu

# 📝 Frases de referência (traduções humanas)
references = [
    "O gato está dormindo no sofá.",
    "Ela gosta de ler livros antigos.",
    "Nós vamos à praia amanhã."
]

# 🟣 Frases geradas pelo modelo (hipóteses)
hypotheses = [
    "O gato dorme no sofá.",
    "Ela adora ler livros velhos.",
    "Vamos à praia amanhã."
]

# 📊 Cálculo do corpus BLEU
bleu = sacrebleu.corpus_bleu(hypotheses, references)

print(f"Corpus BLEU: {bleu.score:.2f}")
\`\`\`

📊 **Saída esperada (exemplo):**

\`\`\`
Corpus BLEU: 68.45
\`\`\`

💡 **Entendendo o resultado:**

- O BLEU agora foi calculado **considerando todas as frases ao mesmo tempo**, avaliando a média ponderada das similaridades.
- Quanto mais próximo de **100**, mais as frases do modelo se parecem com as de referência.
- É o tipo de cálculo que você usaria para comparar dois modelos de tradução e saber qual tem melhor desempenho geral.

Quer que eu te mostre também como calcular a mesma coisa usando o **NLTK**, pra ver as diferenças entre as funções?`,
          timestamp: yesterday,
        },
      ],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-2',
      title: 'pode fazer um resumo',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-3',
      title: 'Bom dia, me informe',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-4',
      title: 'meu setor precisa de',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-5',
      title: 'boa tarde, que dia é',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-6',
      title: 'qual dia é hoje?',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-7',
      title: 'teste',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
    {
      id: 'demo-8',
      title: 'que dia é hoje?',
      messages: [],
      createdAt: yesterday,
      updatedAt: yesterday,
      folderId: null,
    },
  ];
};

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(createDemoSessions);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('demo-1');

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Session methods
  const createSession = useCallback(() => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession;
  }, []);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setSessions((prev) => {
          if (prev.length > 0) {
            setActiveSessionId(prev[0].id);
          } else {
            const newSession = createNewSession();
            setActiveSessionId(newSession.id);
            return [newSession];
          }
          return prev;
        });
      }
    },
    [activeSessionId]
  );

  const addMessage = useCallback(
    (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;

          const updatedMessages = [...session.messages, newMessage];
          const title =
            session.messages.length === 0 && message.role === 'user'
              ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
              : session.title;

          return {
            ...session,
            title,
            messages: updatedMessages,
            updatedAt: new Date(),
          };
        })
      );

      return newMessage;
    },
    []
  );

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Folder methods
  const createFolder = useCallback((): Folder => {
    const newFolder = createNewFolder();
    setFolders((prev) => [newFolder, ...prev]);
    return newFolder;
  }, []);

  const renameFolder = useCallback((folderId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, name: newName } : folder
      )
    );
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  }, []);

  const toggleFolderExpand = useCallback((folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  }, []);

  const moveSessionToFolder = useCallback(
    (sessionId: string, folderId: string | null) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, folderId } : session
        )
      );
    },
    []
  );

  return {
    sessions,
    folders,
    activeSession,
    activeSessionId,
    createSession,
    deleteSession,
    addMessage,
    selectSession,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolderExpand,
    moveSessionToFolder,
  };
}
