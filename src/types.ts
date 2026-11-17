export type Status = 'Disponible' | 'Ocupado';
export type Person = { id: string; name: string; status: Status };
export type Session = { token: string; name: string };
export type Tab = 'radio' | 'conectados' | 'chat' | 'perfil';
export type ChatUser = { id: string; name: string };
export type ChatMessage = { id: string; from: string; to: string; text: string; createdAt: string };
export type Conversation = { id: string; name: string; unread: number; last: { text: string; from: string; createdAt: string } };
