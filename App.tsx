import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthScreen from './src/screens/AuthScreen';
import MainScreen from './src/screens/MainScreen';
import { Session } from './src/types';
import { colors, common } from './src/theme';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <SafeAreaProvider>
    <View style={[common.flex, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {session
        ? <MainScreen session={session} onLogout={() => setSession(null)} />
        : <AuthScreen onLogin={(token, name) => setSession({ token, name })} />}
    </View>
    </SafeAreaProvider>
  );
}
