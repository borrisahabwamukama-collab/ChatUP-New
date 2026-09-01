import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const MOCK_GROUPS = [
  { id: '1', name: 'Kampala Sunday Prayer Cell', avatar: '🙏', lastMessage: 'Let us remember to pray for the upcoming outreach.', time: '10:45 AM', unread: 3, isPining: true },
  { id: '2', name: 'ChatUp Dev Team', avatar: '💻', lastMessage: 'Supabase table policies updated successfully.', time: '9:12 AM', unread: 0, isPining: false },
  { id: '3', name: 'Worship & Media Hub', avatar: '🎥', lastMessage: 'Camera angles for Sunday service are set.', time: 'Yesterday', unread: 1, isPining: false },
];

export default function GroupListScreen({ navigation }) {
  const [chats, setChats] = useState(MOCK_GROUPS);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChurchLiveScreen')}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroupScreen')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  time: {
    fontSize: 12,
    color: 'gray',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    fontSize: 14,
    color: 'gray',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 76,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },
});