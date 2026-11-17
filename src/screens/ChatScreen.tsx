import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { fetchUsers, fetchMessages, sendMessage } from '../services/chat';
import { onChat, pushChat } from '../services/livekit';
import { ChatMessage, ChatUser } from '../types';
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

export default function ChatScreen({ token }: { token: string }) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [open, setOpen] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await fetchUsers(token)); } catch {}
    setLoading(false);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  if (open) return <Room token={token} other={open} onBack={() => setOpen(null)} />;
  return (
    <View style={common.flex}>
      <Text style={[common.h2, { margin: 20 }]}>Chat</Text>
      <FlatList
        data={users}
        keyExtractor={u => u.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={common.sub}>Aún no hay otros usuarios registrados</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[common.card, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setOpen(item)}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>💬</Text>
            <Text style={[common.h2, { textAlign: 'left' }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
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
