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

export default function WalletScreen({ isDarkMode, coins, setCoins }) {
  // Wallet & Withdrawal States
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Mobile Money (MTN / Airtel)');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversion rate: 10 Coins = 1,000 UGX (Example local creator payout rate)
  const coinToCashRate = 100; // UGX per coin
  const totalCashValue = coins * coinToCashRate;

  const handleRequestWithdrawal = () => {
    const amountToWithdraw = parseInt(withdrawalAmount);
    
    if (!amountToWithdraw || amountToWithdraw <= 0) {
      return Alert.alert('Error', 'Please enter a valid coin amount to withdraw.');
    }
    if (amountToWithdraw > coins) {
      return Alert.alert('Insufficient Balance', `You only have 🪙 ${coins} coins available in your wallet.`);
    }
    if (!accountNumber.trim()) {
      return Alert.alert('Error', 'Please enter your mobile money number or bank account details.');
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Deduct coins from wallet balance
      setCoins(c => c - amountToWithdraw);
      setWithdrawalAmount('');
      setAccountNumber('');
      Alert.alert(
        'Withdrawal Requested Successfully! 💸', 
        `Your payout request for 🪙 ${amountToWithdraw} coins (Approx. ${totalCashValue.toLocaleString()} UGX) via ${payoutMethod} has been submitted for admin approval.`
      );
    }, 1000);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
      
      {/* 1. CREATOR EARNINGS BALANCE CARD */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 20, borderColor: '#48bb78', borderWidth: 2, alignItems: 'center' }]}>
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>TOTAL AVAILABLE WALLET BALANCE</Text>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#48bb78', marginBottom: 6 }}>🪙 {coins} Coins</Text>
        <Text style={{ fontSize: 14, color: isDarkMode ? '#a0aec0' : '#4a5568', fontWeight: 'bold' }}>
          Estimated Value: ≈ {totalCashValue.toLocaleString()} UGX
        </Text>
      </View>

      {/* 2. WITHDRAWAL REQUEST FORM */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>💸 Request Coin Withdrawal & Payout</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>Convert your earned coins from tipping, tickets, and wildlife gifts into real-world funds:</Text>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Coins to Withdraw:</Text>
        <TextInput
          style={[styles.chatInput, { marginBottom: 10 }, isDarkMode && styles.darkChatInput]}
          placeholder="Enter coin amount (e.g. 500)..."
          placeholderTextColor="#a0aec0"
          keyboardType="numeric"
          value={withdrawalAmount}
          onChangeText={setWithdrawalAmount}
        />

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Payout Method:</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['Mobile Money (MTN / Airtel)', 'Bank Transfer'].map((method) => (
            <TouchableOpacity
              key={method}
              style={{ flex: 1, backgroundColor: payoutMethod === method ? '#3182ce' : '#cbd5e0', padding: 8, borderRadius: 6, marginRight: 4, alignItems: 'center' }}
              onPress={() => setPayoutMethod(method)}
            >
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{method}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Mobile Money / Account Number:</Text>
        <TextInput
          style={[styles.chatInput, { marginBottom: 15 }, isDarkMode && styles.darkChatInput]}
          placeholder="e.g. +256 700 000000 or Account No..."
          placeholderTextColor="#a0aec0"
          value={accountNumber}
          onChangeText={setAccountNumber}
        />

        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: '#48bb78', paddingVertical: 12 }]} 
          onPress={handleRequestWithdrawal}
          disabled={isProcessing}
        >
          <Text style={styles.sendButtonText}>
            {isProcessing ? 'Processing Payout Request...' : 'Request Payout 🚀'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. RECENT PAYOUT HISTORY */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 13, marginBottom: 8 }]}>📜 Recent Payout Transactions</Text>
        
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>Mobile Money (MTN)</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>24 Aug 2026 • +256 770******</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#48bb78' }}>-🪙 1,000 Coins</Text>
            <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>Completed ✅</Text>
          </View>
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
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, paddingHorizontal: 15, height: 40, backgroundColor: '#f7fafc', color: '#2d3748' },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  commentsHeader: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
});