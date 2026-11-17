import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types';

const KEY = 'domiradio_session';

export const loadSession = async (): Promise<Session | null> => {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Session) : null;
  } catch { return null; }
};

export const saveSession = (s: Session) => { AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); };
export const clearSession = () => { AsyncStorage.removeItem(KEY).catch(() => {}); };
