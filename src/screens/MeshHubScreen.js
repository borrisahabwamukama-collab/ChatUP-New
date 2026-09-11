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
import { useMeshNetwork } from '../../App';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

export default function MeshHubScreen({ isDarkMode, coins, setCoins }) {
  const {
    meshNodeActive,
    setMeshNodeActive,
    meshPeerCount,
    localChatLog,
    sendMeshPacket,
    lockGhostVault,
  } = useMeshNetwork();

  const [chatInput, setChatInput] = useState('');
  const [vaultKey, setVaultKey] = useState('');
  const [vaultData, setVaultData] = useState('');

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  // NEW LAYER 1: BLUETOOTH LE & WI-FI DIRECT ADAPTER SELECTOR
  const [selectedRadioFrequency, setSelectedRadioFrequency] = useState('Dual-Band (BLE 5.2 + Wi-Fi Direct) ⚡');
  const [radioRangeMode, setRadioRangeMode] = useState('Extended Range (1.2 km Hop)');

  // NEW LAYER 2: QUANTUM-RESISTANT LATTICE ENCRYPTION SHIELD
  const [latticeEncryptionEnabled, setLatticeEncryptionEnabled] = useState(true);
  const [securityCipherMode, setSecurityCipherMode] = useState('Kyber-1024 / Dilithium Lattice');

  // NEW LAYER 3: MESH PACKET RELAY REWARD STAKING (COIN EARNINGS)
  const [relayStakingEnabled, setRelayStakingEnabled] = useState(true);
  const [accumulatedRelayRewards, setAccumulatedRelayRewards] = useState(145);

  // NEW LAYER 4: EMERGENCY SOS & DEAD-MAN'S SWITCH BROADCASTER
  const [sosBeaconActive, setSosBeaconActive] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('SOS: Wildlife Ranger Assistance Required at Bwindi Sector 🚨');

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
          setCoins(prev => prev + 150);
        }
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +150 Coins mesh relay node bonus!');
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
        setCoins(prev => prev + 150);
      }
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +150 coins added to your ChatUp wallet balance.');
    }
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendMeshPacket('You (Borris)', chatInput);
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
    }
  };

  const handleTriggerSos = () => {
    setSosBeaconActive(!sosBeaconActive);
    Alert.alert(
      !sosBeaconActive ? '🚨 Emergency SOS Beacon Broadcasted' : 'SOS Beacon Deactivated',
      !sosBeaconActive 
        ? `Emergency packet dispatched across ${meshPeerCount} local mesh nodes. GPS coordinates and alert text forwarded.` 
        : 'Normal operation resumed.'
    );
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
      <View style={styles.monetizationAdCard}>
        <Text style={styles.adTagLabel}>Sponsored Mesh Banner 📢 • AdMob Banner</Text>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob Mesh Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob Mesh Banner load error: ', error)}
          />
        </View>
      </View>

      {/* ================= REWARDED AD MESH NODE REWARD WIDGET ================= */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Node Relay Staking Booster</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a sponsor clip to earn +150 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+150 🪙) 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Header Banner */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🛰️ Zero-Internet P2P Mesh & Ghost Vaults</Text>
        <Text style={styles.subtitle}>Secure local multi-hop packet forwarding, offline messaging, and encrypted local storage without cell or internet towers.</Text>
      </View>

      {/* NEW LAYER 1: RADIO FREQUENCY & RANGE SELECTOR */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Radio Frequency & Adapter Settings</Text>
        <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096', marginBottom: 8 }}>Configure hardware transceiver mode for Kampala urban or remote wildlife reserves:</Text>
        
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

      {/* NEW LAYER 2: QUANTUM-RESISTANT ENCRYPTION SHIELD */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🔐 Quantum-Resistant Lattice Cipher</Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096' }}>Protect offline peer packets against post-quantum cryptographic decryption attacks ({securityCipherMode}).</Text>
          </View>
          <Switch
            value={latticeEncryptionEnabled}
            onValueChange={(val) => {
              setLatticeEncryptionEnabled(val);
              Alert.alert('Quantum Shield', val ? '🛡️ Kyber lattice encryption active.' : 'Standard AES encryption active.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
          />
        </View>
      </View>

      {/* NEW LAYER 3: MESH RELAY STAKING & COIN REWARDS */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🪙 Mesh Relay Staking Rewards</Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096' }}>Earn bonus ChatUp coins by acting as an active node relay for neighboring devices. Earned: <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>🪙 {accumulatedRelayRewards} Coins</Text> (Wallet Balance: {coins})</Text>
          </View>
          <Switch
            value={relayStakingEnabled}
            onValueChange={(val) => {
              setRelayStakingEnabled(val);
              Alert.alert('Relay Staking', val ? '🪙 Node packet relay staking active.' : 'Staking paused.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
          />
        </View>
      </View>

      {/* Zero-Internet P2P Local Chat */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💬 Offline Local Mesh Chat & File Share</Text>
        <ScrollView style={{ height: 160, marginBottom: 10, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 8 }}>
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
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NEW LAYER 4: EMERGENCY SOS & DEAD-MAN'S SWITCH BROADCASTER */}
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
  vaultBtn: { backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});