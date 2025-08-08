import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Track, Message } from '../types';
import { RootStackParamList } from '../../App';
import MusicPlayer from '../components/MusicPlayer';
import ChatSection from '../components/ChatSection';
import TrackList from '../components/TrackList';
import UploadSection from '../components/UploadSection';
import socketService from '../services/socketService';
import apiService from '../services/apiService';

type ChatRoomScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<ChatRoomScreenNavigationProp>();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { username, room } = route.params;
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [userCount, setUserCount] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTab, setCurrentTab] = useState<'all' | 'uploaded'>('all');

  useEffect(() => {
    // Join the room
    socketService.joinRoom(username, room);

    // Load tracks
    const loadTracks = async () => {
      try {
        const tracksData = await apiService.getTracks();
        setTracks(tracksData);
      } catch (error) {
        console.error('Failed to load tracks:', error);
      }
    };

    loadTracks();

    // Set up socket listeners
    socketService.on('roomJoined', (data) => {
      setUserCount(data.userCount);
      setTracks(data.tracks || []);
    });

    socketService.on('newTrackUploaded', (track) => {
      setTracks(prev => [...prev, track]);
    });

    socketService.on('trackDeleted', (data) => {
      setTracks(prev => prev.filter(track => track.id !== data.trackId));
    });

    return () => {
      socketService.off('roomJoined');
      socketService.off('newTrackUploaded');
      socketService.off('trackDeleted');
    };
  }, [username, room]);

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave the room?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive', 
          onPress: () => {
            socketService.disconnect();
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handlePlayMusic = (track: Track, playing: boolean, time: number = 0) => {
    setCurrentTrack(track);
    setIsPlaying(playing);
    setCurrentTime(time);
  };

  const handleNewTrack = (track: Track) => {
    setTracks(prev => [...prev, track]);
  };

  const handleTrackDeleted = (trackId: number) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserJoined = (data: { username: string; userCount: number }) => {
    setUserCount(data.userCount);
    handleNewMessage({
      id: Date.now().toString(),
      username: 'System',
      message: `💕 ${data.username} joined the room!`,
      timestamp: new Date(),
      type: 'system',
    });
  };

  const handleUserLeft = (data: { username: string; userCount: number }) => {
    setUserCount(data.userCount);
    handleNewMessage({
      id: Date.now().toString(),
      username: 'System',
      message: `👋 ${data.username} left the room`,
      timestamp: new Date(),
      type: 'system',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="music" size={24} color="#e91e63" />
          <Text style={styles.roomTitle}>{room}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userCount}>{userCount} user{userCount !== 1 ? 's' : ''} online</Text>
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveRoom}>
            <Icon name="sign-out" size={20} color="#e91e63" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <MusicPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onPlayPause={(playing, time) => {
              if (currentTrack) {
                handlePlayMusic(currentTrack, playing, time);
              }
            }}
          />
          
          <UploadSection
            username={username}
            onTrackUploaded={handleNewTrack}
          />

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, currentTab === 'all' && styles.activeTab]}
              onPress={() => setCurrentTab('all')}
            >
              <Icon name="list" size={16} color={currentTab === 'all' ? '#e91e63' : '#666'} />
              <Text style={[styles.tabText, currentTab === 'all' && styles.activeTabText]}>
                All Tracks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, currentTab === 'uploaded' && styles.activeTab]}
              onPress={() => setCurrentTab('uploaded')}
            >
              <Icon name="cloud" size={16} color={currentTab === 'uploaded' ? '#e91e63' : '#666'} />
              <Text style={[styles.tabText, currentTab === 'uploaded' && styles.activeTabText]}>
                Uploaded
              </Text>
            </TouchableOpacity>
          </View>

          <TrackList
            tracks={tracks}
            currentTab={currentTab}
            onTrackSelect={handlePlayMusic}
            onTrackDelete={handleTrackDeleted}
          />
        </View>

        <ChatSection
          username={username}
          room={room}
          messages={messages}
          onNewMessage={handleNewMessage}
          onUserJoined={handleUserJoined}
          onUserLeft={handleUserLeft}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  leaveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    padding: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#e91e63',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  activeTabText: {
    color: 'white',
  },
});

export default ChatRoomScreen; 