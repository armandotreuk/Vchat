export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  folderId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  isExpanded: boolean;
}
