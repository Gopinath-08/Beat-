export interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
  isUploaded?: boolean;
  uploadedBy?: string;
}

export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'own' | 'other' | 'system';
}

export interface RoomData {
  room: string;
  userCount: number;
  tracks: Track[];
}

export interface User {
  username: string;
  room: string;
}

export interface PlayMusicData {
  room: string;
  track: Track;
  isPlaying: boolean;
  currentTime: number;
} 