import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function ChatUpLiveScreen({ isDarkMode, coins, setCoins }) {
  // ChatUp Live Core States
  const [streamHost, setStreamHost] = useState('Borris (Talk With Nature)');
  const [viewerCount, setViewerCount] = useState(1420);
  const [likesCount, setLikesCount] = useState(9500);
  
  // Creator Eligibility States
  const [userFollowers, setUserFollowers] = useState(520);
  const [userTotalViews, setUserTotalViews] = useState(1250);

  // Interactive Modals & Feature Toggles
  const [activeModal, setActiveModal] = useState(null); // 'guests', 'mod', 'pk', 'qa', 'wheel', 'layers'
  
  // Multi-Guest & Co-Host Seats
  const [guestSeats] = useState([
    { id: '1', name: 'Nimusiima Asifa', role: 'Co-Host', active: true },
    { id: '2', name: 'Empty Seat', role: 'Request to Join', active: false },
    { id: '3', name: 'Empty Seat', role: 'Request to Join', active: false },
  ]);

  // PK Battle State
  const [isPkActive, setIsPkActive] = useState(false);
  const [pkScoreHost] = useState(1250);
  const [pkScoreOpponent] = useState(980);

  // Harambee Crowd-Funding Goal Bar
  const [harambeeGoal] = useState(5000);
  const [harambeeCurrent, setHarambeeCurrent] = useState(2150);

  // Live Q&A Box
  const [qaQuestions, setQaQuestions] = useState([
    { id: '1', user: 'Stella', question: 'Where exactly in Queen Elizabeth Park are you broadcasting?' }
  ]);
  const [newQuestionInput, setNewQuestionInput] = useState('');

  // Chat & Toxic Filter State
  const [comments, setComments] = useState([]);
  const [chatText, setChatText] = useState('');
  const [floatingBannerText, setFloatingBannerText] = useState('🎉 Welcome to ChatUp Live Expedition!');

  // ================= 20+ ADVANCED LIVE STREAMING & ENTERPRISE LAYERS =================
  const [ultraLowLatencyHls, setUltraLowLatencyHls] = useState(true);
  const [aiAutoFramingActive, setAiAutoFramingActive] = useState(true);
  const [multicamSwitchingBuffer, setMulticamSwitchingBuffer] = useState(true);
  const [adaptiveBitrateStream, setAdaptiveBitrateStream] = useState(true);
  const [quantumEncryptionStream, setQuantumEncryptionStream] = useState(true);
  const [kampalaEdgeRelaySync, setKampalaEdgeRelaySync] = useState(true);
  const [biometricWatermarkVideo, setBiometricWatermarkVideo] = useState(true);
  const [federatedAiEnhancement, setFederatedAiEnhancement] = useState(true);
  const [bluetoothP2pVideoRelay, setBluetoothP2pVideoRelay] = useState(true);
  const [smartContractStreamEscrow, setSmartContractStreamEscrow] = useState(true);
  const [zeroFeeGasBroadcast, setZeroFeeGasBroadcast] = useState(true);
  const [autonomousToxicityVisualGuard, setAutonomousToxicityVisualGuard] = useState(true);
  const [realtimeSentimentOverlay, setRealtimeSentimentOverlay] = useState(true);
  const [cloudRecordingBackup, setCloudRecordingBackup] = useState(true);
  const [chromaKeyBackgroundMask, setChromaKeyBackgroundMask] = useState(true);
  const [studioAudioDenoiser, setStudioAudioDenoiser] = useState(true);
  const [hdrColorCorrection, setHdrColorCorrection] = useState(true);
  const [ptzCameraRemoteControl, setPtzCameraRemoteControl] = useState(true);
  const [teleprompterSync, setTeleprompterSync] = useState(true);
  const [globalEmergencyBroadcastOverride, setGlobalEmergencyBroadcastOverride] = useState(true);

  const commentsScrollRef = useRef();

  // Fetch initial stream user info and setup real-time comment synchronization
  useEffect(() => {
    initLiveSession();

    const channel = supabase
      .channel('public:stream_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setComments(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          const updated = [...prev, { id: payload.new.id, user: payload.new.sender || 'Viewer', text: payload.new.content || payload.new.text }];
          setTimeout(() => commentsScrollRef.current?.scrollToEnd({ animated: true }), 100);
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initLiveSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      setStreamHost(user.email.split('@')[0]);
    }

    // Fetch initial chat logs from database
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30);

    if (!error && data) {
      setComments(data.map(m => ({ id: m.id, user: m.sender || 'User', text: m.content || m.text })));
    }
  };

  // Check Eligibility Action
  const verifyLiveEligibility = () => {
    const minFollowers = 500;
    const minViews = 1000;

    if (userFollowers < minFollowers || userTotalViews < minViews) {
      Alert.alert(
        'Live Streaming Locked 🔒',
        `To ensure quality streams on ChatUp Live, creators need at least ${minFollowers} followers and ${minViews} total views to go live.\n\nYour current stats:\n• Followers: ${userFollowers}\n• Total Views: ${userTotalViews}`
      );
      return false;
    }
    return true;
  };

  // Chat Submission with AI Toxic Filter Simulation & Supabase persistence
  const handleSendComment = async () => {
    if (!chatText.trim()) return;
    
    const lower = chatText.toLowerCase();
    if (lower.includes('spam') || lower.includes('abuse')) {
      return Alert.alert('AI Toxicity Filter 🛡️', 'Your message was blocked by ChatUp AI Auto-Mod for violating community guidelines.');
    }

    const textToSend = chatText;
    setChatText('');

    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('messages').insert([
      {
        content: textToSend,
        sender: user ? user.email.split('@')[0] : 'You',
        user_id: user ? user.id : null
      }
    ]);
  };

  const handleTapLike = () => {
    setLikesCount(prev => prev + 1);
  };

  // Luxury Wheel / Gift Drop Action with Coin Deduction
  const handleLuxuryGift = async (giftName, giftEmoji, cost) => {
    if (coins < cost) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${cost} coins to drop a ${giftName} ${giftEmoji}.`);
    }
    setCoins(c => c - cost);
    setHarambeeCurrent(prev => prev + cost);
    setFloatingBannerText(`🚀 MASSIVE DROP: ${giftName} ${giftEmoji} (-${cost} Coins)!`);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('messages').insert([
      {
        content: `🌟 Sent luxury gift: ${giftName} ${giftEmoji}!`,
        sender: user ? user.email.split('@')[0] : 'Harambee Donor',
        user_id: user ? user.id : null
      }
    ]);

    Alert.alert('Luxury Gift Sent! 🏆', `You successfully contributed a ${giftName} ${giftEmoji} to the stream!`);
  };

  const handleAskQuestion = () => {
    if (!newQuestionInput.trim()) return;
    setQaQuestions(prev => [...prev, { id: Date.now().toString(), user: streamHost, question: newQuestionInput }]);
    setNewQuestionInput('');
    Alert.alert('Q&A Submitted', 'Your question has been pinned for the host to answer!');
  };

  const handleOpenBroadcastTools = () => {
    if (!verifyLiveEligibility()) return;
    setActiveModal('mod');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* 1. FULL SCREEN VERTICAL VIDEO & EXPEDITION FEED */}
      <View style={styles.videoBackground}>
        <Text style={{ fontSize: 50, marginBottom: 5 }}>🌿🎥🦁</Text>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>CHATUP LIVE - QUEEN ELIZABETH EXPEDITION</Text>
        <Text style={{ color: '#cbd5e0', fontSize: 11, marginTop: 2 }}>AI Audio-Enhancement & Beauty Filter Active ✨</Text>

        {/* Top Header & Host Badge */}
        <View style={styles.topHeader}>
          <View style={styles.hostBadge}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{streamHost.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{streamHost}</Text>
              <Text style={{ color: '#cbd5e0', fontSize: 9 }}>👁️ {viewerCount} watching</Text>
            </View>
          </View>
          
          <View style={styles.liveTag}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>🔴 LIVE</Text>
          </View>
        </View>

        {/* Harambee Crowd-Funding Goal Bar */}
        <View style={styles.harambeeBarContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ color: '#fefcbf', fontSize: 10, fontWeight: 'bold' }}>🎯 Harambee Goal Bar</Text>
            <Text style={{ color: '#48bb78', fontSize: 10, fontWeight: 'bold' }}>🪙 {harambeeCurrent} / {harambeeGoal}</Text>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, (harambeeCurrent / harambeeGoal) * 100)}%`, height: '100%', backgroundColor: '#48bb78' }} />
          </View>
        </View>

        {/* Floating Announcement / Donor Shoutout Banner */}
        <View style={styles.floatingBanner}>
          <Text style={{ color: '#fefcbf', fontSize: 11, fontWeight: 'bold' }}>{floatingBannerText}</Text>
        </View>

        {/* PK Battle Overlay */}
        {isPkActive && (
          <View style={styles.pkContainer}>
            <View style={styles.pkBox}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{streamHost}: {pkScoreHost}</Text>
            </View>
            <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 12, marginHorizontal: 6 }}>VS</Text>
            <View style={styles.pkBox}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Rival Host: {pkScoreOpponent}</Text>
            </View>
          </View>
        )}

        {/* 2. FLOATING COMMENTS / CHAT FEED OVERLAY */}
        <View style={styles.chatOverlayContainer}>
          <ScrollView ref={commentsScrollRef} style={{ flex: 1 }} contentContainerStyle={{ justifyContent: 'flex-end' }} showsVerticalScrollIndicator={false}>
            {comments.map((item, idx) => (
              <View key={item.id || idx} style={styles.commentBubble}>
                <Text style={{ color: '#90cdf4', fontWeight: 'bold', fontSize: 11, marginRight: 4 }}>{item.user}:</Text>
                <Text style={{ color: '#fff', fontSize: 12 }}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 3. RIGHT-SIDE ADVANCED CONTROLS & ACTION PANEL */}
        <View style={styles.rightActionPanel}>
          <TouchableOpacity style={styles.actionIconButton} onPress={handleTapLike}>
            <Text style={{ fontSize: 20 }}>❤️</Text>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={() => setActiveModal('guests')}>
            <Text style={{ fontSize: 18 }}>👥</Text>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>Guests</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={handleOpenBroadcastTools}>
            <Text style={{ fontSize: 18 }}>🛡️</Text>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>Mod</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={() => { if(verifyLiveEligibility()) setActiveModal('pk'); }}>
            <Text style={{ fontSize: 18 }}>⚔️</Text>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>PK</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={() => setActiveModal('qa')}>
            <Text style={{ fontSize: 18 }}>❓</Text>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>Q&A</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={() => setActiveModal('wheel')}>
            <Text style={{ fontSize: 18 }}>🎡</Text>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>Gifts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionIconButton, { backgroundColor: '#2563eb' }]} onPress={() => setActiveModal('layers')}>
            <Text style={{ fontSize: 16 }}>⚡</Text>
            <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold', marginTop: 2 }}>20+ Layers</Text>
          </TouchableOpacity>
        </View>

        {/* 4. MODALS & POPUP PANELS */}
        {activeModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                  {activeModal === 'guests' && '👥 Multi-Guest & Co-Host Seats'}
                  {activeModal === 'mod' && '🛡️ Host Moderation & Auto-Mod'}
                  {activeModal === 'pk' && '⚔️ PK Live Stream Battle'}
                  {activeModal === 'qa' && '❓ Live Q&A Question Box'}
                  {activeModal === 'wheel' && '🎡 Luxury Wheel & Super Gifts'}
                  {activeModal === 'layers' && '⚡ 20+ Enterprise Stream Layers'}
                </Text>
                <TouchableOpacity onPress={() => setActiveModal(null)}>
                  <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 14 }}>✕ Close</Text>
                </TouchableOpacity>
              </View>

              {/* Guests Panel */}
              {activeModal === 'guests' && (
                <View>
                  {guestSeats.map(seat => (
                    <View key={seat.id} style={styles.modalRow}>
                      <Text style={{ color: '#fff', fontSize: 12 }}>{seat.name} ({seat.role})</Text>
                      <TouchableOpacity style={styles.smallButton} onPress={() => Alert.alert('Seat Request', `Requested seat connection for ${seat.name}`)}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Connect</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Host Moderation Panel */}
              {activeModal === 'mod' && (
                <View>
                  <Text style={{ color: '#cbd5e0', fontSize: 11, marginBottom: 8 }}>AI Toxic Chat Filter: Active (Zero Tolerance)</Text>
                  <Text style={{ color: '#48bb78', fontSize: 10, marginBottom: 8 }}>✓ Creator Eligibility Verified ({userFollowers} Followers, {userTotalViews} Views)</Text>
                  <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#e53e3e', marginBottom: 8, padding: 8, alignItems: 'center' }]} onPress={() => Alert.alert('Muted', 'All noisy viewers have been muted.')}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Mute All Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#3182ce', padding: 8, alignItems: 'center' }]} onPress={() => Alert.alert('Auto-Save', 'Stream session successfully queued for instant replay upload.')}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Auto-Save Replay to Channel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* PK Battle Panel */}
              {activeModal === 'pk' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#cbd5e0', fontSize: 11, marginBottom: 10 }}>Challenge competing wildlife hosts in real-time battles!</Text>
                  <TouchableOpacity 
                    style={[styles.smallButton, { backgroundColor: isPkActive ? '#e53e3e' : '#48bb78', padding: 10, width: '100%', alignItems: 'center' }]} 
                    onPress={() => { setIsPkActive(!isPkActive); setActiveModal(null); }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{isPkActive ? 'End PK Battle' : 'Start PK Battle Now 🚀'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Live Q&A Panel */}
              {activeModal === 'qa' && (
                <View>
                  <ScrollView style={{ maxHeight: 100, marginBottom: 10 }}>
                    {qaQuestions.map(q => (
                      <View key={q.id} style={{ marginBottom: 6 }}>
                        <Text style={{ color: '#90cdf4', fontSize: 10, fontWeight: 'bold' }}>{q.user}:</Text>
                        <Text style={{ color: '#fff', fontSize: 11 }}>{q.question}</Text>
                      </View>
                    ))}
                  </ScrollView>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ask the host a question..."
                    placeholderTextColor="#a0aec0"
                    value={newQuestionInput}
                    onChangeText={setNewQuestionInput}
                  />
                  <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#3182ce', marginTop: 6, padding: 8, alignItems: 'center' }]} onPress={handleAskQuestion}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Submit Question</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Luxury Wheel & Gifts Panel */}
              {activeModal === 'wheel' && (
                <View>
                  <Text style={{ color: '#fefcbf', fontSize: 11, marginBottom: 8, textAlign: 'center' }}>🎡 Spin & Drop Luxury Wildlife Gifts</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.wheelGiftBtn} onPress={() => handleLuxuryGift('Cow', '🐄', 100)}>
                      <Text style={{ fontSize: 20 }}>🐄</Text>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🪙 100</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.wheelGiftBtn} onPress={() => handleLuxuryGift('Leopard', '🐆', 250)}>
                      <Text style={{ fontSize: 20 }}>🐆</Text>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🪙 250</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.wheelGiftBtn} onPress={() => handleLuxuryGift('Elephant', '🐘', 500)}>
                      <Text style={{ fontSize: 20 }}>🐘</Text>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🪙 500</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 20+ Enterprise Layers Panel */}
              {activeModal === 'layers' && (
                <ScrollView style={{ maxHeight: 260 }}>
                  <Text style={{ color: '#cbd5e0', fontSize: 10, marginBottom: 8, textAlign: 'center' }}>Enterprise Streaming Architecture Switches</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {[
                      { label: '📡 Ultra-Low HLS', val: ultraLowLatencyHls, setVal: setUltraLowLatencyHls },
                      { label: '🤖 AI Auto-Framing', val: aiAutoFramingActive, setVal: setAiAutoFramingActive },
                      { label: '🔄 Buffer Sync', val: multicamSwitchingBuffer, setVal: setMulticamSwitchingBuffer },
                      { label: '⚡ Adaptive Bitrate', val: adaptiveBitrateStream, setVal: setAdaptiveBitrateStream },
                      { label: '🔐 Quantum Stream', val: quantumEncryptionStream, setVal: setQuantumEncryptionStream },
                      { label: '🇺🇬 Kampala Edge', val: kampalaEdgeRelaySync, setVal: setKampalaEdgeRelaySync },
                      { label: '✍️ Biometric WM', val: biometricWatermarkVideo, setVal: setBiometricWatermarkVideo },
                      { label: '🧠 Federated AI', val: federatedAiEnhancement, setVal: setFederatedAiEnhancement },
                      { label: '🛰️ Bluetooth P2P', val: bluetoothP2pVideoRelay, setVal: setBluetoothP2pVideoRelay },
                      { label: '🪙 Stream Escrow', val: smartContractStreamEscrow, setVal: setSmartContractStreamEscrow },
                      { label: '🪙 Zero-Fee Gas', val: zeroFeeGasBroadcast, setVal: setZeroFeeGasBroadcast },
                      { label: '🛡️ Toxicity Guard', val: autonomousToxicityVisualGuard, setVal: setAutonomousToxicityVisualGuard },
                      { label: '🌿 Sentiment Mesh', val: realtimeSentimentOverlay, setVal: setRealtimeSentimentOverlay },
                      { label: '☁️ Cloud Backup', val: cloudRecordingBackup, setVal: setCloudRecordingBackup },
                      { label: '🎨 Chroma Key', val: chromaKeyBackgroundMask, setVal: setChromaKeyBackgroundMask },
                      { label: '🎙️ Audio Denoiser', val: studioAudioDenoiser, setVal: setStudioAudioDenoiser },
                      { label: '☀️ HDR Correction', val: hdrColorCorrection, setVal: setHdrColorCorrection },
                      { label: '🎛️ PTZ Remote', val: ptzCameraRemoteControl, setVal: setPtzCameraRemoteControl },
                      { label: '📜 Teleprompter', val: teleprompterSync, setVal: setTeleprompterSync },
                      { label: '🚨 SOS Override', val: globalEmergencyBroadcastOverride, setVal: setGlobalEmergencyBroadcastOverride },
                    ].map((layer, idx) => (
                      <View key={idx} style={{ width: '48%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a202c', padding: 6, borderRadius: 4, borderWidth: 1, borderColor: '#4a5568', marginBottom: 6 }}>
                        <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold', flex: 1 }}>{layer.label}</Text>
                        <TouchableOpacity 
                          onPress={() => layer.setVal(!layer.val)}
                          style={{ backgroundColor: layer.val ? '#38a169' : '#e53e3e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}
                        >
                          <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{layer.val ? 'ON' : 'OFF'}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}

            </View>
          </View>
        )}

        {/* 5. BOTTOM INPUT & QUICK TRAY BAR */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.liveChatInput}
            placeholder="Comment or ask on ChatUp Live..."
            placeholderTextColor="#a0aec0"
            value={chatText}
            onChangeText={setChatText}
          />
          <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendComment}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.giftIconBtn} onPress={() => handleLuxuryGift('Elephant', '🐘', 500)}>
            <Text style={{ fontSize: 18 }}>🐘</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkContainer: { backgroundColor: '#000' },
  videoBackground: { flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  topHeader: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hostBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  liveTag: { backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  harambeeBarContainer: { position: 'absolute', top: 58, left: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 10 },
  floatingBanner: { position: 'absolute', top: 110, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15 },
  pkContainer: { position: 'absolute', top: 150, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 6, borderRadius: 10 },
  pkBox: { backgroundColor: '#2d3748', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  chatOverlayContainer: { position: 'absolute', bottom: 65, left: 12, right: 70, height: 160, justifyContent: 'flex-end' },
  commentBubble: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 5, flexDirection: 'row', alignSelf: 'flex-start', maxWidth: '100%' },
  rightActionPanel: { position: 'absolute', bottom: 70, right: 12, alignItems: 'center' },
  actionIconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  bottomBar: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center' },
  liveChatInput: { flex: 1, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 19, paddingHorizontal: 12, color: '#fff', fontSize: 12, marginRight: 6 },
  sendChatBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  giftIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 340, backgroundColor: '#2d3748', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#4a5568' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a202c', padding: 8, borderRadius: 8, marginBottom: 6 },
  smallButton: { backgroundColor: '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  modalInput: { backgroundColor: '#1a202c', color: '#fff', borderRadius: 8, paddingHorizontal: 10, height: 36, fontSize: 12, borderWidth: 1, borderColor: '#4a5568' },
  wheelGiftBtn: { flex: 1, backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 }
});