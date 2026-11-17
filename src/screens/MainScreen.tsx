import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RadioScreen from './RadioScreen';
import ConnectedScreen from './ConnectedScreen';
import ChatScreen from './ChatScreen';
import ProfileScreen from './ProfileScreen';
import { joinChannel, leaveChannel, onChat } from '../services/livekit';
import { fetchConversations } from '../services/chat';
import { Conversation, Person, Session, Tab } from '../types';
import { colors, common } from '../theme';

const TABS: { key: Tab; label: string }[] = [
  { key: 'radio', label: 'Radio' },
  { key: 'conectados', label: 'Conectados' },
  { key: 'chat', label: 'Chat' },
  { key: 'perfil', label: 'Perfil' },
];

export default function MainScreen({ session, onLogout, onRename }: { session: Session; onLogout: () => void; onRename: (name: string) => void }) {
  const insets = useSafeAreaInsets(); // respeta barra de estado y botones del sistema
  const [tab, setTab] = useState<Tab>('radio');
  const [people, setPeople] = useState<Person[]>([]);
  const [online, setOnline] = useState(false);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const unread = convs.reduce((n, c) => n + c.unread, 0);

  // Conversaciones y no leídos: al instante con LiveKit y como respaldo cada 10 s
  const reload = useCallback(() => { fetchConversations(session.token).then(setConvs).catch(() => {}); }, [session.token]);
  useEffect(() => {
    reload();
    const timer = setInterval(reload, 10000);
    const off = onChat(() => setTimeout(reload, 400));
    return () => { clearInterval(timer); off(); };
  }, [reload]);

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
      {tab === 'chat' && <ChatScreen token={session.token} convs={convs} reload={reload} />}
      {tab === 'perfil' && <ProfileScreen token={session.token} name={session.name} onRename={onRename} onLogout={onLogout} />}
      <View style={[s.tabs, { paddingBottom: 8 + insets.bottom }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && { backgroundColor: colors.yellow }]} onPress={() => setTab(t.key)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text numberOfLines={1} style={{ color: tab === t.key ? '#000' : '#fff', fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
              {t.key === 'chat' && unread > 0 && <View style={s.dot}><Text style={s.dotTxt}>{unread > 99 ? '99+' : unread}</Text></View>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  dot: { backgroundColor: '#FF4136', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  dotTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, padding: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 2, borderRadius: 16 },
});
