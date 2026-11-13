// Emulador Android: 10.0.2.2. Celular real: IP de tu PC (o tu dominio en producción).
export const API = 'http://localhost:3000';

export async function authRequest(mode: 'login' | 'register', body: object) {
  const r = await fetch(`${API}/auth/${mode}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error de autenticación');
  return d as { token: string; name: string };
}

export async function fetchLivekitToken(token: string) {
  const r = await fetch(`${API}/livekit/token`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error('No se pudo obtener el token de audio');
  return (await r.json()) as { token: string; url: string };
}
