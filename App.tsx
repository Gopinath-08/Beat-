import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import socketService from './src/services/socketService';

export type RootStackParamList = {
  Welcome: undefined;
  ChatRoom: { username: string; room: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();
    
    socketService.on('connect', () => {
      setIsConnected(true);
    });

    socketService.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App; 