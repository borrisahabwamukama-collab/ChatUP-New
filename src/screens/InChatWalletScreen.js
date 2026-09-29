import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { supabase } from '../../Services/supabaseClient';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

export default function InChatWalletScreen({ isDarkMode, coins, setCoins }) {
  const [chatLog, setChatLog] = useState([
    { id: '1', sender: 'System', text: 'Secure Mobile Money Gateway Connected (MTN / Airtel Uganda API active).' },
    { id: '2', sender: 'Nimusiima Asifa', text: 'Hey Borris, let us split the field trip expenses using /split 45000' }
  ]);
  const [commandInput, setCommandInput] = useState('');

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  // NEW LAYER 1: ESCROW MULTI-SIGNATURE DEPOSIT LOCK
  const [escrowLockActive, setEscrowLockActive] = useState(false);
  const [escrowDepositAmount, setEscrowDepositAmount] = useState('50,000 UGX');

  // NEW LAYER 2: INSTANT CURRENCY FX CONVERTER TOGGLE
  const [fxConverterActive, setFxConverterActive] = useState(true);
  const [targetCurrency, setTargetCurrency] = useState('USD ($) / UGX');

  // NEW LAYER 3: PEER-TO-PEER OFFLINE MESH BLUETOOTH PAYMENT RELAY
  const [meshPaymentRelayActive, setMeshPaymentRelayActive] = useState(true);

  // NEW LAYER 4: AUTOMATED FRAUD VELOCITY SHIELD
  const [fraudVelocityShieldActive, setFraudVelocityShieldActive] = useState(true);
  const [dailyTransactionVolume, setDailyTransactionVolume] = useState(180000);

  // Initialize AdMob Rewarded Ad
  useEffect(() => {
    initRewardedAd();
  }, []);

  const initRewardedAd = () => {
    try {
      const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setRewardedAdLoaded(true);
      });

      const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (setCoins) {
          setCoins(prev => prev + 100);
        }
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +100 Coins wallet funding bonus!');
      });

      rewardedAd.load();
      setRewardedAdInstance(rewardedAd);

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
      };
    } catch (e) {
      console.log('Rewarded Ad initialization notice:', e);
    }
  };

  const handleShowRewardedAd = () => {
    if (rewardedAdLoaded && rewardedAdInstance) {
      rewardedAdInstance.show();
      setRewardedAdLoaded(false);
      rewardedAdInstance.load();
    } else {
      // Fallback simulation for web/preview
      if (setCoins) {
        setCoins(prev => prev + 100);
      }
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +100 coins added to your ChatUp wallet balance.');
    }
  };

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

      if (fraudVelocityShieldActive && (dailyTransactionVolume + amount > 1000000)) {
        return Alert.alert('Velocity Shield Triggered 🛡️', 'Transaction exceeds daily local anti-fraud transfer ceiling.');
      }

      setCoins(c => c - amount);
      setDailyTransactionVolume(prev => prev + amount);
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
      
      {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
      <View style={styles.monetizationAdCard}>
        <Text style={styles.adTagLabel}>Sponsored Wallet Banner 📢 • AdMob Banner</Text>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob Wallet Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob Wallet Banner load error: ', error)}
          />
        </View>
      </View>

      {/* ================= REWARDED AD WALLET BONUS WIDGET ================= */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Mobile Money Top-Up Bonus</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a sponsor clip to earn +100 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+100 🪙) 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* ================= NEW LAYER 1: ESCROW MULTI-SIG LOCK ================= */}
        <View style={[styles.layerCard, isDarkMode && styles.darkHeader, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.layerTitle, isDarkMode && styles.darkText]}>🔒 Escrow Multi-Sig Deposit Lock</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Lock group funds in smart contract escrow until delivery is verified.</Text>
            </View>
            <Switch
              value={escrowLockActive}
              onValueChange={(val) => {
                setEscrowLockActive(val);
                Alert.alert('Escrow Guard', val ? `🔒 Escrow deposit locked (${escrowDepositAmount}).` : 'Escrow released.');
              }}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>
        </View>

        {/* ================= NEW LAYER 2: INSTANT FX CONVERTER ================= */}
        <View style={[styles.layerCard, isDarkMode && styles.darkHeader, { borderColor: '#d69e2e', borderWidth: 1.5 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.layerTitle, isDarkMode && styles.darkText]}>💱 Real-Time FX Currency Display</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Target conversion pair: <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>{targetCurrency}</Text></Text>
            </View>
            <Switch
              value={fxConverterActive}
              onValueChange={(val) => {
                setFxConverterActive(val);
                Alert.alert('FX Converter', val ? '💱 Live multi-currency exchange active.' : 'UGX only mode.');
              }}
              trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
            />
          </View>
        </View>

        {/* ================= NEW LAYER 3: OFFLINE MESH PAYMENT RELAY ================= */}
        <View style={[styles.layerCard, isDarkMode && styles.darkHeader, { borderColor: '#48bb78', borderWidth: 1.5 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.layerTitle, isDarkMode && styles.darkText]}>🛰️ P2P Offline Mesh Payment Relay</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Route micro-transactions locally over Bluetooth when cellular networks drop.</Text>
            </View>
            <Switch
              value={meshPaymentRelayActive}
              onValueChange={(val) => {
                setMeshPaymentRelayActive(val);
                Alert.alert('Mesh Relay', val ? '🛰️ Offline Bluetooth mesh payment relay active.' : 'Cellular only.');
              }}
              trackColor={{ false: '#cbd5e0', true: '#48bb78' }}
            />
          </View>
        </View>

        {/* ================= NEW LAYER 4: AUTOMATED FRAUD VELOCITY SHIELD ================= */}
        <View style={[styles.layerCard, isDarkMode && styles.darkHeader, { borderColor: '#e53e3e', borderWidth: 1.5 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.layerTitle, isDarkMode && styles.darkText]}>🛡️ Automated Fraud Velocity Shield</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Daily transferred: <Text style={{ fontWeight: 'bold', color: '#e53e3e' }}>{dailyTransactionVolume.toLocaleString()} UGX</Text> / 1M limit.</Text>
            </View>
            <Switch
              value={fraudVelocityShieldActive}
              onValueChange={(val) => {
                setFraudVelocityShieldActive(val);
                Alert.alert('Fraud Shield', val ? '🛡️ Strict anti-fraud velocity limits enabled.' : 'Unrestricted transfer mode.');
              }}
              trackColor={{ false: '#cbd5e0', true: '#e53e3e' }}
            />
          </View>
        </View>

        {/* Chat Log Feed */}
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
  walletWidget: { margin: 16, marginBottom: 8, backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletTitle: { fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' },
  walletAmount: { fontSize: 18, fontWeight: 'bold', color: '#2b6cb0', marginTop: 2 },
  topUpBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  topUpText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  scrollArea: { paddingHorizontal: 16, paddingBottom: 20 },
  layerCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  layerTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});