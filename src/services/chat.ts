import { API } from './api';
import { ChatMessage, ChatUser } from '../types';

const call = async (token: string, path: string, body?: object) => {
  const r = await fetch(`${API}/chat${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
};

export const fetchUsers = (t: string): Promise<ChatUser[]> => call(t, '/users');
export const fetchMessages = (t: string, other: string, after?: string): Promise<ChatMessage[]> =>
  call(t, `/messages/${other}${after ? `?after=${encodeURIComponent(after)}` : ''}`);
export const sendMessage = (t: string, to: string, text: string): Promise<ChatMessage> =>
  call(t, '/messages', { to, text });
