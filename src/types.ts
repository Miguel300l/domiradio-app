export type Status = 'Disponible' | 'Ocupado';
export type Person = { id: string; name: string; status: Status };
export type Session = { token: string; name: string };
export type Tab = 'radio' | 'conectados' | 'perfil';
