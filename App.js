import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import your screens
import GroupListScreen from './src/screens/GroupListScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="GroupList"
        screenOptions={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#007AFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {/* Main screen with all chats and groups */}
        <Stack.Screen 
          name="GroupList" 
          component={GroupListScreen} 
          options={{ 
            title: 'ChatUp',
            headerShown: true // set to false if you want to use custom header in GroupListScreen
          }} 
        />

        {/* Chat screen for 1-on-1 and groups */}
        <Stack.Screen 
          name="ChatScreen" 
          component={ChatScreen} 
          options={({ route }) => ({ 
            title: 'Chat',
            // you can later set title to the user's name: route.params.name
          })} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}