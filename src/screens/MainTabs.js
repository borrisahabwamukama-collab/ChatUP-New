import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { supabase } from '../Services/supabaseClient';
import ChatListScreen from '../screens/ChatListScreen';
import FindUsersScreen from '../screens/FindUsersScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs({ route }) {
  const currentUser = route?.params?.currentUser;
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const myIdOrEmail = currentUser?.id || currentUser?.email;

  // Listen for unread messages globally to update the Messages tab badge count
  useEffect(() => {
    if (!myIdOrEmail) return;

    const fetchInitialUnread = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', myIdOrEmail);

      if (!error && count !== null) {
        setTotalUnreadCount(count);
      }
    };

    fetchInitialUnread();

    const globalUnreadChannel = supabase
      .channel('global_chatup_unread_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id !== myIdOrEmail) {
            setTotalUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalUnreadChannel);
    };
  }, [myIdOrEmail]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3182ce',
        tabBarInactiveTintColor: '#a0aec0',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 4,
          height: 58,
        },
      }}
    >
      <Tab.Screen 
        name="ChatsTab" 
        component={ChatListScreen}
        initialParams={{ currentUser }}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="FindUsersTab" 
        component={FindUsersScreen}
        initialParams={{ currentUser }}
        options={{
          tabBarLabel: 'Find Users',
          // Strictly clean: No unread badges or notification distractions here
          tabBarBadge: undefined, 
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🔍</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}