import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RadioScreen from './RadioScreen';
import ConnectedScreen from './ConnectedScreen';
import ChatScreen from './ChatScreen';
import ProfileScreen from './ProfileScreen';
import { joinChannel, leaveChannel } from '../services/livekit';
import { Person, Session, Tab } from '../types';
import { colors, common } from '../theme';

const TABS: { key: Tab; label: string }[] = [
  { key: 'radio', label: 'Radio' },
  { key: 'conectados', label: 'Conectados' },
  { key: 'chat', label: 'Chat' },
  { key: 'perfil', label: 'Perfil' },
];

export default function MainScreen({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const insets = useSafeAreaInsets(); // respeta barra de estado y botones del sistema
  const [tab, setTab] = useState<Tab>('radio');
  const [people, setPeople] = useState<Person[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    joinChannel(session.token, setPeople)
      .then(() => setOnline(true))
      .catch(e => Alert.alert('Error', e.message || 'No se pudo conectar al canal'));
    return () => { leaveChannel(); };
  }, [session.token]);

  return (
    <View style={[common.flex, { paddingTop: insets.top }]}>
      {tab === 'radio' && <RadioScreen online={online} count={people.length} />}
      {tab === 'conectados' && <ConnectedScreen people={people} />}
      {tab === 'chat' && <ChatScreen token={session.token} />}
      {tab === 'perfil' && <ProfileScreen name={session.name} onLogout={onLogout} />}
      <View style={[s.tabs, { paddingBottom: 8 + insets.bottom }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && { backgroundColor: colors.yellow }]} onPress={() => setTab(t.key)}>
            <Text numberOfLines={1} style={{ color: tab === t.key ? '#000' : '#fff', fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.card, padding: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 2, borderRadius: 16 },
});
