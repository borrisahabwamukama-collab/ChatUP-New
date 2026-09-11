import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  Switch
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LiveStreamScreen({ isDarkMode, coins, setCoins, onBack, userRole = 'creator' }) {
  // Live Broadcast State
  const [streamerName] = useState('Borris (Talk With Nature)');
  const [viewerCount, setViewerCount] = useState(4250);
  const [likesCount, setLikesCount] = useState(18400);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  // Live Comments & Chat Stream
  const [comments, setComments] = useState([
    { id: '1', user: 'Nimusiima Asifa', text: 'Stunning view of the park today! 🌿🐘' },
    { id: '2', user: 'Stella', text: 'Look at those mountains in the background 😍' },
    { id: '3', user: 'Viewer_Kampala', text: 'Best wildlife stream on ChatUp 🔥' },
    { id: '4', user: 'Brian_UG', text: 'Sent a Leopard gift! 🐆' }
  ]);
  const [commentInput, setCommentInput] = useState('');

  // Pro Features Modals & States
  const [activeFilter, setActiveFilter] = useState('Normal');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSoundboardModal, setShowSoundboardModal] = useState(false);
  const [showCoHostModal, setShowCoHostModal] = useState(false);
  const [showHostControlsModal, setShowHostControlsModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showQaModal, setShowQaModal] = useState(false);
  const [showAutoInviteModal, setShowAutoInviteModal] = useState(false);

  // New Feature 1: Auto-Invites & Follower Alerts
  const [autoInviteActive, setAutoInviteActive] = useState(true);
  const [inviteNotificationBanner, setInviteNotificationBanner] = useState('⚡ Auto-Invite broadcasted to 1,400 active followers!');

  // New Feature 2: Live Interactive Q&A Box
  const [activeQaQuestion, setActiveQaQuestion] = useState('What time do the elephants come down to the river? 🐘');
  const [qaList, setQaList] = useState([
    { id: 'q1', user: 'Stella', question: 'Are there lions in this sector?' },
    { id: 'q2', user: 'Brian_UG', question: 'What camera gear are you using?' }
  ]);
  const [newQaInput, setNewQaInput] = useState('');

  // New Feature 3: Live Interactive Poll
  const [pollActive, setPollActive] = useState(true);
  const [pollQuestion, setPollQuestion] = useState('Which animal should we track next?');
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: '🦁 Lions', votes: 340 },
    { id: 2, text: '🐘 Elephants', votes: 890 }
  ]);
  const [userVotedPoll, setUserVotedPoll] = useState(false);

  // New Feature 4: Real-Time AI Closed Captions HUD
  const [aiCaptionsEnabled, setAiCaptionsEnabled] = useState(true);
  const [currentCaptionText, setCurrentCaptionText] = useState('🎙️ "We are tracking a family of elephants moving toward the water basin..."');

  // New Feature 5: VIP Front Row Seat Spotlights
  const [vipSeats] = useState([
    { id: 'v1', name: 'Nimusiima Asifa', badge: '👑 VIP Diamond' },
    { id: 'v2', name: 'Stella', badge: '⭐ Top Supporter' }
  ]);

  // Co-Host State
  const [coHostConnected, setCoHostConnected] = useState(false);
  const [coHostName, setCoHostName] = useState('Nimusiima Asifa');

  // Sound FX & Banner Broadcast State
  const [activeSoundBanner, setActiveSoundBanner] = useState(null);

  // Gift & Animation State
  const [lastGiftSent, setLastGiftSent] = useState(null);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Camera Stream Reference
  const webcamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);

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
        if (setCoins) {
          setCoins(prev => prev + 100);
        }
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +100 Coins live stream fan bonus!');
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

  // Hide auto invite notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setInviteNotificationBanner(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const lastTapRef = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      triggerLike();
    }
    lastTapRef.current = now;
  };

  const triggerLike = () => {
    setIsLiked(true);
    setLikesCount(prev => prev + 1);
    const newHeart = { id: Date.now(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    setComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: 'You (VIP)', text: commentInput }
    ]);
    setCommentInput('');
  };

  const handleSendGift = (giftName, giftEmoji, cost) => {
    if (coins < cost) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${cost} coins to send a ${giftName} ${giftEmoji}. Your balance is 🪙 ${coins}.`);
    }

    if (setCoins) {
      setCoins(c => c - cost);
    }
    setLastGiftSent(`🎁 You sent ${giftName} ${giftEmoji} (-${cost} Coins)`);
    setShowGiftModal(false);

    setComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: 'Gift Alert 🌟', text: `You sent a ${giftName} ${giftEmoji} to ${streamerName}!` }
    ]);

    Alert.alert('Gift Delivered! 🎉', `Successfully sent ${giftName} ${giftEmoji}!`);
  };

  const triggerSoundEffect = (effectName, emojiIcon) => {
    setActiveSoundBanner(`${emojiIcon} ${effectName} played across stream!`);
    setComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: 'Sound FX 🔊', text: `Triggered ${emojiIcon} ${effectName}` }
    ]);
    setTimeout(() => setActiveSoundBanner(null), 3500);
    setShowSoundboardModal(false);
  };

  const handleVotePoll = (optionId) => {
    if (userVotedPoll) return Alert.alert('Already Voted', 'You have already participated in this live poll.');
    setPollOptions(prev => prev.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt));
    setUserVotedPoll(true);
    Alert.alert('Vote Recorded 🗳️', 'Your choice has been added to the live results overlay!');
  };

  const handlePostQaQuestion = () => {
    if (!newQaInput.trim()) return;
    setQaList(prev => [...prev, { id: Date.now().toString(), user: 'You (VIP)', question: newQaInput }]);
    setNewQaInput('');
    Alert.alert('Question Submitted ❓', 'Your question was pinned for the host to answer.');
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        
        {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
        <View style={styles.monetizationAdOverlay}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob LiveStream Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob LiveStream Banner load error: ', error)}
          />
        </View>

        {/* ================= 1. CAMERA / VIDEO BACKGROUND WITH FILTERS ================= */}
        {Platform.OS === 'web' && cameraActive ? (
          <video
            ref={webcamRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              zIndex: 0,
              filter: activeFilter === 'Nature Vibrant 🌿' ? 'saturate(180%) contrast(110%)' :
                    activeFilter === 'Cinematic Warm ☀️' ? 'sepia(30%) brightness(105%)' :
                    activeFilter === 'Kampala Neon 🏙️' ? 'hue-rotate(40deg) saturate(150%)' : 'none'
            }}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 60, marginBottom: 10 }}>🦁🎥</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Queen Elizabeth National Park Live Stream</Text>
            <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>Filter: {activeFilter}</Text>
          </View>
        )}

        {/* Co-Host Split Screen Box */}
        {coHostConnected && (
          <View style={styles.coHostSplitContainer}>
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#fff' }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Borris (Host)</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#38a169', fontSize: 11, fontWeight: 'bold' }}>🎙️ {coHostName}</Text>
            </View>
          </View>
        )}

        <View style={styles.darkScrimOverlay} pointerEvents="none" />

        {/* ================= 2. FLOATING HEARTS & BANNERS ================= */}
        {floatingHearts.map(heart => (
          <View key={heart.id} style={[styles.floatingHeart, { left: `${heart.left}%` }]} pointerEvents="none">
            <Text style={{ fontSize: 45 }}>❤️</Text>
          </View>
        ))}

        {activeSoundBanner && (
          <View style={styles.soundEffectBanner}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{activeSoundBanner}</Text>
          </View>
        )}

        {inviteNotificationBanner && (
          <View style={styles.autoInviteBanner}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{inviteNotificationBanner}</Text>
          </View>
        )}

        {/* ================= 3. TOP HEADER & VIP FRONT ROW BADGES ================= */}
        <View style={styles.topHeader}>
          <View style={styles.hostBadgeContainer}>
            <View style={styles.hostAvatar}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>B</Text>
            </View>
            <View style={{ marginLeft: 8, marginRight: 10 }}>
              <Text style={styles.hostNameText} numberOfLines={1}>{streamerName}</Text>
              <Text style={styles.viewerCountText}>👥 {viewerCount.toLocaleString()} watching • 🇺🇬 Kampala Node</Text>
            </View>
            <TouchableOpacity 
              style={[styles.followBtn, isFollowing && { backgroundColor: '#4a5568' }]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isFollowing ? 'Following ✓' : '+ Follow'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>🔴 LIVE</Text>
            </View>
            {onBack && (
              <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* VIP Front Row Badges Bar */}
        <View style={styles.vipFrontRowBar}>
          {vipSeats.map(vip => (
            <View key={vip.id} style={styles.vipChip}>
              <Text style={{ fontSize: 10, color: '#fefcbf', fontWeight: 'bold' }}>{vip.badge}: {vip.name}</Text>
            </View>
          ))}
          
          {/* Rewarded Ad Quick Booster Pill */}
          <TouchableOpacity style={styles.rewardAdPill} onPress={handleShowRewardedAd}>
            <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>🎁 Watch Ad (+100 🪙)</Text>
          </TouchableOpacity>
        </View>

        {lastGiftSent && (
          <View style={styles.giftBanner}>
            <Text style={{ color: '#fefcbf', fontSize: 11, fontWeight: 'bold' }}>{lastGiftSent}</Text>
          </View>
        )}

        {/* ================= 4. INTERACTIVE Q&A CARD PINNED OVERLAY ================= */}
        <TouchableOpacity style={styles.pinnedQaCard} onPress={() => setShowQaModal(true)}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#63b3ed' }}>📌 PINNED Q&A (Tap to view all)</Text>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>{activeQaQuestion}</Text>
        </TouchableOpacity>

        {/* ================= 5. LIVE POLL WIDGET OVERLAY (IF ACTIVE) ================= */}
        {pollActive && (
          <View style={styles.pollOverlayContainer}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#f6ad55', marginBottom: 4 }}>📊 Live Poll: {pollQuestion}</Text>
            <View style={{ gap: 4 }}>
              {pollOptions.map(opt => (
                <TouchableOpacity key={opt.id} style={styles.pollOptionRow} onPress={() => handleVotePoll(opt.id)}>
                  <Text style={{ fontSize: 11, color: '#fff' }}>{opt.text}</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#68d391' }}>{opt.votes} votes</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ================= 6. BOTTOM-LEFT COMMENTS STREAM & AI CAPTIONS ================= */}
        <View style={styles.commentStreamContainer} pointerEvents="box-none">
          {aiCaptionsEnabled && (
            <View style={styles.aiCaptionsBox}>
              <Text style={styles.aiCaptionText}>{currentCaptionText}</Text>
            </View>
          )}

          <ScrollView 
            style={styles.commentScroll} 
            contentContainerStyle={{ justifyContent: 'flex-end' }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {comments.map((item) => (
              <View key={item.id} style={styles.commentBubble}>
                <Text style={styles.commentUser}>@{item.user}: </Text>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ================= 7. RIGHT-SIDE ACTION SIDEBAR (PRO TIKTOK TOOLS) ================= */}
        <View style={styles.rightSidebar}>
          
          <TouchableOpacity style={styles.sidebarButton} onPress={triggerLike}>
            <Text style={{ fontSize: 26 }}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.sidebarButtonText}>{likesCount.toLocaleString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowGiftModal(true)}>
            <Text style={{ fontSize: 26 }}>🎁</Text>
            <Text style={styles.sidebarButtonText}>Gifts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowAutoInviteModal(true)}>
            <Text style={{ fontSize: 24 }}>⚡</Text>
            <Text style={styles.sidebarButtonText}>Invites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowPollModal(true)}>
            <Text style={{ fontSize: 24 }}>📊</Text>
            <Text style={styles.sidebarButtonText}>Polls</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowQaModal(true)}>
            <Text style={{ fontSize: 24 }}>❓</Text>
            <Text style={styles.sidebarButtonText}>Q&A</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowFiltersModal(true)}>
            <Text style={{ fontSize: 24 }}>🎨</Text>
            <Text style={styles.sidebarButtonText}>Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowSoundboardModal(true)}>
            <Text style={{ fontSize: 24 }}>🔊</Text>
            <Text style={styles.sidebarButtonText}>FX</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowCoHostModal(true)}>
            <Text style={{ fontSize: 24 }}>👥</Text>
            <Text style={styles.sidebarButtonText}>Co-Host</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowHostControlsModal(true)}>
            <Text style={{ fontSize: 24 }}>🛡️</Text>
            <Text style={styles.sidebarButtonText}>Shield</Text>
          </TouchableOpacity>

        </View>

        {/* ================= 8. BOTTOM CHAT INPUT BAR ================= */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Say something nice to the host..."
            placeholderTextColor="#cbd5e0"
            value={commentInput}
            onChangeText={setCommentInput}
          />

          <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendComment}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickGiftBtn} onPress={() => setShowGiftModal(true)}>
            <Text style={{ fontSize: 18 }}>🎁</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 9. MODALS & DRAWERS ================= */}

        {/* AUTO-INVITES MODAL */}
        <Modal visible={showAutoInviteModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>⚡ Auto-Invites & Follower Pings</Text>
                <TouchableOpacity onPress={() => setShowAutoInviteModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Automatically dispatch push notifications and direct alerts to your followers when you start streaming:</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 15 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>Smart Auto-Invite Dispatch</Text>
                  <Text style={{ fontSize: 10, color: '#718096' }}>Ping active followers instantly</Text>
                </View>
                <Switch
                  value={autoInviteActive}
                  onValueChange={(val) => {
                    setAutoInviteActive(val);
                    Alert.alert('Auto-Invites', val ? '⚡ Auto-invite alerts enabled for future feeds.' : 'Auto-invites disabled.');
                  }}
                  trackColor={{ false: '#cbd5e0', true: '#805ad5' }}
                />
              </View>

              <TouchableOpacity style={{ backgroundColor: '#805ad5', padding: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => { setShowAutoInviteModal(false); Alert.alert('Broadcast Sent 🚀', 'Manual push alert dispatched to all 1,400 followers!'); }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Broadcast Manual Invite Now 📢</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Q&A MODAL */}
        <Modal visible={showQaModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>❓ Live Q&A Manager</Text>
                <TouchableOpacity onPress={() => setShowQaModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Submit or pin questions for the live broadcast stream:</Text>

              <ScrollView style={{ maxHeight: 150, marginBottom: 10 }}>
                {qaList.map(item => (
                  <TouchableOpacity key={item.id} style={{ backgroundColor: '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' }} onPress={() => { setActiveQaQuestion(item.question); setShowQaModal(false); }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3182ce' }}>@{item.user}</Text>
                    <Text style={{ fontSize: 11, color: '#2d3748' }}>{item.question}</Text>
                    <Text style={{ fontSize: 9, color: '#38a169', marginTop: 2 }}>Tap to Pin on Stream 📌</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TextInput
                  style={[styles.chatInput, { flex: 1, color: '#2d3748', backgroundColor: '#f7fafc', borderColor: '#cbd5e0' }]}
                  placeholder="Ask the host a question..."
                  placeholderTextColor="#a0aec0"
                  value={newQaInput}
                  onChangeText={setNewQaInput}
                />
                <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 8 }} onPress={handlePostQaQuestion}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* POLLS MODAL */}
        <Modal visible={showPollModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📊 Interactive Live Polls</Text>
                <TouchableOpacity onPress={() => setShowPollModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Launch live voting cards for your audience:</Text>

              <View style={{ backgroundColor: '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 }}>Active Poll: {pollQuestion}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {pollOptions.map(o => (
                    <Text key={o.id} style={{ fontSize: 11, color: '#4a5568', fontWeight: 'bold' }}>{o.text}: {o.votes}</Text>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: pollActive ? '#e53e3e' : '#38a169', padding: 10, borderRadius: 8, alignItems: 'center' }}
                onPress={() => setPollActive(!pollActive)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{pollActive ? 'End Live Poll ⏹️' : 'Start Live Poll 📊'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* GIFTS MODAL */}
        <Modal visible={showGiftModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎁 Send Wildlife Super-Gifts</Text>
                <TouchableOpacity onPress={() => setShowGiftModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <View style={styles.walletBox}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Your Coin Balance: {coins} Coins</Text>
              </View>
              <View style={styles.giftGrid}>
                {[
                  { name: 'Cow', emoji: '🐄', cost: 100 },
                  { name: 'Leopard', emoji: '🐆', cost: 250 },
                  { name: 'Elephant', emoji: '🐘', cost: 500 },
                  { name: 'Gorilla', emoji: '🦍', cost: 1000 },
                ].map(gift => (
                  <TouchableOpacity 
                    key={gift.name}
                    style={styles.giftCard}
                    onPress={() => handleSendGift(gift.name, gift.emoji, gift.cost)}
                  >
                    <Text style={{ fontSize: 30, marginBottom: 4 }}>{gift.emoji}</Text>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2d3748' }}>{gift.name}</Text>
                    <Text style={{ fontSize: 10, color: '#d69e2e', fontWeight: 'bold', marginTop: 2 }}>🪙 {gift.cost}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* FILTERS MODAL */}
        <Modal visible={showFiltersModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎨 Live Camera Color Filters</Text>
                <TouchableOpacity onPress={() => setShowFiltersModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <View style={{ gap: 8, marginTop: 10 }}>
                {['Normal', 'Nature Vibrant 🌿', 'Cinematic Warm ☀️', 'Kampala Neon 🏙️'].map(flt => (
                  <TouchableOpacity
                    key={flt}
                    style={[styles.modalOptionBtn, activeFilter === flt && { backgroundColor: '#3182ce' }]}
                    onPress={() => {
                      setActiveFilter(flt);
                      setShowFiltersModal(false);
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: activeFilter === flt ? '#fff' : '#2d3748', fontSize: 12 }}>{flt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* SOUNDBOARD MODAL */}
        <Modal visible={showSoundboardModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔊 Sound FX & Applauses</Text>
                <TouchableOpacity onPress={() => setShowSoundboardModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <View style={styles.soundGrid}>
                {[
                  { name: 'Standing Applause 👏', emoji: '👏' },
                  { name: 'Cheering Crowd 🎉', emoji: '🎉' },
                  { name: 'Theater Laughter 😂', emoji: '😂' },
                  { name: 'Suspense Drumroll 🥁', emoji: '🥁' },
                ].map(snd => (
                  <TouchableOpacity
                    key={snd.name}
                    style={styles.soundCard}
                    onPress={() => triggerSoundEffect(snd.name, snd.emoji)}
                  >
                    <Text style={{ fontSize: 24 }}>{snd.emoji}</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2d3748', marginTop: 4 }}>{snd.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* CO-HOST MODAL */}
        <Modal visible={showCoHostModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👥 Co-Host Dual-Screen Link</Text>
                <TouchableOpacity onPress={() => setShowCoHostModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Invite a guest creator onto your live broadcast stream:</Text>
              
              <View style={{ backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>{coHostName}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: coHostConnected ? '#e53e3e' : '#38a169', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => {
                    setCoHostConnected(!coHostConnected);
                    setShowCoHostModal(false);
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{coHostConnected ? 'Disconnect' : 'Connect Co-Host'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* HOST CONTROLS MODAL */}
        <Modal visible={showHostControlsModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🛡️ Host Moderation Controls</Text>
                <TouchableOpacity onPress={() => setShowHostControlsModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              
              <View style={{ gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={styles.controlActionBtn} onPress={() => Alert.alert('Chat Locked 🔒', 'Chat messages have been temporarily disabled for viewers.')}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Lock / Mute Chat 🔒</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlActionBtn} onPress={() => Alert.alert('Auto-Mod Active 🛡️', 'Strict AI spam filter active.')}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>AI Spam Shield Status: Active 🟢</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlActionBtn, { backgroundColor: '#e53e3e' }]} onPress={() => { setShowHostControlsModal(false); onBack?.(); }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>End Stream for Everyone ⏹️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', position: 'relative' },
  darkContainer: { backgroundColor: '#0f172a' },
  darkScrimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 },
  coHostSplitContainer: { position: 'absolute', top: 125, left: 15, right: 15, height: 150, zIndex: 5, borderRadius: 10, overflow: 'hidden', flexDirection: 'row', borderWidth: 2, borderColor: '#3182ce' },
  
  monetizationAdOverlay: { position: 'absolute', top: 32, alignSelf: 'center', zIndex: 30, alignItems: 'center' },

  topHeader: { position: 'absolute', top: 80, left: 15, right: 15, zIndex: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hostBadgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20 },
  hostAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  hostNameText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  viewerCountText: { color: '#cbd5e0', fontSize: 10 },
  followBtn: { backgroundColor: '#e53e3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveBadge: { backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  closeBtn: { backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  vipFrontRowBar: { position: 'absolute', top: 130, left: 15, right: 15, zIndex: 20, flexDirection: 'row', gap: 6, alignItems: 'center' },
  vipChip: { backgroundColor: 'rgba(183,121,31,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  rewardAdPill: { backgroundColor: '#2563eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  giftBanner: { position: 'absolute', top: 165, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, zIndex: 20 },
  soundEffectBanner: { position: 'absolute', top: 200, alignSelf: 'center', backgroundColor: 'rgba(128,90,213,0.9)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, zIndex: 25 },
  autoInviteBanner: { position: 'absolute', top: 235, alignSelf: 'center', backgroundColor: 'rgba(49,130,206,0.9)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, zIndex: 25 },

  pinnedQaCard: { position: 'absolute', top: 160, left: 15, right: 80, backgroundColor: 'rgba(0,0,0,0.65)', padding: 8, borderRadius: 8, zIndex: 15, borderWidth: 1, borderColor: '#3182ce' },
  pollOverlayContainer: { position: 'absolute', top: 225, left: 15, right: 80, backgroundColor: 'rgba(0,0,0,0.75)', padding: 10, borderRadius: 10, zIndex: 15, borderWidth: 1, borderColor: '#d69e2e' },
  pollOptionRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginTop: 4 },

  floatingHeart: { position: 'absolute', bottom: 100, zIndex: 30, pointerEvents: 'none' },

  commentStreamContainer: { position: 'absolute', bottom: 70, left: 15, width: SCREEN_WIDTH * 0.68, height: 180, zIndex: 20 },
  aiCaptionsBox: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 6, marginBottom: 6 },
  aiCaptionText: { color: '#68d391', fontSize: 10, fontStyle: 'italic', fontWeight: 'bold' },
  commentScroll: { flex: 1 },
  commentBubble: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 6, alignSelf: 'flex-start', maxWidth: '100%' },
  commentUser: { color: '#90cdf4', fontSize: 11, fontWeight: 'bold' },
  commentText: { color: '#fff', fontSize: 12 },

  rightSidebar: { position: 'absolute', bottom: 75, right: 12, zIndex: 20, alignItems: 'center', gap: 10 },
  sidebarButton: { alignItems: 'center' },
  sidebarButtonText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2, textShadowColor: '#000', textShadowRadius: 2 },

  bottomBar: { position: 'absolute', bottom: 15, left: 15, right: 15, zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 22, paddingHorizontal: 15, height: 40, color: '#fff', fontSize: 12 },
  sendChatBtn: { backgroundColor: '#3182ce', paddingHorizontal: 14, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  quickGiftBtn: { backgroundColor: 'rgba(0,0,0,0.6)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  drawerContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  closeText: { fontSize: 16, fontWeight: 'bold', color: '#718096' },
  walletBox: { backgroundColor: '#ebf8ff', padding: 8, borderRadius: 8, marginBottom: 12 },
  giftGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  giftCard: { flex: 1, backgroundColor: '#f7fafc', padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  modalOptionBtn: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', alignItems: 'center' },
  soundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  soundCard: { width: '48%', backgroundColor: '#f7fafc', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  controlActionBtn: { backgroundColor: '#3182ce', padding: 12, borderRadius: 8, alignItems: 'center' }
});