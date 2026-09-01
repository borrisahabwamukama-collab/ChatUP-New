import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function LiveStreamScreen({ isDarkMode, coins, setCoins }) {
  // Live Stream & Chat States
  const [streamTitle] = useState('Talk With Nature - Live Wildlife Expedition & Relief Telethon');
  const [streamHost] = useState('Borris');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', author: 'Nimusiima Asifa', text: 'Stunning view of the park today! 🌿' },
    { id: '2', author: 'Stella', text: 'Let us support the community fund!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fundraising & Super-Gift States
  const [fundraisingGoal] = useState(5000);
  const [fundraisingCurrent, setFundraisingCurrent] = useState(1450);
  const [activeGiftBanner, setActiveGiftBanner] = useState('🎉 Live Stream Active: Send gifts to support!');

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), author: 'Borris', text: chatInput }]);
    setChatInput('');
  };

  const handleSendWildlifeGift = (giftName, giftEmoji, giftCost) => {
    if (coins < giftCost) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${giftCost} coins to send a ${giftName} ${giftEmoji}.`);
    }
    // Deduct coins from viewer wallet
    setCoins(c => c - giftCost);
    // Add to fundraising progress
    setFundraisingCurrent(prev => prev + giftCost);
    setActiveGiftBanner(`🎁 ${giftName} ${giftEmoji} sent by you (+${giftCost} Coins)!`);
    Alert.alert('Gift Sent Successfully! 🌟', `You sent a ${giftName} ${giftEmoji} to ${streamHost}'s live stream!`);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
      
      {/* 1. LIVE VIDEO PLAYER CONTAINER */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 0, overflow: 'hidden' }]}>
        <View style={{ backgroundColor: '#000', height: 220, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🎥🦁</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>LIVE BROADCAST STREAM</Text>
          <Text style={{ color: '#a0aec0', fontSize: 11, marginTop: 4 }}>Host: {streamHost} • Queen Elizabeth National Park</Text>
          
          {/* Live Badge Overlay */}
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🔴 LIVE</Text>
          </View>
        </View>

        <View style={{ padding: 12 }}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText, { fontSize: 16, marginBottom: 4 }]}>{streamTitle}</Text>
          
          {/* Live Fundraising Progress Bar */}
          <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#edf2f7', padding: 10, borderRadius: 8, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>❤️ Relief Fund Progress</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#48bb78' }}>🪙 {fundraisingCurrent} / {fundraisingGoal} Coins</Text>
            </View>
            <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#d69e2e', marginTop: 2 }}>{activeGiftBanner}</Text>
          </View>
        </View>
      </View>

      {/* 2. WILDLIFE SUPER-GIFTS TRAY */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 12, borderColor: '#d69e2e', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 13, marginBottom: 8 }]}>🎁 Send Wildlife Super-Gifts (Instant Coin Drop)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' }}
            onPress={() => handleSendWildlifeGift('Cow', '🐄', 100)}
          >
            <Text style={{ fontSize: 20 }}>🐄</Text>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>Cow</Text>
            <Text style={{ color: '#ebf8ff', fontSize: 10 }}>🪙 100</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: '#d69e2e', padding: 10, borderRadius: 8, alignItems: 'center' }}
            onPress={() => handleSendWildlifeGift('Leopard', '🐆', 250)}
          >
            <Text style={{ fontSize: 20 }}>🐆</Text>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>Leopard</Text>
            <Text style={{ color: '#fefcbf', fontSize: 10 }}>🪙 250</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' }}
            onPress={() => handleSendWildlifeGift('Elephant', '🐘', 500)}
          >
            <Text style={{ fontSize: 20 }}>🐘</Text>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>Elephant</Text>
            <Text style={{ color: '#fed7d7', fontSize: 10 }}>🪙 500</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. LIVE STREAM CHAT FEED */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 12 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 13, marginBottom: 8 }]}>💬 Live Community Chat</Text>
        
        <ScrollView style={{ height: 130, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 8, marginBottom: 8 }} nestedScrollEnabled={true}>
          {chatMessages.map(msg => (
            <View key={msg.id} style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{msg.author}</Text>
              <Text style={[{ fontSize: 12 }, isDarkMode && styles.darkText]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={[styles.chatInput, { flex: 1, height: 35, marginRight: 6 }, isDarkMode && styles.darkChatInput]}
            placeholder="Say something nice to the host..."
            placeholderTextColor="#a0aec0"
            value={chatInput}
            onChangeText={setChatInput}
          />
          <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 6 }} onPress={handleSendChatMessage}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  darkText: { color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 40, backgroundColor: '#f7fafc', color: '#2d3748' },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  commentsHeader: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
});