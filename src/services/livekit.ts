import { PermissionsAndroid } from 'react-native';
import { Room, RoomEvent, Participant } from 'livekit-client';
import { AudioSession } from '@livekit/react-native';
import { fetchLivekitToken } from './api';
import { Person, Status } from '../types';

let room: Room | null = null;

const toPerson = (p: Participant): Person => ({
  id: p.identity,
  name: p.name || 'Domiciliario',
  status: p.attributes?.status === 'Ocupado' ? 'Ocupado' : 'Disponible',
});

const people = (): Person[] =>
  room ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())].map(toPerson) : [];

// La presencia (quién está conectado) sale de los participantes de la sala de LiveKit
export async function joinChannel(token: string, onPresence: (p: Person[]) => void) {
  const perm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (perm !== 'granted') throw new Error('Activa el permiso del micrófono para usar la radio');
  await AudioSession.startAudioSession();
  const r = await fetchLivekitToken(token);
  room = new Room();
  const emit = () => onPresence(people());
  room.on(RoomEvent.ParticipantConnected, emit);
  room.on(RoomEvent.ParticipantDisconnected, emit);
  room.on(RoomEvent.ParticipantAttributesChanged, emit);
  await room.connect(r.url, r.token);
  emit();
}

export const setStatus = (st: Status) => room?.localParticipant.setAttributes({ status: st });

// Push-to-talk: el micrófono solo se publica mientras se mantiene presionado
export const setTalking = (on: boolean) => room?.localParticipant.setMicrophoneEnabled(on);

export async function leaveChannel() {
  room?.disconnect();
  room = null;
  await AudioSession.stopAudioSession();
}
