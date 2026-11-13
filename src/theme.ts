import { StyleSheet } from 'react-native';

export const colors = { yellow: '#FFC400', card: '#1C1C1E', bg: '#0A0A0A', green: '#2ECC40', red: '#FF4136' };

export const common = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  sub: { color: '#bbb', fontSize: 16, textAlign: 'center', marginVertical: 12 },
  h2: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, width: '100%', marginBottom: 12 },
  btn: { backgroundColor: colors.yellow, width: '100%', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#fff' },
  btnTxt: { color: '#000', fontSize: 18, fontWeight: '700' },
});
