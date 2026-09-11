import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Modal,
  Platform,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameArenaScreen({ coins, setCoins, isDarkMode }) {
  // Game Arena Modes & State
  const [selectedGame, setSelectedGame] = useState('Matatu'); // 'Matatu' | 'Chess' | 'Draft'
  const [spectatorCount, setSpectatorCount] = useState(1420);
  const [chatMessage, setChatMessage] = useState('');
  
  // Match & Live Board States
  const [playerOneScore, setPlayerOneScore] = useState(3);
  const [playerTwoScore, setPlayerTwoScore] = useState(2);
  const [isMatchActive, setIsMatchActive] = useState(true);
  const [winnerDeclared, setWinnerDeclared] = useState(null);

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  // Sideline Sidemenu / Chat Feeds
  const [matchMessages, setMatchMessages] = useState([
    { id: '1', user: 'Nimusiima Asifa', text: 'Stunning tactical play at Table 04! 🔥' },
    { id: '2', user: 'Stella', text: 'Play the trump card now! 🃏' },
    { id: '3', user: 'Brian_UG', text: 'Tournament bracket is heating up.' }
  ]);

  // Pro Features & Security States
  const [fairnessHashActive, setFairnessHashActive] = useState(true);
  const [tableHashId] = useState('0x8f2b77cde41182 (SHA-256 Verified 🔒)');
  const [eloMultiplierActive, setEloMultiplierActive] = useState(true);
  const [playerEloRating] = useState('1850 Grandmaster Tier (Rank #4)');
  const [spectatorWagerActive, setSpectatorWagerActive] = useState(false);
  const [spectatorPoolTotal, setSpectatorPoolTotal] = useState(4850);
  const [sponsorBannerActive, setSponsorBannerActive] = useState(true);
  const [sponsorName] = useState('Talk With Nature Wildlife Foundation 🦁');
  const [meshTournamentSync, setMeshTournamentSync] = useState(true);
  const [antiCollusionGuardActive, setAntiCollusionGuardActive] = useState(true);
  const [voiceTauntsActive, setVoiceTauntsActive] = useState(true);

  // Modals & Popups
  const [showWagerModal, setShowWagerModal] = useState(false);
  const [wagerStakeAmount, setWagerStakeAmount] = useState(100);

  // Camera Stream Reference for Web / Mobile
  const webcamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);

  // Initialize Web Camera Stream & AdMob Rewarded Ad
  useEffect(() => {
    let mediaStream = null;
    if (Platform.OS === 'web' && cameraActive) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((stream) => {
          mediaStream = stream;
          if (webcamRef.current) {
            webcamRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    initRewardedAd();
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const initRewardedAd = () => {
    try {
      const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setRewardedAdLoaded(true);
      });

      const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        setCoins(prev => prev + 50);
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +50 Coins tournament bounty!');
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
      setCoins(prev => prev + 50);
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +50 coins added to your ChatUp wallet balance.');
    }
  };

  // Interactive Game Action Handler (Dynamic Board Simulation)
  const handleGameAction = (actionType) => {
    if (!isMatchActive) return Alert.alert('Match Ended', 'This table session has concluded.');

    if (selectedGame === 'Matatu') {
      if (actionType === 'card') {
        setPlayerOneScore(prev => prev + 1);
        setMatchMessages(prev => [
          ...prev, 
          { id: Date.now().toString(), user: 'Table Referee 🃏', text: 'Borris successfully played a matching Trump Card!' }
        ]);
        Alert.alert('Trump Played! 🃏', '+1 Point secured on the felt table!');
      } else if (actionType === 'draw') {
        setMatchMessages(prev => [
          ...prev,
          { id: Date.now().toString(), user: 'Table Referee 🃏', text: 'Borris drew a card from the deck.' }
        ]);
        Alert.alert('Card Drawn 🎴', 'You drew from the deck.');
      }
    } else if (selectedGame === 'Chess') {
      if (actionType === 'move') {
        setPlayerOneScore(prev => prev + 2);
        setMatchMessages(prev => [
          ...prev, 
          { id: Date.now().toString(), user: 'Chess Engine ♟️', text: 'Brilliant knight fork executed by Borris!' }
        ]);
        Alert.alert('Tactical Move! ♟️', 'Piece repositioned successfully. Advantage Borris.');
      }
    } else if (selectedGame === 'Draft') {
      if (actionType === 'jump') {
        setPlayerOneScore(prev => prev + 3);
        setMatchMessages(prev => [
          ...prev, 
          { id: Date.now().toString(), user: 'Draft Master ⚪', text: 'Multi-jump captured by Borris!' }
        ]);
        Alert.alert('King Crowned! 👑', 'Opponent piece captured!');
      }
    }
  };

  const handleSendCheer = () => {
    if (!chatMessage.trim()) return;
    setMatchMessages(prev => [...prev, { id: Date.now().toString(), user: 'You (VIP Spectator)', text: chatMessage.trim() }]);
    setChatMessage('');
  };

  const handleTipPlayer = (amount) => {
    if (coins < amount) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${amount} coins. Your balance is 🪙 ${coins}.`);
    }
    setCoins(prev => prev - amount);
    setMatchMessages(prev => [
      ...prev,
      { id: Date.now().toString(), user: 'Tip Alert 🪙', text: `You tipped 🪙 ${amount} coins to the table champion!` }
    ]);
    Alert.alert('Tip Sent Successfully! 🌟', `Successfully tipped 🪙 ${amount} coins!`);
  };

  const handlePlaceWager = () => {
    if (coins < wagerStakeAmount) {
      return Alert.alert('Insufficient Coins', 'Earn more coins through daily activities or wallet top-ups.');
    }
    setCoins(prev => prev - wagerStakeAmount);
    setSpectatorPoolTotal(prev => prev + wagerStakeAmount);
    setShowWagerModal(false);
    Alert.alert('Wager Locked! 🪙', `Successfully staked 🪙 ${wagerStakeAmount} coins into the spectator pool.`);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
      <View style={styles.monetizationAdCard}>
        <Text style={styles.adTagLabel}>Sponsored Arena Banner 📢 • AdMob Banner</Text>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob Arena Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob Arena Banner load error: ', error)}
          />
        </View>
      </View>

      {/* ================= REWARDED AD TOURNAMENT BONUS WIDGET ================= */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Tournament Spectator Rewards</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a sponsor clip to earn +50 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+50 Coins) 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 1. TOURNAMENT SPONSORSHIP BANNER ================= */}
      {sponsorBannerActive && (
        <View style={[styles.sponsorBanner, isDarkMode && styles.darkCard]}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#b7791f' }}>🌟 OFFICIAL TOURNAMENT SPONSORSHIP</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fefcbf' : '#2d3748', marginTop: 2 }}>{sponsorName}</Text>
        </View>
      )}

      {/* ================= 2. GAME SELECTOR TABS ================= */}
      <View style={[styles.gameTabRow, isDarkMode && styles.darkCard]}>
        {['Matatu', 'Chess', 'Draft'].map(game => (
          <TouchableOpacity
            key={game}
            style={[styles.gameTabBtn, selectedGame === game && styles.activeGameTab, isDarkMode && selectedGame === game && { backgroundColor: '#334155' }]}
            onPress={() => setSelectedGame(game)}
          >
            <Text style={[styles.gameTabText, selectedGame === game && styles.activeGameTabText, isDarkMode && styles.darkText]}>
              {game === 'Matatu' ? '🃏 Matatu' : game === 'Chess' ? '♟️ Chess' : '⚪ Draft'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= 3. LIVE MATCH VIEWPORT & CAMERA STREAM ================= */}
      <View style={[styles.boardCard, isDarkMode && styles.darkCard]}>
        
        <View style={styles.liveHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.liveBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>🔴 LIVE</Text></View>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#dc2626' }}>Table 04: Grandmaster {selectedGame}</Text>
          </View>
          <Text style={[styles.spectatorText, isDarkMode && styles.darkText]}>👀 {spectatorCount.toLocaleString()} Watching</Text>
        </View>

        {/* Live Camera Feed Container */}
        <View style={styles.cameraViewport}>
          {Platform.OS === 'web' && cameraActive ? (
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: 8 }}
            />
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Text style={{ fontSize: 40, marginBottom: 4 }}>🏆📺</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Live Arena Broadcast Stream</Text>
            </View>
          )}

          {/* Floating Table Felt Overlay */}
          <View style={styles.feltTableOverlay}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>🌿 Felt Table: {selectedGame} Arena</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Text style={{ color: '#90cdf4', fontSize: 11, fontWeight: 'bold' }}>Borris: {playerOneScore} pts</Text>
              <Text style={{ color: '#f6ad55', fontSize: 11, fontWeight: 'bold' }}>Challenger_99: {playerTwoScore} pts</Text>
            </View>
          </View>
        </View>

        {/* Interactive Action Controls for the Active Player / Spectator */}
        <View style={styles.actionButtonRow}>
          {selectedGame === 'Matatu' && (
            <>
              <TouchableOpacity style={styles.playActionBtn} onPress={() => handleGameAction('card')}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🃏 Play Trump Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.playActionBtn, { backgroundColor: '#d69e2e' }]} onPress={() => handleGameAction('draw')}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🎴 Draw Card</Text>
              </TouchableOpacity>
            </>
          )}

          {selectedGame === 'Chess' && (
            <TouchableOpacity style={styles.playActionBtn} onPress={() => handleGameAction('move')}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>♟️ Execute Tactical Move</Text>
            </TouchableOpacity>
          )}

          {selectedGame === 'Draft' && (
            <TouchableOpacity style={styles.playActionBtn} onPress={() => handleGameAction('jump')}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>⚪ Crown King / Jump Piece</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tipping Section */}
        <View style={styles.tipRow}>
          <Text style={[styles.tipLabel, isDarkMode && styles.darkText]}>Cheer Champion:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.tipBtn} onPress={() => handleTipPlayer(20)}>
              <Text style={styles.tipBtnText}>🪙 Tip 20</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipBtn} onPress={() => handleTipPlayer(50)}>
              <Text style={styles.tipBtnText}>🔥 Tip 50</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tipBtn, { backgroundColor: '#d69e2e', borderColor: '#d69e2e' }]} onPress={() => setShowWagerModal(true)}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🪙 Stake Pool</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ================= 4. PROVABLY FAIR HASH & SECURITY LAYER ================= */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.badge, { backgroundColor: '#faf5ff', color: '#9333ea' }]}>🛡️ PROVABLY FAIR HASH</Text>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Table Seed: <Text style={{ fontWeight: 'bold', color: '#9333ea' }}>{tableHashId}</Text></Text>
          </View>
          <Switch
            value={fairnessHashActive}
            onValueChange={(val) => {
              setFairnessHashActive(val);
              Alert.alert('Fairness Hash', val ? '🛡️ Cryptographic shuffle verification active.' : 'Standard mode.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
          />
        </View>
      </View>

      {/* ================= 5. ELO RANKING & LEAGUE MULTIPLIER ================= */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#2563eb', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.badge, { backgroundColor: '#eff6ff', color: '#2563eb' }]}>🏆 ELO GRANDMASTER TIER</Text>
            <Text style={{ fontSize: 11, color: '#64748b' }}>Player Rating: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{playerEloRating}</Text></Text>
          </View>
          <Switch
            value={eloMultiplierActive}
            onValueChange={(val) => {
              setEloMultiplierActive(val);
              Alert.alert('Elo League', val ? '🏆 Ranked competitive match mode active.' : 'Casual mode.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#2563eb' }}
          />
        </View>
      </View>

      {/* ================= 6. SPECTATOR WAGER POOL STAKING ================= */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d97706', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.badge, { backgroundColor: '#fef3c7', color: '#d97706' }]}>🪙 SPECTATOR WAGER POOL</Text>
            <Text style={{ fontSize: 11, color: '#64748b' }}>Current Pool: <Text style={{ fontWeight: 'bold', color: '#d97706' }}>🪙 {spectatorPoolTotal} Coins</Text></Text>
          </View>
          <Switch
            value={spectatorWagerActive}
            onValueChange={(val) => {
              setSpectatorWagerActive(val);
              Alert.alert('Wager Pool', val ? '🪙 Spectator betting pool staking enabled.' : 'Viewing only.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#d97706' }}
          />
        </View>
      </View>

      {/* ================= 7. SECURITY & TOGGLE CONTROLS BAR ================= */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.chatHeaderTitle, isDarkMode && styles.darkText]}>⚙️ Arena Security & Features</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
          <TouchableOpacity 
            style={[styles.toggleSubBtn, meshTournamentSync && { backgroundColor: '#38a169' }]}
            onPress={() => setMeshTournamentSync(!meshTournamentSync)}
          >
            <Text style={{ color: meshTournamentSync ? '#fff' : '#2d3748', fontSize: 9, fontWeight: 'bold' }}>
              Mesh: {meshTournamentSync ? 'ON 🛰️' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleSubBtn, antiCollusionGuardActive && { backgroundColor: '#3182ce' }]}
            onPress={() => setAntiCollusionGuardActive(!antiCollusionGuardActive)}
          >
            <Text style={{ color: antiCollusionGuardActive ? '#fff' : '#2d3748', fontSize: 9, fontWeight: 'bold' }}>
              Anti-Cheat: {antiCollusionGuardActive ? 'ON 🛡️' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleSubBtn, voiceTauntsActive && { backgroundColor: '#d69e2e' }]}
            onPress={() => setVoiceTauntsActive(!voiceTauntsActive)}
          >
            <Text style={{ color: voiceTauntsActive ? '#fff' : '#2d3748', fontSize: 9, fontWeight: 'bold' }}>
              Taunts: {voiceTauntsActive ? 'ON 🎤' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 8. SPECTATOR SIDELINE CHAT & CHEERING FEED ================= */}
      <View style={[styles.chatCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.chatHeaderTitle, isDarkMode && styles.darkText]}>💬 Sideline Cheer & Chat</Text>
        <ScrollView style={[styles.chatScroll, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]} nestedScrollEnabled={true}>
          {matchMessages.map(msg => (
            <View key={msg.id} style={styles.chatMsgRow}>
              <Text style={styles.chatUser}>@{msg.user}: </Text>
              <Text style={[styles.chatText, isDarkMode && styles.darkText]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
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

      {/* ================= 9. WAGER STAKING MODAL ================= */}
      <Modal visible={showWagerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748' }}>🪙 Spectator Wager Pool Stake</Text>
              <TouchableOpacity onPress={() => setShowWagerModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#ebf8ff', padding: 8, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Current Wallet Balance: {coins} Coins</Text>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Select amount to wager on Borris winning this match:</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 15 }}>
              {[50, 100, 250, 500].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.wagerOptBtn, wagerStakeAmount === amt && { backgroundColor: '#3182ce' }]}
                  onPress={() => setWagerStakeAmount(amt)}
                >
                  <Text style={{ color: wagerStakeAmount === amt ? '#fff' : '#2d3748', fontSize: 12, fontWeight: 'bold' }}>🪙 {amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.confirmWagerBtn} onPress={handlePlaceWager}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Confirm & Stake Coins 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
    paddingBottom: 60,
  },
  darkContainer: {
    backgroundColor: '#0f172a',
  },
  darkCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  darkText: {
    color: '#f8fafc',
  },
  darkInput: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  sponsorBanner: {
    backgroundColor: '#fefcbf',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d69e2e',
    alignItems: 'center',
  },
  gameTabRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleSubBtn: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  badge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  boardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spectatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  cameraViewport: {
    width: '100%',
    height: 180,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },
  feltTableOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(6,95,70,0.85)',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  playActionBtn: {
    flex: 1,
    backgroundColor: '#3182ce',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  tipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  tipBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tipBtnText: {
    color: '#2563eb',
    fontSize: 10,
    fontWeight: '700',
  },
  chatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  chatScroll: {
    height: 100,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chatMsgRow: {
    flexDirection: 'row',
    marginBottom: 4,
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
    height: 36,
    backgroundColor: '#f8fafc',
    fontSize: 11,
    color: '#0f172a',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wagerOptBtn: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  confirmWagerBtn: {
    backgroundColor: '#d69e2e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});