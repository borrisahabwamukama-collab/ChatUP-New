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

export default function InChatWalletScreen({ isDarkMode, coins, setCoins }) {
  const [chatLog, setChatLog] = useState([
    { id: '1', sender: 'System', text: 'Secure Mobile Money Gateway Connected (MTN / Airtel Uganda API active).' },
    { id: '2', sender: 'Nimusiima Asifa', text: 'Hey Borris, let us split the field trip expenses using /split 45000' }
  ]);
  const [commandInput, setCommandInput] = useState('');

  // Handle native chat commands like /send and /split
  const handleExecuteCommand = () => {
    if (!commandInput.trim()) return;

    const lower = commandInput.trim().toLowerCase();
    const newMsgId = Date.now().toString();

    if (lower.startsWith('/send')) {
      // Format: /send [amount] [recipient]
      const parts = commandInput.split(' ');
      const amount = parseInt(parts[1]) || 5000;
      const recipient = parts[2] || 'Nimusiima';

      if (coins < amount) {
        return Alert.alert('Insufficient Balance', `You do not have enough coins/funds to send 🪙 ${amount}.`);
      }

      setCoins(c => c - amount);
      setChatLog(prev => [
        ...prev,
        { id: newMsgId, sender: 'You', text: `💸 Executed Command: Sent 🪙 ${amount} to ${recipient} via Mobile Money.` }
      ]);
      Alert.alert('Transfer Successful 🚀', `Successfully transferred 🪙 ${amount} to ${recipient}!`);
    } else if (lower.startsWith('/split')) {
      // Format: /split [totalAmount]
      const parts = commandInput.split(' ');
      const total = parseInt(parts[1]) || 30000;
      const splitAmount = Math.round(total / 2);

      setChatLog(prev => [
        ...prev,
        { id: newMsgId, sender: 'You', text: `🧾 Executed Command: Split bill of 🪙 ${total}. Your share requested: 🪙 ${splitAmount}.` }
      ]);
      Alert.alert('Bill Split Created 📊', `Bill of 🪙 ${total} split equally. Request sent to chat members (Share: 🪙 ${splitAmount} each).`);
    } else {
      // Standard chat message
      setChatLog(prev => [
        ...prev,
        { id: newMsgId, sender: 'You', text: commandInput }
      ]);
    }

    setCommandInput('');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>💳 In-Chat Mobile Money & Bill Splitting</Text>
        <Text style={styles.headerSub}>Use commands like <Text style={{fontWeight: 'bold', color: '#3182ce'}}>/send [amount]</Text> or <Text style={{fontWeight: 'bold', color: '#3182ce'}}>/split [total]</Text> directly in chat.</Text>
      </View>

      {/* Wallet Balance Widget */}
      <View style={styles.walletWidget}>
        <View>
          <Text style={styles.walletTitle}>Available Secure Wallet Balance</Text>
          <Text style={styles.walletAmount}>🪙 {coins} Coins / UGX</Text>
        </View>
        <TouchableOpacity style={styles.topUpBtn} onPress={() => { setCoins(c => c + 1000); Alert.alert('Wallet Funded', 'Added 🪙 1,000 test coins to your balance.'); }}>
          <Text style={styles.topUpText}>+ Top Up</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Log Feed */}
      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {chatLog.map(item => (
          <View key={item.id} style={[styles.chatBubble, item.sender === 'You' ? styles.myBubble : styles.theirBubble]}>
            <Text style={styles.bubbleSender}>{item.sender}</Text>
            <Text style={[styles.bubbleText, item.sender === 'You' && { color: '#fff' }]}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Command Input Bar */}
      <View style={[styles.inputBar, isDarkMode && styles.darkHeader]}>
        <TextInput
          style={[styles.inputBox, isDarkMode && styles.darkInput]}
          placeholder="Type message or command (/send 5000 or /split 20000)..."
          placeholderTextColor="#a0aec0"
          value={commandInput}
          onChangeText={setCommandInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleExecuteCommand}>
          <Text style={styles.sendBtnText}>Execute</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  headerSub: { fontSize: 11, color: '#718096' },
  walletWidget: { margin: 16, backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletTitle: { fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' },
  walletAmount: { fontSize: 18, fontWeight: 'bold', color: '#2b6cb0', marginTop: 2 },
  topUpBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  topUpText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  scrollArea: { paddingHorizontal: 16, paddingBottom: 20 },
  chatBubble: { padding: 12, borderRadius: 10, marginBottom: 10, maxWidth: '85%' },
  myBubble: { backgroundColor: '#3182ce', alignSelf: 'flex-end' },
  theirBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e2e8f0' },
  bubbleSender: { fontSize: 10, fontWeight: 'bold', color: '#cbd5e0', marginBottom: 2 },
  bubbleText: { fontSize: 13, color: '#2d3748' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center' },
  inputBox: { flex: 1, height: 40, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, fontSize: 12, color: '#2d3748', marginRight: 8 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendBtn: { backgroundColor: '#3182ce', paddingHorizontal: 14, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});