import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Track } from '../types';
import apiService from '../services/apiService';

interface TrackListProps {
  tracks: Track[];
  currentTab: 'all' | 'uploaded';
  onTrackSelect: (track: Track, playing: boolean, time?: number) => void;
  onTrackDelete: (trackId: number) => void;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTab,
  onTrackSelect,
  onTrackDelete,
}) => {
  const filteredTracks = currentTab === 'all' 
    ? tracks 
    : tracks.filter(track => track.isUploaded);

  const handleTrackPress = (track: Track) => {
    onTrackSelect(track, true);
  };

  const handleDeleteTrack = (trackId: number) => {
    Alert.alert(
      'Delete Track',
      'Are you sure you want to delete this track?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTrack(trackId);
              onTrackDelete(trackId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete track');
            }
          },
        },
      ]
    );
  };

  const renderTrack = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleTrackPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.cover }} style={styles.trackCover} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
        {item.isUploaded && (
          <Text style={styles.uploadedBy}>
            Uploaded by {item.uploadedBy}
          </Text>
        )}
      </View>
      {item.isUploaded && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTrack(item.id)}
        >
          <Icon name="trash" size={16} color="#e91e63" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (filteredTracks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="music" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No tracks available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="music" size={16} color="#666" />
        <Text style={styles.headerText}>Available Tracks</Text>
      </View>
      <FlatList
        data={filteredTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  uploadedBy: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default TrackList; 