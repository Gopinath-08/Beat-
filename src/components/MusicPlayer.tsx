import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanGestureHandler,
  State,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Track } from '../types';
import { formatTime, calculateProgress } from '../utils/audioUtils';

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: (playing: boolean, time: number) => void;
}

const { width } = Dimensions.get('window');

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  onPlayPause,
}) => {
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentTrack) {
      // Simulate duration for demo - in real app, get from audio metadata
      setDuration(180); // 3 minutes default
    } else {
      setDuration(0);
      setProgress(0);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (duration > 0) {
      setProgress(calculateProgress(currentTime, duration));
    }
  }, [currentTime, duration]);

  const handlePlayPause = () => {
    if (currentTrack) {
      onPlayPause(!isPlaying, currentTime);
    }
  };

  const handleProgressPress = (event: any) => {
    if (!currentTrack || duration === 0) return;
    
    const { locationX } = event.nativeEvent;
    const progressBarWidth = width - 60; // Approximate width
    const newProgress = (locationX / progressBarWidth) * 100;
    const newTime = (newProgress / 100) * duration;
    
    onPlayPause(isPlaying, newTime);
  };

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>
          {currentTrack?.title || 'No track playing'}
        </Text>
        <Text style={styles.trackArtist}>
          {currentTrack?.artist || 'Select a track to start'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, !currentTrack && styles.disabledButton]}
          onPress={handlePlayPause}
          disabled={!currentTrack}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={currentTrack ? 'white' : '#ccc'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <TouchableOpacity
          style={styles.progressBar}
          onPress={handleProgressPress}
          activeOpacity={0.8}
        >
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </TouchableOpacity>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trackInfo: {
    marginBottom: 15,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 15,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e91e63',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e91e63',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    marginBottom: 10,
  },
  progressBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e91e63',
    borderRadius: 4,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MusicPlayer; 