import { PermissionsAndroid } from 'react-native';
import { Room, RoomEvent, Participant } from 'livekit-client';
import { AudioSession } from '@livekit/react-native';
import { fetchLivekitToken } from './api';
import { ChatMessage, Person, Status } from '../types';

let room: Room | null = null;

// Mensajes de chat que llegan al instante por LiveKit
const listeners = new Set<(m: ChatMessage) => void>();
export const onChat = (cb: (m: ChatMessage) => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

// Quién está hablando ahora mismo en la radio
const speakListeners = new Set<(names: string[]) => void>();
export const onSpeaking = (cb: (names: string[]) => void) => { speakListeners.add(cb); return () => { speakListeners.delete(cb); }; };

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
  room.on(RoomEvent.ParticipantNameChanged, emit);
  room.on(RoomEvent.ActiveSpeakersChanged, speakers => {
    const names = speakers.filter(p => !p.isLocal).map(p => p.name || 'Alguien');
    speakListeners.forEach(cb => cb(names));
  });
  room.on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
    if (topic !== 'chat' || !participant) return;
    try {
      const m = JSON.parse(new TextDecoder().decode(payload)) as ChatMessage;
      listeners.forEach(cb => cb({ ...m, from: participant.identity })); // el remitente es quien envió el paquete
    } catch {}
  });
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

// Avisa al destinatario al instante (el mensaje ya quedó guardado en el servidor)
export const pushChat = (m: ChatMessage) =>
  room?.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(m)), {
    reliable: true, destinationIdentities: [m.to], topic: 'chat',
  });

// Cambia el nombre visible de este usuario en la sala sin reconectar
export const renameMe = (name: string) => room?.localParticipant.setName(name);
