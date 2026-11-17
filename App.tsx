import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthScreen from './src/screens/AuthScreen';
import MainScreen from './src/screens/MainScreen';
import { fetchConversations } from './src/services/chat';
import { clearSession, loadSession, saveSession } from './src/services/session';
import { Session } from './src/types';
import { colors, common } from './src/theme';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const logout = () => { clearSession(); setSession(null); };

  useEffect(() => {
    (async () => {
      const saved = await loadSession();
      if (saved) {
        setSession(saved);
        // Si el token venció o cambió, pide iniciar sesión. Si solo falta internet, mantiene la sesión.
        fetchConversations(saved.token).catch(e => { if (e?.message === 'No autorizado') logout(); });
      }
      setReady(true);
    })();
  }, []);

  const login = (token: string, name: string) => {
    const s = { token, name };
    saveSession(s);
    setSession(s);
  };

  const rename = (name: string) =>
    setSession(prev => {
      if (!prev) return prev;
      const next = { ...prev, name };
      saveSession(next);
      return next;
    });

  return (
    <SafeAreaProvider>
      <View style={[common.flex, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        {!ready ? null : session
          ? <MainScreen session={session} onLogout={logout} onRename={rename} />
          : <AuthScreen onLogin={login} />}
      </View>
    </SafeAreaProvider>
  );
}
