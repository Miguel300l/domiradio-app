import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { setTalking } from '../services/livekit';
import { colors, common } from '../theme';

type Props = { online: boolean; count: number };

export default function RadioScreen({ online, count }: Props) {
  const [talking, setTalk] = useState(false);

  const talk = async (on: boolean) => {
    if (!online) return;
    setTalk(on);
    await setTalking(on);
  };

  return (
    <View style={common.center}>
      <View style={s.row}>
        <Text style={s.logo}>DOMI <Text style={{ color: colors.yellow }}>RADIO</Text></Text>
        <Text style={[s.badge, !online && { backgroundColor: '#666' }]}>{online ? 'En línea' : 'Conectando…'}</Text>
      </View>
      <View style={common.card}>
        <Text style={common.h2}>Canal General</Text>
        <Text style={common.sub}>{count} domiciliarios conectados</Text>
      </View>
      <Pressable
        onPressIn={() => talk(true)}
        onPressOut={() => talk(false)}
        style={[s.mic, talking && { backgroundColor: '#FFE066', transform: [{ scale: 1.08 }] }]}>
        <Text style={{ fontSize: 80 }}>🎙️</Text>
      </Pressable>
      <Text style={common.h2}>{talking ? 'Hablando…' : 'Mantén presionado\npara hablar'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  logo: { color: '#fff', fontSize: 26, fontWeight: '900', fontStyle: 'italic' },
  badge: { backgroundColor: '#1E8E3E', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  mic: { width: 220, height: 220, borderRadius: 110, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', marginVertical: 30, elevation: 20 },
});
