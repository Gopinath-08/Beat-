import io, { Socket } from 'socket.io-client';
import { Track, Message, RoomData, PlayMusicData } from '../types';

const SERVER_URL = 'https://beat-9igu.onrender.com';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    this.socket = io(SERVER_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.emit('connect');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.emit('disconnect');
    });

    this.socket.on('roomJoined', (data: RoomData) => {
      this.emit('roomJoined', data);
    });

    this.socket.on('userJoined', (data: { username: string; userCount: number }) => {
      this.emit('userJoined', data);
    });

    this.socket.on('userLeft', (data: { username: string; userCount: number }) => {
      this.emit('userLeft', data);
    });

    this.socket.on('message', (data: { username: string; message: string }) => {
      this.emit('message', data);
    });

    this.socket.on('playMusic', (data: PlayMusicData) => {
      this.emit('playMusic', data);
    });

    this.socket.on('newTrackUploaded', (track: Track) => {
      this.emit('newTrackUploaded', track);
    });

    this.socket.on('trackDeleted', (data: { trackId: number }) => {
      this.emit('trackDeleted', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(username: string, room: string) {
    if (this.socket) {
      this.socket.emit('joinRoom', { username, room });
    }
  }

  sendMessage(room: string, message: string, username: string) {
    if (this.socket) {
      this.socket.emit('message', { room, message, username });
    }
  }

  playMusic(data: PlayMusicData) {
    if (this.socket) {
      this.socket.emit('playMusic', data);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService(); 