import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Message } from '../types';
import socketService from '../services/socketService';

interface ChatSectionProps {
  username: string;
  room: string;
  messages: Message[];
  onNewMessage: (message: Message) => void;
  onUserJoined: (data: { username: string; userCount: number }) => void;
  onUserLeft: (data: { username: string; userCount: number }) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  username,
  room,
  messages,
  onNewMessage,
  onUserJoined,
  onUserLeft,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Set up socket listeners
    socketService.on('userJoined', onUserJoined);
    socketService.on('userLeft', onUserLeft);
    socketService.on('message', (data: { username: string; message: string }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        username: data.username,
        message: data.message,
        timestamp: new Date(),
        type: data.username === username ? 'own' : 'other',
      };
      onNewMessage(newMessage);
    });

    return () => {
      socketService.off('userJoined');
      socketService.off('userLeft');
      socketService.off('message');
    };
  }, [username, onNewMessage, onUserJoined, onUserLeft]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      socketService.sendMessage(room, inputMessage.trim(), username);
      setInputMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.type === 'own';
    const isSystemMessage = item.type === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
        <View style={[styles.messageBubble, isOwnMessage && styles.ownMessageBubble]}>
          {!isOwnMessage && (
            <Text style={styles.username}>{item.username}</Text>
          )}
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="comments" size={20} color="#e91e63" />
        <Text style={styles.headerText}>Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputMessage.trim() && styles.disabledSendButton]}
          onPress={sendMessage}
          disabled={!inputMessage.trim()}
        >
          <Icon name="paper-plane" size={16} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  ownMessageBubble: {
    backgroundColor: '#e91e63',
  },
  username: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  ownMessageText: {
    color: 'white',
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#e91e63',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#ccc',
  },
});

export default ChatSection; 