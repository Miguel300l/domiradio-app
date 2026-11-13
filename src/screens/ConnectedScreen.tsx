import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Person } from '../types';
import { colors, common } from '../theme';

export default function ConnectedScreen({ people }: { people: Person[] }) {
  return (
    <View style={common.flex}>
      <Text style={[common.h2, { margin: 20 }]}>Conectados</Text>
      <FlatList
        data={people}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={common.sub}>Aún no hay nadie conectado</Text>}
        renderItem={({ item }) => (
          <View style={[common.card, s.item]}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>🏍️</Text>
            <View>
              <Text style={[common.h2, { textAlign: 'left' }]}>{item.name}</Text>
              <Text style={{ color: item.status === 'Disponible' ? colors.green : colors.red, fontSize: 16 }}>● {item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({ item: { flexDirection: 'row', alignItems: 'center' } });
