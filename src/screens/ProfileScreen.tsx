import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { setStatus } from '../services/livekit';
import { common } from '../theme';

export default function ProfileScreen({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [busy, setBusy] = useState(false);

  const toggle = () => {
    const next = !busy;
    setBusy(next);
    setStatus(next ? 'Ocupado' : 'Disponible');
  };

  return (
    <View style={common.center}>
      <Text style={common.h2}>{name}</Text>
      <TouchableOpacity style={common.btn} onPress={toggle}>
        <Text style={common.btnTxt}>{busy ? 'Marcarme disponible' : 'Marcarme ocupado'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[common.btn, common.btnOutline]} onPress={onLogout}>
        <Text style={[common.btnTxt, { color: '#fff' }]}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
