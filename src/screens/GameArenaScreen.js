import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

export default function GameArenaScreen({ coins, setCoins }) {
  const [selectedGame, setSelectedGame] = useState('Matatu'); // 'Matatu' | 'Chess' | 'Draft'
  const [spectatorCount, setSpectatorCount] = useState(14);
  const [chatMessage, setChatMessage] = useState('');
  const [matchMessages, setMatchMessages] = useState([
    { id: '1', user: 'KampalaFan01', text: 'Great defensive move!' },
    { id: '2', user: 'BwindiCheer', text: 'Play the trump card now 🔥' }
  ]);

  const handleSendCheer = () => {
    if (!chatMessage.trim()) return;
    setMatchMessages(prev => [...prev, { id: Date.now().toString(), user: 'You (Spectator)', text: chatMessage.trim() }]);
    setChatMessage('');
  };

  const handleTipPlayer = (amount) => {
    if (coins < amount) {
      Alert.alert('Insufficient Coins', 'Earn more coins through daily activity or wallet top-ups!');
      return;
    }
    setCoins(prev => prev - amount);
    Alert.alert('Tip Sent 🪙', `You successfully tipped ${amount} coins to the reigning table champion!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Game Selector Tabs */}
      <View style={styles.gameTabRow}>
        {['Matatu', 'Chess', 'Draft'].map(game => (
          <TouchableOpacity
            key={game}
            style={[styles.gameTabBtn, selectedGame === game && styles.activeGameTab]}
            onPress={() => setSelectedGame(game)}
          >
            <Text style={[styles.gameTabText, selectedGame === game && styles.activeGameTabText]}>
              {game === 'Matatu' ? '🃏 Matatu' : game === 'Chess' ? '♟️ Chess' : '⚪ Draft'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Live Table / Match Viewport */}
      <View style={styles.boardCard}>
        <View style={styles.liveHeader}>
          <Text style={styles.liveBadge}>🔴 LIVE MATCH ARENA</Text>
          <Text style={styles.spectatorText}>👀 {spectatorCount} Watching</Text>
        </View>

        <Text style={styles.matchTitle}>Table 04: Pro {selectedGame} Championship</Text>
        
        <View style={styles.boardMockup}>
          <Text style={styles.playerTag}>Player A: Borris (Score: 3)</Text>
          <View style={styles.feltTable}>
            <Text style={styles.tableCenterText}>[ Active {selectedGame} Board Grid ]</Text>
          </View>
          <Text style={styles.playerTag}>Player B: Challenger_99 (Score: 2)</Text>
        </View>

        {/* Tipping Section */}
        <View style={styles.tipRow}>
          <Text style={styles.tipLabel}>Cheer with Tips:</Text>
          <TouchableOpacity style={styles.tipBtn} onPress={() => handleTipPlayer(20)}>
            <Text style={styles.tipBtnText}>🪙 Tip 20</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tipBtn} onPress={() => handleTipPlayer(50)}>
            <Text style={styles.tipBtnText}>🔥 Tip 50</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spectator Chat & Cheering Feed */}
      <View style={styles.chatCard}>
        <Text style={styles.chatHeaderTitle}>💬 Sideline Cheer & Chat</Text>
        <ScrollView style={styles.chatScroll} nestedScrollEnabled={true}>
          {matchMessages.map(msg => (
            <View key={msg.id} style={styles.chatMsgRow}>
              <Text style={styles.chatUser}>{msg.user}: </Text>
              <Text style={styles.chatText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Send a cheer or tactical hint..."
            placeholderTextColor="#94a3b8"
            value={chatMessage}
            onChangeText={setChatMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendCheer}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  gameTabRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  gameTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeGameTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeGameTabText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  boardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  spectatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  boardMockup: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  playerTag: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
    marginVertical: 4,
  },
  feltTable: {
    width: '100%',
    height: 120,
    backgroundColor: '#065f46',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  tableCenterText: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '600',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  tipBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tipBtnText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
  },
  chatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  chatScroll: {
    height: 110,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatMsgRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chatUser: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  chatText: {
    fontSize: 11,
    color: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    backgroundColor: '#f8fafc',
    fontSize: 12,
    color: '#0f172a',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});