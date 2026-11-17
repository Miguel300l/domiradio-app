import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { fetchUsers, fetchMessages, sendMessage } from '../services/chat';
import { onChat, pushChat } from '../services/livekit';
import { ChatMessage, ChatUser, Conversation } from '../types';
import { colors, common } from '../theme';

function Room({ token, other, onBack }: { token: string; other: ChatUser; onBack: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const last = useRef<string | undefined>(undefined);

  const add = useCallback((list: ChatMessage[]) => {
    if (!list.length) return;
    setMsgs(prev => {
      const map = new Map(prev.map(m => [m.id, m]));
      list.forEach(m => map.set(m.id, m));
      const all = [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      last.current = all[all.length - 1].createdAt;
      return all;
    });
  }, []);

  useEffect(() => {
    const poll = () => fetchMessages(token, other.id, last.current).then(add).catch(() => {});
    poll();
    const timer = setInterval(poll, 5000); // respaldo: trae mensajes nuevos cada 5 s
    const off = onChat(m => { if (m.from === other.id) add([m]); }); // llegada instantánea
    return () => { clearInterval(timer); off(); };
  }, [token, other.id, add]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    try {
      const m = await sendMessage(token, other.id, t);
      add([m]);
      pushChat(m);
    } catch { setText(t); Alert.alert('Error', 'No se pudo enviar el mensaje'); }
  };

  return (
    <View style={common.flex}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={common.h2}>{other.name}</Text>
      </View>
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={common.sub}>Escribe el primer mensaje</Text>}
        renderItem={({ item }) => {
          const mine = item.from !== other.id;
          return (
            <View style={[s.bubble, mine ? s.mine : s.theirs]}>
              <Text style={{ color: mine ? '#000' : '#fff', fontSize: 16 }}>{item.text}</Text>
              <Text style={[s.time, { color: mine ? '#444' : '#999' }]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />
      <View style={s.inputRow}>
        <TextInput style={s.input} value={text} onChangeText={setText} placeholder="Mensaje" placeholderTextColor="#888" maxLength={1000} multiline />
        <TouchableOpacity style={s.send} onPress={send}><Text style={common.btnTxt}>Enviar</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function Picker({ token, onPick, onBack }: { token: string; onPick: (u: ChatUser) => void; onBack: () => void }) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { fetchUsers(token).then(setUsers).catch(() => {}); }, [token]);
  const list = users.filter(u => u.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <View style={common.flex}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={common.h2}>Nuevo chat</Text>
      </View>
      <TextInput style={s.search} value={q} onChangeText={setQ} placeholder="Buscar domiciliario" placeholderTextColor="#888" />
      <FlatList
        data={list}
        keyExtractor={u => u.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={common.sub}>Sin resultados</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={common.card} onPress={() => onPick(item)}>
            <Text style={[common.h2, { textAlign: 'left' }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ChatScreen({ token, convs, reload }: { token: string; convs: Conversation[]; reload: () => void }) {
  const [open, setOpen] = useState<ChatUser | null>(null);
  const [picking, setPicking] = useState(false);

  if (open) return <Room token={token} other={open} onBack={() => { setOpen(null); reload(); }} />;
  if (picking) return <Picker token={token} onBack={() => setPicking(false)} onPick={u => { setPicking(false); setOpen(u); }} />;

  return (
    <View style={common.flex}>
      <View style={[s.header, { justifyContent: 'space-between' }]}>
        <Text style={common.h2}>Chat</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => setPicking(true)}><Text style={common.btnTxt}>+ Nuevo</Text></TouchableOpacity>
      </View>
      <FlatList
        data={convs}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={false}
        onRefresh={reload}
        ListEmptyComponent={<Text style={common.sub}>Aún no tienes conversaciones. Toca "+ Nuevo" para escribirle a alguien.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[common.card, s.convRow]} onPress={() => setOpen({ id: item.id, name: item.name })}>
            <View style={{ flex: 1 }}>
              <Text style={[common.h2, { textAlign: 'left', fontWeight: item.unread ? '800' : '600' }]}>{item.name}</Text>
              <Text numberOfLines={1} style={{ color: item.unread ? '#fff' : '#999', fontSize: 15 }}>
                {item.last.from !== item.id ? 'Tú: ' : ''}{item.last.text}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#999', fontSize: 12 }}>{hhmm(item.last.createdAt)}</Text>
              {item.unread > 0 && <View style={s.badge}><Text style={s.badgeTxt}>{item.unread}</Text></View>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  search: { backgroundColor: colors.card, color: '#fff', borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 14, height: 46 },
  newBtn: { backgroundColor: colors.yellow, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  convRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: '#FF4136', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginTop: 6 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 16 },
  back: { color: colors.yellow, fontSize: 28 },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 10, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.yellow },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card },
  time: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: colors.card, color: '#fff', borderRadius: 14, paddingHorizontal: 14, maxHeight: 110 },
  send: { backgroundColor: colors.yellow, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
});
