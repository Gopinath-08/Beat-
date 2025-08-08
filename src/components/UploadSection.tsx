import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Track } from '../types';
import apiService from '../services/apiService';
import { isValidAudioFile, isValidFileSize, getFileSizeInMB } from '../utils/audioUtils';

interface UploadSectionProps {
  username: string;
  onTrackUploaded: (track: Track) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ username, onTrackUploaded }) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        copyTo: 'cachesDirectory',
      });

      const file = result[0];
      
      if (!isValidAudioFile(file.name)) {
        Alert.alert('Invalid File', 'Please select a valid audio file (MP3, WAV, OGG, M4A)');
        return;
      }

      if (!isValidFileSize(file.size, 50)) {
        Alert.alert('File Too Large', `File size (${getFileSizeInMB(file.size).toFixed(1)}MB) exceeds the 50MB limit`);
        return;
      }

      setSelectedFile(file);
      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      Alert.alert('Error', 'Please select a file and enter a title');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('song', {
        uri: selectedFile.fileCopyUri || selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);
      formData.append('title', title.trim());
      formData.append('username', username);

      const response = await apiService.uploadSong(formData, title.trim(), username);
      
      // Create a new track object
      const newTrack: Track = {
        id: Date.now(), // Temporary ID
        title: title.trim(),
        artist: 'Unknown Artist',
        url: response.url || '',
        cover: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=🎵',
        isUploaded: true,
        uploadedBy: username,
      };

      onTrackUploaded(newTrack);
      setTitle('');
      setSelectedFile(null);
      Alert.alert('Success', 'Song uploaded successfully! 💕');
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload song. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="cloud-upload-alt" size={16} color="#666" />
        <Text style={styles.headerText}>Upload Your Song</Text>
      </View>

      <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
        <Icon name="music" size={24} color="#e91e63" />
        <Text style={styles.fileButtonText}>
          {selectedFile ? selectedFile.name : 'Choose audio file (MP3, WAV, OGG, M4A)'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Song title"
        value={title}
        onChangeText={setTitle}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.uploadButton, (!selectedFile || !title.trim() || isUploading) && styles.disabledButton]}
        onPress={handleUpload}
        disabled={!selectedFile || !title.trim() || isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Icon name="upload" size={16} color="white" />
            <Text style={styles.uploadButtonText}>Upload Song</Text>
          </>
        )}
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  fileButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#e91e63',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default UploadSection; 