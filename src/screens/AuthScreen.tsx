import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { authRequest } from '../services/api';
import { colors, common } from '../theme';

export default function AuthScreen({ onLogin }: { onLogin: (token: string, name: string) => void }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      const d = await authRequest(register ? 'register' : 'login', { name, email, password, nickname });
      onLogin(d.token, d.name);
    } catch (e: any) {
      Alert.alert('Error', e.message === 'Network request failed' ? 'No hay conexión con el servidor' : e.message);
    }
  };

  return (
    <View style={common.center}>
      <Text style={s.logo}>DOMI <Text style={{ color: colors.yellow }}>RADIO</Text></Text>
      <Text style={common.sub}>Comunicación de audio en tiempo real para domiciliarios</Text>
      {register && <TextInput style={s.input} placeholder="Nombre" placeholderTextColor="#888" value={name} onChangeText={setName} />}
      {register && <TextInput style={s.input} placeholder="Sobrenombre (ej: Móvil 12)" placeholderTextColor="#888" maxLength={20} value={nickname} onChangeText={setNickname} />}
      <TextInput style={s.input} placeholder="Correo" placeholderTextColor="#888" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Clave" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={common.btn} onPress={submit}>
        <Text style={common.btnTxt}>{register ? 'Registrarse' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[common.btn, common.btnOutline]} onPress={() => setRegister(!register)}>
        <Text style={[common.btnTxt, { color: '#fff' }]}>{register ? 'Ya tengo cuenta' : 'Crear cuenta'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  logo: { color: '#fff', fontSize: 52, fontWeight: '900', fontStyle: 'italic' },
  input: { backgroundColor: colors.card, color: '#fff', width: '100%', borderRadius: 12, padding: 14, marginBottom: 10 },
});
