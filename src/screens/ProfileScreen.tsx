import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { renameMe, setStatus } from '../services/livekit';
import { saveNickname } from '../services/chat';
import { colors, common } from '../theme';

type Props = { token: string; name: string; onRename: (n: string) => void; onLogout: () => void };

export default function ProfileScreen({ token, name, onRename, onLogout }: Props) {
  const [busy, setBusy] = useState(false);
  const [nick, setNick] = useState('');

  const toggle = () => {
    const next = !busy;
    setBusy(next);
    setStatus(next ? 'Ocupado' : 'Disponible');
  };

  const save = async () => {
    try {
      const n = await saveNickname(token, nick.trim());
      onRename(n);
      renameMe(n);
      setNick('');
      Alert.alert('Listo', `Ahora te ven como "${n}"`);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <View style={common.center}>
      <Text style={s.label}>Así te ven los demás</Text>
      <Text style={s.name}>{name}</Text>
      <TextInput style={s.input} value={nick} onChangeText={setNick} maxLength={20}
        placeholder="Nuevo sobrenombre (ej: Móvil 12)" placeholderTextColor="#888" />
      <TouchableOpacity style={common.btn} onPress={save}><Text style={common.btnTxt}>Guardar sobrenombre</Text></TouchableOpacity>
      <TouchableOpacity style={[common.btn, common.btnOutline]} onPress={toggle}>
        <Text style={[common.btnTxt, { color: '#fff' }]}>{busy ? 'Marcarme disponible' : 'Marcarme ocupado'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[common.btn, common.btnOutline]} onPress={onLogout}>
        <Text style={[common.btnTxt, { color: '#fff' }]}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  label: { color: '#999', fontSize: 14 },
  name: { color: colors.yellow, fontSize: 36, fontWeight: '900', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: colors.card, color: '#fff', width: '100%', borderRadius: 12, padding: 14, marginBottom: 6 },
});
