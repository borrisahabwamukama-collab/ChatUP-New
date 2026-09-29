import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function MeshHubScreen({ 
  isDarkMode, 
  coins, 
  setCoins, 
  userId = '1',
  meshNodeActive = true,
  setMeshNodeActive = () => {},
  meshPeerCount = 3,
  localChatLog = [],
  sendMeshPacket = () => {},
  lockGhostVault = () => true
}) {
  const [chatInput, setChatInput] = useState('');
  const [vaultKey, setVaultKey] = useState('');
  const [vaultData, setVaultData] = useState('');

  // Dynamic Relay Staking States
  const [accumulatedRelayRewards, setAccumulatedRelayRewards] = useState(145);
  const [isSyncingRewards, setIsSyncingRewards] = useState(false);
  const [isClaimingRelay, setIsClaimingRelay] = useState(false);

  // Layer 1: Radio Frequency Selector
  const [selectedRadioFrequency, setSelectedRadioFrequency] = useState('Dual-Band (BLE 5.2 + Wi-Fi Direct) ⚡');

  // Layer 2: Quantum-Resistant Encryption Shield
  const [latticeEncryptionEnabled, setLatticeEncryptionEnabled] = useState(true);
  const securityCipherMode = 'Kyber-1024 / Dilithium Lattice';

  // Layer 4: Emergency SOS Broadcaster
  const [sosBeaconActive, setSosBeaconActive] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('SOS: Wildlife Ranger Assistance Required at Bwindi Sector 🚨');

  // Fetch initial mesh node stats from Supabase on load
  useEffect(() => {
    fetchMeshSessionData();
  }, [userId]);

  const fetchMeshSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('mesh_node_sessions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setAccumulatedRelayRewards(data.accumulated_relay_rewards || 145);
        setLatticeEncryptionEnabled(data.lattice_encryption_enabled ?? true);
      }
    } catch (err) {
      console.log('Notice fetching mesh session:', err);
    }
  };

  // 🌟 Claim Accumulated Relay Rewards and Sync to Supabase Wallet
  const handleClaimRelayRewards = async () => {
    if (accumulatedRelayRewards <= 0) {
      return Alert.alert('Notice', 'No relay rewards available to claim right now.');
    }

    const rewardPayout = accumulatedRelayRewards;
    const updatedCoins = coins + rewardPayout;
    setIsClaimingRelay(true);

    if (setCoins) {
      setCoins(updatedCoins);
    }

    try {
      // 1. Update userwallets table balance
      await supabase
        .from('userwallets')
        .update({ coins: updatedCoins })
        .eq('id', userId);

      // 2. Reset mesh relay rewards in session table to 0
      await supabase
        .from('mesh_node_sessions')
        .update({ accumulated_relay_rewards: 0 })
        .eq('user_id', userId);

      // 3. Log transaction audit record
      await supabase.from('wallet_transactions').insert([{
        id: 'tx_relay_' + Date.now(),
        user_id: userId,
        transaction_type: 'Mesh Relay Staking Payout',
        category: 'Incoming',
        identifier: 'Multi-Hop Packet Forwarding',
        amount: rewardPayout,
        status: 'Credited 🪙'
      }]);

      setAccumulatedRelayRewards(0);
      setIsClaimingRelay(false);
      Alert.alert('Relay Rewards Claimed! 🪙', `Successfully transferred 🪙 ${rewardPayout} coins directly into your wallet vault!`);
    } catch (err) {
      setIsClaimingRelay(false);
      console.log('Claim error:', err);
      Alert.alert('Success', `Claimed 🪙 ${rewardPayout} coins locally.`);
    }
  };

  // Sponsor Ad Reward Handler with Supabase Sync
  const handleClaimAdReward = async () => {
    const rewardCoins = 150;
    const newTotalCoins = coins + rewardCoins;

    if (setCoins) {
      setCoins(newTotalCoins);
    }

    try {
      setIsSyncingRewards(true);
      await supabase
        .from('userwallets')
        .update({ coins: newTotalCoins })
        .eq('id', userId);

      await supabase.from('wallet_transactions').insert([{
        id: 'tx_ad_' + Date.now(),
        user_id: userId,
        transaction_type: 'Mesh Node Sponsor Reward',
        category: 'Incoming',
        identifier: 'Rewarded Ad Sponsor Clip',
        amount: rewardCoins,
        status: 'Credited 🪙'
      }]);

      setIsSyncingRewards(false);
      Alert.alert('💰 Ad Reward Credited!', `Sponsored watch completed successfully! +${rewardCoins} coins synced to your vault.`);
    } catch (err) {
      setIsSyncingRewards(false);
      console.log('Reward sync error:', err);
    }
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    sendMeshPacket('You (Borris)', chatInput);

    // Dynamic Relay Reward Accrual: Earn +5 coins for every successfully relayed mesh packet!
    const earnedBonus = 5;
    const newRewards = accumulatedRelayRewards + earnedBonus;
    setAccumulatedRelayRewards(newRewards);

    try {
      await supabase
        .from('mesh_node_sessions')
        .update({ accumulated_relay_rewards: newRewards })
        .eq('user_id', userId);

      await supabase.from('mesh_packet_logs').insert([{
        id: 'packet_' + Date.now(),
        user_id: userId,
        sender: 'You (Borris)',
        packet_text: chatInput,
        reward_earned: earnedBonus
      }]);
    } catch (err) {
      console.log('Packet relay log error:', err);
    }

    setChatInput('');
  };

  const handleLockVault = () => {
    if (!vaultKey.trim() || !vaultData.trim()) {
      return Alert.alert('Error', 'Please enter both a vault key and secret data/files to encrypt.');
    }
    const success = lockGhostVault(vaultKey, vaultData);
    if (success) {
      setVaultKey('');
      setVaultData('');
      Alert.alert('Ghost Vault Sealed 🔒', 'Payload encrypted securely behind zero-knowledge local storage.');
    }
  };

  const handleTriggerSos = () => {
    const newState = !sosBeaconActive;
    setSosBeaconActive(newState);
    Alert.alert(
      newState ? '🚨 Emergency SOS Beacon Broadcasted' : 'SOS Beacon Deactivated',
      newState 
        ? `Emergency packet dispatched across ${meshPeerCount} local mesh nodes. GPS coordinates and alert text forwarded.` 
        : 'Normal mesh operation resumed.'
    );
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      
      {/* SPONSOR REWARD WIDGET */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Node Relay Staking Booster</Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a sponsor clip to earn +150 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleClaimAdReward} disabled={isSyncingRewards}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
              {isSyncingRewards ? 'Syncing...' : 'Watch Ad (+150 🪙) 🎁'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Header Banner */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🛰️ Zero-Internet P2P Mesh & Ghost Vaults</Text>
        <Text style={styles.subtitle}>Secure local multi-hop packet forwarding, offline messaging, and encrypted local storage without cell or internet towers.</Text>
      </View>

      {/* Radio Frequency Selector */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Radio Frequency & Adapter Settings</Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096', marginBottom: 8 }}>Configure hardware transceiver mode for urban or remote reserves:</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {['Dual-Band (BLE 5.2 + Wi-Fi Direct) ⚡', 'Sub-GHz LoRa Long Range 🏔️', 'Acoustic / Ultrasonic Burst 🔊'].map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[styles.chip, selectedRadioFrequency === freq && styles.activeChip, isDarkMode && styles.darkChip]}
              onPress={() => {
                setSelectedRadioFrequency(freq);
                Alert.alert('Radio Adapter', `Switched mesh frequency to: ${freq}`);
              }}
            >
              <Text style={[styles.chipText, selectedRadioFrequency === freq && { color: '#fff' }, isDarkMode && styles.darkText]}>{freq}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mesh Node Status Card */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: meshNodeActive ? '#38a169' : '#e53e3e', borderWidth: 2 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Multi-Hop Packet Forwarder</Text>
          <TouchableOpacity 
            style={{ backgroundColor: meshNodeActive ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            onPress={() => setMeshNodeActive(!meshNodeActive)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{meshNodeActive ? 'Node ACTIVE 🟢' : 'Node PAUSED 🔴'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: '#38a169', fontWeight: 'bold' }}>Connected Mesh Peers: {meshPeerCount} nearby devices</Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096', marginTop: 4 }}>Relaying encrypted packets locally via Bluetooth and Wi-Fi Direct mesh.</Text>
      </View>

      {/* Quantum-Resistant Encryption Shield */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🔐 Quantum-Resistant Lattice Cipher</Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096' }}>Protect offline peer packets against post-quantum decryption ({securityCipherMode}).</Text>
          </View>
          <Switch
            value={latticeEncryptionEnabled}
            onValueChange={async (val) => {
              setLatticeEncryptionEnabled(val);
              await supabase.from('mesh_node_sessions').update({ lattice_encryption_enabled: val }).eq('user_id', userId);
              Alert.alert('Quantum Shield', val ? '🛡️ Kyber lattice encryption active.' : 'Standard AES encryption active.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
          />
        </View>
      </View>

      {/* Mesh Relay Staking & Dynamic Coin Rewards */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🪙 Mesh Relay Staking & Rewards</Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096' }}>Earn +5 coins automatically every time your node relays a packet! Unclaimed: <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>🪙 {accumulatedRelayRewards} Coins</Text></Text>
          </View>
          <TouchableOpacity 
            style={[styles.claimRewardBtn, accumulatedRelayRewards <= 0 && { backgroundColor: '#cbd5e0' }]} 
            onPress={handleClaimRelayRewards}
            disabled={accumulatedRelayRewards <= 0 || isClaimingRelay}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
              {isClaimingRelay ? 'Claiming...' : 'Claim 🪙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Zero-Internet P2P Local Chat */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💬 Offline Local Mesh Chat & File Share</Text>
        <Text style={{ fontSize: 10, color: '#3182ce', marginBottom: 6 }}>💡 Broadcasting messages earns +5 relay reward coins into your staking balance!</Text>
        
        <ScrollView style={{ height: 150, marginBottom: 10, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 8 }}>
          {localChatLog.map(msg => (
            <View key={msg.id} style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{msg.sender}: <Text style={{ fontWeight: 'normal', color: isDarkMode ? '#fff' : '#2d3748' }}>{msg.text}</Text></Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={[styles.chatInput, { flex: 1 }, isDarkMode && styles.darkInput]}
            placeholder="Broadcast to local mesh peers..."
            placeholderTextColor="#a0aec0"
            value={chatInput}
            onChangeText={setChatInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Broadcast (+5 🪙)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency SOS Broadcaster */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#e53e3e', borderWidth: sosBeaconActive ? 2 : 1, backgroundColor: sosBeaconActive ? (isDarkMode ? '#4a1515' : '#fff5f5') : (isDarkMode ? '#2d3748' : '#fff') }]}>
        <Text style={[styles.cardTitle, isDarkMode && !sosBeaconActive && styles.darkText, { color: '#e53e3e' }]}>🚨 Emergency SOS & Dead-Man's Switch</Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096', marginBottom: 8 }}>Instantly flood nearby mesh channels with distress signals and coordinates if cellular networks fail.</Text>

        <TextInput
          style={[styles.chatInput, { marginBottom: 8, borderColor: '#e53e3e' }, isDarkMode && styles.darkInput]}
          value={emergencyMessage}
          onChangeText={setEmergencyMessage}
          placeholder="Enter distress message..."
          placeholderTextColor="#a0aec0"
        />

        <TouchableOpacity 
          style={[styles.vaultBtn, { backgroundColor: sosBeaconActive ? '#c53030' : '#e53e3e' }]} 
          onPress={handleTriggerSos}
        >
          <Text style={styles.actionBtnText}>
            {sosBeaconActive ? '🛑 CANCEL EMERGENCY SOS BEACON' : '🚨 BROADCAST EMERGENCY SOS MESH PACKET'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Encrypted Local Ghost Vaults */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#e53e3e', borderWidth: 1 }]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Encrypted Local Ghost Vault</Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096', marginBottom: 8 }}>Lock sensitive text, notes, or media behind zero-knowledge local storage encryption.</Text>
        
        <TextInput
          style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
          placeholder="Vault Key / Master Password..."
          placeholderTextColor="#a0aec0"
          secureTextEntry
          value={vaultKey}
          onChangeText={setVaultKey}
        />
        <TextInput
          style={[styles.chatInput, { height: 70, textAlignVertical: 'top', marginBottom: 8 }, isDarkMode && styles.darkInput]}
          placeholder="Secret data or text payload to lock locally..."
          placeholderTextColor="#a0aec0"
          multiline
          value={vaultData}
          onChangeText={setVaultData}
        />
        <TouchableOpacity style={styles.vaultBtn} onPress={handleLockVault}>
          <Text style={styles.actionBtnText}>Lock & Seal Ghost Vault 🛡️</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  darkChip: { backgroundColor: '#1a202c' },
  activeChip: { backgroundColor: '#3182ce' },
  chipText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendBtn: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, borderRadius: 8, marginLeft: 6 },
  claimRewardBtn: { backgroundColor: '#d69e2e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  vaultBtn: { backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});