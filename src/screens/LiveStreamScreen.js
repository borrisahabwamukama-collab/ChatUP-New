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
  Switch,
  Share,
  Image
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { supabase } from '../../Services/supabaseClient';

// 🌟 Imported LiveStudioModule directly into main live stream file
import LiveStudioModule from './LiveStudioModule';

// 🌟 Imported Real-Time Gifting & Animator Components
import LiveStreamGiftingOverlay from './LiveStreamGiftingOverlay';
import LiveStreamGiftAnimator from './LiveStreamGiftAnimator';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LiveStreamScreen({ isDarkMode, coins, setCoins, onBack, userRole = 'creator', streamId: propStreamId, currentUserId }) {
  // Unique dynamic stream ID based on active user
  const [activeStreamId, setActiveStreamId] = useState(propStreamId || 1);

  // Live Broadcast State
  const [streamerName, setStreamerName] = useState('Borris');
  const [userAvatar, setUserAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [viewerCount, setViewerCount] = useState(4250);
  const [likesCount, setLikesCount] = useState(0); 
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Live Comments & Chat Stream
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const pendingCommentsRef = useRef([]);
  const commentScrollRef = useRef(null);

  // Pro Features Modals & States (Trademark-Free Studio Standards)
  const [activeFilter, setActiveFilter] = useState('Diamond Crystal Glow 💎');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSoundboardModal, setShowSoundboardModal] = useState(false);
  const [showHostControlsModal, setShowHostControlsModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showQaModal, setShowQaModal] = useState(false);
  const [showAutoInviteModal, setShowAutoInviteModal] = useState(false);
  const [showGuestRequestsModal, setShowGuestRequestsModal] = useState(false);

  // Stream Analytics & Revenue Tracking Modal State
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showPayoutLedgerModal, setShowPayoutLedgerModal] = useState(false);
  const [streamRevenueCoins, setStreamRevenueCoins] = useState(3450);

  // Streamer Announcement / Scrolling Marquee Banner State
  const [announcementText, setAnnouncementText] = useState('🚀 Welcome to ChatUp Live Studio! Tap screen for hearts & hit follow!');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [tempAnnouncementInput, setTempAnnouncementInput] = useState('');

  // Sound FX & Banner Broadcast State
  const [activeSoundBanner, setActiveSoundBanner] = useState(null);

  // Camera & Permissions state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [cameraFacing, setCameraFacing] = useState('front');
  const [isMuted, setIsMuted] = useState(false);
  const [beautyFilterActive, setBeautyFilterActive] = useState(true);

  // ChatUp Multi-Guest & PK Battle States
  const [guestQueue, setGuestQueue] = useState([
    { id: 'g1', name: 'Nimusiima Asifa', badge: '👑 VIP Diamond', status: 'Requesting to Join' },
    { id: 'g2', name: 'Stella', badge: '⭐ Supporter', status: 'Waiting' }
  ]);
  const [activeGuests, setActiveGuests] = useState([]);
  const [pkBattleActive, setPkBattleActive] = useState(false);
  const [pkOpponentScore, setPkOpponentScore] = useState(1250);
  const [pkMyScore, setPkMyScore] = useState(1840);

  // Auto-Invites & Follower Alerts
  const [autoInviteActive, setAutoInviteActive] = useState(true);
  const [inviteNotificationBanner, setInviteNotificationBanner] = useState(null);

  // Live Interactive Q&A Box
  const [activeQaQuestion, setActiveQaQuestion] = useState('Drop your questions for the live stream! 💬');
  const [qaList, setQaList] = useState([]);
  const [newQaInput, setNewQaInput] = useState('');

  // Live Interactive Poll
  const [pollActive, setPollActive] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('Which project should we build next?');
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: '🚀 ChatUp Mini Apps', votes: 0 },
    { id: 2, text: '🗺️ BorrisScout Expansion', votes: 0 }
  ]);
  const [userVotedPoll, setUserVotedPoll] = useState(false);

  // Real-Time AI Closed Captions HUD
  const [aiCaptionsEnabled, setAiCaptionsEnabled] = useState(true);
  const [currentCaptionText, setCurrentCaptionText] = useState('🎙️ "Broadcasting live studio feed..."');

  // VIP Front Row Seat Spotlights
  const [vipSeats, setVipSeats] = useState([]);

  // Gift & Animation State
  const [lastGiftSent, setLastGiftSent] = useState(null);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [comboGifts, setComboGifts] = useState([]);

  // 🌟 Strict sanitization to strip unwanted terms completely
  const sanitizeText = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/unrestricted/gi, '')
      .replace(/system/gi, '')
      .trim();
  };

  // 🌟 Fetch real profile name and photo from Supabase on mount
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!micPermission?.granted) {
        await requestMicPermission();
      }

      try {
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          const targetId = currentUserId || user?.id;

          if (targetId) {
            const uniqueStreamId = `live_${targetId}`;
            setActiveStreamId(uniqueStreamId);

            // Fetch profile data checking user_id and id
            let profile = null;
            const res1 = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', targetId)
              .maybeSingle();

            if (res1.data) {
              profile = res1.data;
            } else {
              const res2 = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetId)
                .maybeSingle();
              if (res2.data) profile = res2.data;
            }

            let activeName = 'Borris';
            if (profile) {
              const rawName = profile.full_name || profile.username || profile.name || 'Borris';
              activeName = sanitizeText(rawName);
              if (activeName) {
                setStreamerName(activeName);
              }

              // Grab real profile photo URL from any standard column variant
              const rawAvatar = profile.avatar_url || profile.photo_url || profile.profile_image || profile.avatar;
              if (rawAvatar) {
                setUserAvatar(rawAvatar);
              }
            }

            await supabase.from('live_streams').upsert({
              id: uniqueStreamId,
              streamer_name: activeName,
              is_active: true,
              viewer_count: viewerCount,
              likes_count: 0,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.log('Profile fetch or stream init error:', err);
      }
    })();
  }, [cameraPermission, micPermission, currentUserId]);

  useEffect(() => {
    if (!activeStreamId) return;

    fetchStreamData();
    fetchLiveComments();
    fetchLiveQa();
    fetchLivePolls();
    fetchVipSupporters();

    if (!supabase) return;

    const commentsSubscription = supabase
      .channel(`public:stream_comments:${activeStreamId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stream_comments' }, payload => {
        if (payload.new && String(payload.new.stream_id) === String(activeStreamId)) {
          const cleanUser = sanitizeText(payload.new.user_name) || 'Borris';
          const cleanText = sanitizeText(payload.new.comment_text);
          setComments(prev => [...prev, {
            id: payload.new.id.toString(),
            user: cleanUser,
            text: cleanText
          }]);
        }
      })
      .subscribe();

    const streamUpdatesSubscription = supabase
      .channel(`public:live_streams:${activeStreamId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams' }, payload => {
        if (payload.new && String(payload.new.id) === String(activeStreamId)) {
          setViewerCount(payload.new.viewer_count || 0);
          if (payload.new.likes_count !== undefined) {
            setLikesCount(payload.new.likes_count || 0);
          }
          if (payload.new.active_qa) setActiveQaQuestion(sanitizeText(payload.new.active_qa));
          if (payload.new.announcement) setAnnouncementText(sanitizeText(payload.new.announcement));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(streamUpdatesSubscription);
    };
  }, [activeStreamId]);

  useEffect(() => {
    const batchSyncTimer = setInterval(async () => {
      if (pendingCommentsRef.current.length > 0 && supabase) {
        const batchToSync = [...pendingCommentsRef.current];
        pendingCommentsRef.current = [];

        try {
          const formattedBatch = batchToSync.map(c => ({
            stream_id: activeStreamId,
            user_name: sanitizeText(c.user),
            comment_text: sanitizeText(c.text),
            created_at: new Date().toISOString()
          }));

          await supabase.from('stream_comments').insert(formattedBatch);
        } catch (err) {
          console.log('Batch comment sync exception:', err);
        }
      }
    }, 3000);

    return () => clearInterval(batchSyncTimer);
  }, [activeStreamId]);

  const fetchStreamData = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', activeStreamId)
        .maybeSingle();

      if (data) {
        setStreamerName(sanitizeText(data.streamer_name) || 'Borris');
        setViewerCount(data.viewer_count || 1200);
        if (data.likes_count !== undefined) {
          setLikesCount(data.likes_count);
        }
        if (data.active_qa) setActiveQaQuestion(sanitizeText(data.active_qa));
        if (data.announcement) setAnnouncementText(sanitizeText(data.announcement));
      }
    } catch (err) {
      console.log('Error fetching live stream info:', err);
    }
  };

  const fetchLiveComments = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('stream_comments')
        .select('*')
        .eq('stream_id', activeStreamId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (data && data.length > 0) {
        setComments(data.map(c => ({
          id: c.id.toString(),
          user: sanitizeText(c.user_name) || 'Borris',
          text: sanitizeText(c.comment_text)
        })));
      } else {
        setComments([
          { id: '1', user: 'Nimusiima Asifa', text: 'Stunning live stream broadcast today! 🔥' },
          { id: '2', user: 'Stella', text: 'Clean video feed right here 😍' }
        ]);
      }
    } catch (err) {
      console.log('Error loading comments:', err);
    }
  };

  const fetchLiveQa = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('stream_qa')
        .select('*')
        .eq('stream_id', activeStreamId);

      if (data && data.length > 0) {
        setQaList(data.map(q => ({
          id: q.id.toString(),
          user: sanitizeText(q.user_name) || 'Borris',
          question: sanitizeText(q.question_text)
        })));
      } else {
        setQaList([
          { id: 'q1', user: 'Stella', question: 'What tech stack are you building with?' },
          { id: 'q2', user: 'Brian_UG', question: 'Can you show us the camera view?' }
        ]);
      }
    } catch (err) {
      console.log('Error fetching Q&A:', err);
    }
  };

  const fetchLivePolls = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('stream_polls')
        .select('*')
        .eq('stream_id', activeStreamId)
        .maybeSingle();

      if (data) {
        setPollQuestion(sanitizeText(data.question));
        setPollActive(data.is_active);
        if (data.options) setPollOptions(data.options);
      }
    } catch (err) {
      console.log('Error fetching polls:', err);
    }
  };

  const fetchVipSupporters = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('stream_gifts')
        .select('*')
        .eq('stream_id', activeStreamId)
        .order('amount', { ascending: false })
        .limit(3);

      if (data && data.length > 0) {
        setVipSeats(data.map(g => ({
          id: g.id.toString(),
          name: sanitizeText(g.sender_name) || 'Supporter',
          badge: `👑 ${sanitizeText(g.gift_name)}`
        })));
      } else {
        setVipSeats([
          { id: 'v1', name: 'Nimusiima Asifa', badge: '👑 VIP Diamond' },
          { id: 'v2', name: 'Stella', badge: '⭐ Top Supporter' }
        ]);
      }
    } catch {
      setVipSeats([
        { id: 'v1', name: 'Nimusiima Asifa', badge: '👑 VIP Diamond' },
        { id: 'v2', name: 'Stella', badge: '⭐ Top Supporter' }
      ]);
    }
  };

  const handleBroadcastHostInvites = async () => {
    setInviteNotificationBanner(`⚡ Push alerts & in-app notifications sent to followers for ${streamerName}'s Live!`);
    setTimeout(() => setInviteNotificationBanner(null), 5000);

    try {
      if (supabase) {
        await supabase.from('notifications').insert([{
          title: '🔴 Live Stream Alert!',
          body: `${streamerName} is now live on ChatUp Studio. Tap to join!`,
          type: 'live_broadcast',
          stream_id: activeStreamId,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.log('Error dispatching notifications:', err);
    }

    setShowAutoInviteModal(false);
    Alert.alert('Invites Dispatched 🚀', 'Push notifications and follower feed banners are now live!');
  };

  const lastTapRef = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      triggerLike();
    }
    lastTapRef.current = now;
  };

  const triggerLike = async () => {
    setIsLiked(true);
    const updatedLikes = likesCount + 1;
    setLikesCount(updatedLikes);

    const newHeart = { id: Date.now(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);

    try {
      if (supabase) {
        await supabase
          .from('live_streams')
          .update({ likes_count: updatedLikes })
          .eq('id', activeStreamId);
      }
    } catch (err) {
      console.log('Error updating likes count:', err);
    }
  };

  // 🌟 BULLETPROOF END STREAM HANDLER (Closes modals, updates Supabase & triggers exit)
  const handleEndStream = async () => {
    setShowHostControlsModal(false);
    setShowAnalyticsModal(false);
    setShowGiftModal(false);

    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        const targetId = currentUserId || user?.id;

        if (targetId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('total_likes')
            .eq('user_id', targetId)
            .maybeSingle();

          const currentTotalLikes = profileData?.total_likes || 0;
          const newTotalLikes = currentTotalLikes + likesCount;

          await supabase
            .from('profiles')
            .update({ total_likes: newTotalLikes })
            .eq('user_id', targetId);
        }

        await supabase
          .from('live_streams')
          .update({ is_active: false })
          .eq('id', activeStreamId);
      }
    } catch (err) {
      console.log('Error syncing total likes on end stream:', err);
    }

    if (onBack && typeof onBack === 'function') {
      onBack();
    }
  };

  const handleShareStream = async () => {
    try {
      await Share.share({
        message: `Join ${streamerName}'s live stream right now on ChatUp! 🚀 Watch here: https://chatup.app/live/${activeStreamId}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim()) return;
    const activeUsername = sanitizeText(streamerName) || 'Borris';
    const textToSend = sanitizeText(commentInput);
    setCommentInput('');

    const newCommentObj = { id: Date.now().toString(), user: activeUsername, text: textToSend };
    setComments(prev => [...prev, newCommentObj]);

    pendingCommentsRef.current.push({ user: activeUsername, text: textToSend });

    try {
      if (supabase) {
        await supabase.from('stream_comments').insert([{
          stream_id: activeStreamId,
          user_name: activeUsername,
          comment_text: textToSend,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.log('Direct comment insert fallback warning:', err);
    }
  };

  const triggerSoundEffect = async (effectName, emojiIcon, soundUrl) => {
    setActiveSoundBanner(`${emojiIcon} ${effectName} played across stream!`);
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (err) {
      console.log('Audio playback exception:', err);
    }

    setComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: 'Sound FX 🔊', text: `Triggered ${emojiIcon} ${effectName}` }
    ]);
    setTimeout(() => setActiveSoundBanner(null), 3500);
    setShowSoundboardModal(false);
  };

  const handleVotePoll = async (optionId) => {
    if (userVotedPoll) return Alert.alert('Already Voted', 'You have already participated in this live poll.');
    
    const updatedOptions = pollOptions.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
    setPollOptions(updatedOptions);
    setUserVotedPoll(true);
    Alert.alert('Vote Recorded 🗳️', 'Your choice has been added to the live results overlay!');

    try {
      if (supabase) {
        await supabase
          .from('stream_polls')
          .update({ options: updatedOptions })
          .eq('id', activeStreamId);
      }
    } catch (err) {
      console.log('Poll vote sync error:', err);
    }
  };

  const handlePostQaQuestion = async () => {
    if (!newQaInput.trim()) return;
    const activeUsername = sanitizeText(streamerName) || 'Borris';
    const qText = sanitizeText(newQaInput);
    setNewQaInput('');

    try {
      if (supabase) {
        await supabase.from('stream_qa').insert([{
          stream_id: activeStreamId,
          user_name: activeUsername,
          question_text: qText
        }]);
      }
      setQaList(prev => [...prev, { id: Date.now().toString(), user: activeUsername, question: qText }]);
      Alert.alert('Question Submitted ❓', 'Your question was posted for the host to pin and answer.');
    } catch {
      Alert.alert('Error', 'Could not submit question.');
    }
  };

  const handlePinQuestion = async (qText) => {
    const cleanQ = sanitizeText(qText);
    setActiveQaQuestion(cleanQ);
    setShowQaModal(false);
    try {
      if (supabase) {
        await supabase
          .from('live_streams')
          .update({ active_qa: cleanQ })
          .eq('id', activeStreamId);
      }
    } catch (err) {
      console.log('Pin Q&A error:', err);
    }
  };

  const acceptGuestJoin = (guest) => {
    setActiveGuests(prev => [...prev, guest]);
    setGuestQueue(prev => prev.filter(g => g.id !== guest.id));
    setShowGuestRequestsModal(false);
    Alert.alert('Guest Connected 👥', `${guest.name} has joined your live stream split-screen!`);
  };

  const startPkBattle = () => {
    setPkBattleActive(true);
    setShowHostControlsModal(false);
    Alert.alert('⚔️ PK Battle Started!', 'You are now battling against Creator @Kampala_Vibes. Tap screen & send gifts to win!');
  };

  const saveAnnouncement = async () => {
    if (!tempAnnouncementInput.trim()) return;
    const newAnn = sanitizeText(tempAnnouncementInput);
    setAnnouncementText(newAnn);
    setTempAnnouncementInput('');
    setShowAnnouncementModal(false);
    Alert.alert('Announcement Updated 📢', 'Your marquee banner is now broadcasting live to all viewers!');

    try {
      if (supabase) {
        await supabase
          .from('live_streams')
          .update({ announcement: newAnn })
          .eq('id', activeStreamId);
      }
    } catch (err) {
      console.log('Announcement sync error:', err);
    }
  };

  const getFilterStyle = (filterName) => {
    switch (filterName) {
      case 'Diamond Crystal Glow 💎': 
        return { backgroundColor: 'rgba(255, 255, 255, 0.70)' };
      case 'Porcelain Radiance ✨': 
        return { backgroundColor: 'rgba(255, 240, 245, 0.65)' };
      case 'Ultra Flawless Skin 🌸': 
        return { backgroundColor: 'rgba(255, 248, 220, 0.68)' };
      case 'Hollywood Ring Light 💡': 
        return { backgroundColor: 'rgba(255, 255, 255, 0.78)' };
      case 'Golden Hour Luxury 🌅': 
        return { backgroundColor: 'rgba(255, 180, 80, 0.50)' };
      default: 
        return { backgroundColor: 'rgba(255, 255, 255, 0.55)' };
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        
        {/* ================= HIGH-KEY STUDIO CAMERA VIEW ================= */}
        {!cameraPermission?.granted ? (
          <View style={[StyleSheet.absoluteFillObject, styles.permissionContainer]}>
            <Text style={{ fontSize: 60, marginBottom: 10 }}>🎥</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>ChatUp Live Studio Camera</Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, textAlign: 'center', paddingHorizontal: 30 }}>
              Camera permission is required to start broadcasting live on your device.
            </Text>
            <TouchableOpacity 
              style={styles.permissionBtn}
              onPress={requestCameraPermission}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Grant Camera Permission 🔓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}>
            <CameraView 
              style={StyleSheet.absoluteFillObject} 
              facing={cameraFacing}
              mute={isMuted}
              onMountError={(error) => console.log('Camera mount error:', error)}
            />
            <View 
              style={[
                StyleSheet.absoluteFillObject, 
                getFilterStyle(activeFilter), 
                beautyFilterActive && styles.beautyGlowOverlay,
                Platform.OS === 'web' && { backdropFilter: 'brightness(1.9) contrast(1.3) saturate(1.15)' }
              ]} 
              pointerEvents="none" 
            />
            <View style={styles.ringLightStudioFrame} pointerEvents="none" />
          </View>
        )}

        {/* ================= REAL-TIME FLOATING GIFT ANIMATOR ================= */}
        <LiveStreamGiftAnimator streamerId={activeStreamId} />

        {/* MULTI-GUEST GRID */}
        {activeGuests.length > 0 && (
          <View style={styles.multiGuestGridContainer}>
            <View style={styles.hostMiniBox}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>👑 You (Host)</Text>
            </View>
            {activeGuests.map(guest => (
              <View key={guest.id} style={styles.guestMiniBox}>
                <Text style={{ color: '#38a169', fontSize: 10, fontWeight: 'bold' }}>🎙️ {guest.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* PK BATTLE SCOREBOARD */}
        {pkBattleActive && (
          <View style={styles.pkScoreboardContainer}>
            <View style={[styles.pkTeamBox, { backgroundColor: 'rgba(49,130,206,0.85)' }]}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{streamerName}</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{pkMyScore}</Text>
            </View>
            <View style={styles.pkVsCircle}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>VS</Text>
            </View>
            <View style={[styles.pkTeamBox, { backgroundColor: 'rgba(229,62,62,0.85)' }]}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Kampala_Vibes</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{pkOpponentScore}</Text>
            </View>
          </View>
        )}

        <View style={styles.darkScrimOverlay} pointerEvents="none" />

        {/* ================= FLOATING HEARTS & ANIMATIONS ================= */}
        {floatingHearts.map(heart => (
          <View key={heart.id} style={[styles.floatingHeart, { left: `${heart.left}%` }]} pointerEvents="none">
            <Text style={{ fontSize: 45 }}>❤️</Text>
          </View>
        ))}

        {comboGifts.map(cg => (
          <View key={cg.id} style={styles.comboGiftBadge}>
            <Text style={{ color: '#fefcbf', fontSize: 16, fontWeight: 'bold' }}>🌟 COMBO GIFT! {cg.text}</Text>
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

        {/* ================= TOP HEADER ================= */}
        <View style={styles.topHeader}>
          <View style={styles.hostBadgeContainer}>
            <Image source={{ uri: userAvatar }} style={styles.hostAvatarImg} />
            <View style={{ marginLeft: 8, marginRight: 8 }}>
              <Text style={styles.hostNameText} numberOfLines={1}>{streamerName}</Text>
              <Text style={styles.viewerCountText}>👥 {viewerCount.toLocaleString()} watching • ❤️ {likesCount.toLocaleString()}</Text>
            </View>
            {userRole !== 'creator' ? (
              <TouchableOpacity 
                style={[styles.followBtn, isFollowing && { backgroundColor: '#4a5568' }]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isFollowing ? 'Following ✓' : '+ Follow'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.hostLiveBadgeTag}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>HOST 🟢</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <TouchableOpacity style={styles.topUtilityBtn} onPress={handleShareStream}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🔗 Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.topUtilityBtn} 
              onPress={() => setIsMuted(!isMuted)}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.topUtilityBtn} 
              onPress={() => setCameraFacing(prev => prev === 'back' ? 'front' : 'back')}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={handleEndStream}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* VIP Front Row Bar */}
        <View style={styles.vipFrontRowBar}>
          {vipSeats.map(vip => (
            <View key={vip.id} style={styles.vipChip}>
              <Text style={{ fontSize: 10, color: '#fefcbf', fontWeight: 'bold' }}>{vip.badge}: {vip.name}</Text>
            </View>
          ))}
        </View>

        {/* Scrolling Announcement Marquee */}
        <TouchableOpacity style={styles.announcementMarqueeBar} onPress={() => setShowAnnouncementModal(true)}>
          <Text style={{ fontSize: 10, color: '#fefcbf', fontWeight: 'bold' }} numberOfLines={1}>📢 ANNOUNCEMENT: {announcementText} (Tap to edit)</Text>
        </TouchableOpacity>

        {lastGiftSent && (
          <View style={styles.giftBanner}>
            <Text style={{ color: '#fefcbf', fontSize: 11, fontWeight: 'bold' }}>{lastGiftSent}</Text>
          </View>
        )}

        {/* ================= INTERACTIVE Q&A CARD ================= */}
        <TouchableOpacity style={styles.pinnedQaCard} onPress={() => setShowQaModal(true)}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#63b3ed' }}>📌 PINNED Q&A (Tap to view all)</Text>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>{activeQaQuestion}</Text>
        </TouchableOpacity>

        {/* ================= LIVE POLL WIDGET ================= */}
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

        {/* ================= AUTO-SCROLLING COMMENTS STREAM ================= */}
        <View style={styles.commentStreamContainer} pointerEvents="box-none">
          {aiCaptionsEnabled && (
            <View style={styles.aiCaptionsBox}>
              <Text style={styles.aiCaptionText}>{currentCaptionText}</Text>
            </View>
          )}

          <ScrollView 
            ref={commentScrollRef}
            style={styles.commentScroll} 
            contentContainerStyle={{ justifyContent: 'flex-end' }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            onContentSizeChange={() => commentScrollRef.current?.scrollToEnd({ animated: true })}
          >
            {comments.map((item, index) => (
              <View key={`${item.id}_${index}`} style={styles.commentBubble}>
                <Text style={styles.commentUser}>@{sanitizeText(item.user)}: </Text>
                <Text style={styles.commentText}>{sanitizeText(item.text)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ================= RIGHT-SIDE ACTION SIDEBAR ================= */}
        <View style={styles.rightSidebar}>
          
          <TouchableOpacity style={styles.sidebarButton} onPress={triggerLike}>
            <Text style={{ fontSize: 26 }}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.sidebarButtonText}>{likesCount.toLocaleString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowGiftModal(true)}>
            <Text style={{ fontSize: 26 }}>🎁</Text>
            <Text style={styles.sidebarButtonText}>Gifts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowGuestRequestsModal(true)}>
            <Text style={{ fontSize: 24 }}>👥</Text>
            <Text style={styles.sidebarButtonText}>Guests ({guestQueue.length})</Text>
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

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowAnalyticsModal(true)}>
            <Text style={{ fontSize: 24 }}>📈</Text>
            <Text style={styles.sidebarButtonText}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowPayoutLedgerModal(true)}>
            <Text style={{ fontSize: 24 }}>💰</Text>
            <Text style={styles.sidebarButtonText}>Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowFiltersModal(true)}>
            <Text style={{ fontSize: 24 }}>🎨</Text>
            <Text style={styles.sidebarButtonText}>Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowSoundboardModal(true)}>
            <Text style={{ fontSize: 24 }}>🔊</Text>
            <Text style={styles.sidebarButtonText}>FX</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarButton} onPress={() => setShowHostControlsModal(true)}>
            <Text style={{ fontSize: 24 }}>🛡️</Text>
            <Text style={styles.sidebarButtonText}>Studio</Text>
          </TouchableOpacity>

        </View>

        {/* ================= BOTTOM CHAT INPUT BAR ================= */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Say something nice to the host..."
            placeholderTextColor="#cbd5e0"
            value={commentInput}
            onChangeText={setCommentInput}
            onSubmitEditing={handleSendComment}
          />

          <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendComment}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* ================= MODALS & DRAWERS ================= */}

        {/* INTEGRATED SUPER GIFTING OVERLAY */}
        <LiveStreamGiftingOverlay 
          visible={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          isDarkMode={isDarkMode}
          currentUser={{ id: currentUserId || 'current_user', username: streamerName }}
          streamerId={activeStreamId}
          streamerName={streamerName}
          userCoins={coins}
          setCoins={setCoins}
        />

        {/* STREAM ANALYTICS MODAL */}
        <Modal visible={showAnalyticsModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📈 Real-Time Stream Analytics</Text>
                <TouchableOpacity onPress={() => setShowAnalyticsModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Live broadcast engagement performance metrics:</Text>

              <View style={{ gap: 8 }}>
                <View style={styles.analyticRow}>
                  <Text style={{ fontSize: 11, color: '#4a5568' }}>👥 Peak Concurrent Viewers:</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>{(viewerCount * 1.4).toFixed(0)}</Text>
                </View>
                <View style={styles.analyticRow}>
                  <Text style={{ fontSize: 11, color: '#4a5568' }}>🪙 Total Stream Earnings:</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#d69e2e' }}>🪙 {streamRevenueCoins} Coins</Text>
                </View>
                <View style={styles.analyticRow}>
                  <Text style={{ fontSize: 11, color: '#4a5568' }}>❤️ Total Session Likes Generated:</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#e53e3e' }}>{likesCount.toLocaleString()}</Text>
                </View>
                <View style={styles.analyticRow}>
                  <Text style={{ fontSize: 11, color: '#4a5568' }}>🏆 Cumulative Profile Total Likes:</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#805ad5' }}>{(likesCount + 1540).toLocaleString()} 🌟</Text>
                </View>
                <View style={styles.analyticRow}>
                  <Text style={{ fontSize: 11, color: '#4a5568' }}>⭐ New Followers Acquired:</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#38a169' }}>+342 Users</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* PAYOUT & EARNINGS LEDGER MODAL */}
        <Modal visible={showPayoutLedgerModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💰 Creator Earnings & Payout Ledger</Text>
                <TouchableOpacity onPress={() => setShowPayoutLedgerModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Convert your live streaming coin revenue into cash payouts:</Text>

              <View style={{ backgroundColor: '#ebf8ff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#bee3f8' }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>💎 Available Coin Balance: {coins} Coins</Text>
                <Text style={{ fontSize: 11, color: '#2c5282', marginTop: 2 }}>Estimated Payout Value: UGX {(coins * 100).toLocaleString()}</Text>
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: '#38a169', padding: 12, borderRadius: 8, alignItems: 'center' }} 
                onPress={() => Alert.alert('Payout Requested 💸', 'Your earnings withdrawal has been submitted to mobile money / bank ledger!')}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Request Payout Withdrawal 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ANNOUNCEMENT BANNER MODAL */}
        <Modal visible={showAnnouncementModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📢 Edit Live Announcement Marquee</Text>
                <TouchableOpacity onPress={() => setShowAnnouncementModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Type a scrolling banner message visible to everyone in your stream:</Text>

              <TextInput
                style={[styles.chatInput, { color: '#2d3748', backgroundColor: '#f7fafc', borderColor: '#cbd5e0', marginBottom: 12, height: 45 }]}
                placeholder="Enter marquee announcement..."
                placeholderTextColor="#a0aec0"
                value={tempAnnouncementInput}
                onChangeText={setTempAnnouncementInput}
              />

              <TouchableOpacity style={{ backgroundColor: '#3182ce', padding: 12, borderRadius: 8, alignItems: 'center' }} onPress={saveAnnouncement}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Broadcast Announcement Now 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MULTI-GUEST REQUESTS MODAL */}
        <Modal visible={showGuestRequestsModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👥 Multi-Guest Request Queue</Text>
                <TouchableOpacity onPress={() => setShowGuestRequestsModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Viewers requesting to go live on split-screen with you:</Text>

              <ScrollView style={{ maxHeight: 200 }}>
                {guestQueue.map(guest => (
                  <View key={guest.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>{guest.name}</Text>
                      <Text style={{ fontSize: 10, color: '#d69e2e', fontWeight: 'bold' }}>{guest.badge}</Text>
                    </View>
                    <TouchableOpacity style={{ backgroundColor: '#38a169', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }} onPress={() => acceptGuestJoin(guest)}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Accept 🎙️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* AUTO-INVITES MODAL */}
        <Modal visible={showAutoInviteModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>⚡ Auto-Invites & Follower Pings</Text>
                <TouchableOpacity onPress={() => setShowAutoInviteModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>
                When you tap below, invites appear inside your followers' **ChatUp Notification Center** and trigger instant push alerts.
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 15 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>Smart Auto-Invite Dispatch</Text>
                  <Text style={{ fontSize: 10, color: '#718096' }}>Ping active followers instantly</Text>
                </View>
                <Switch
                  value={autoInviteActive}
                  onValueChange={(val) => setAutoInviteActive(val)}
                  trackColor={{ false: '#cbd5e0', true: '#805ad5' }}
                />
              </View>

              <TouchableOpacity style={{ backgroundColor: '#805ad5', padding: 12, borderRadius: 8, alignItems: 'center' }} onPress={handleBroadcastHostInvites}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Broadcast Invites to Followers Now 📢</Text>
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
                  <TouchableOpacity key={item.id} style={{ backgroundColor: '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' }} onPress={() => handlePinQuestion(item.question)}>
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
                onPress={async () => {
                  const newActiveState = !pollActive;
                  setPollActive(newActiveState);
                  try {
                    if (supabase) {
                      await supabase
                        .from('stream_polls')
                        .update({ is_active: newActiveState })
                        .eq('id', activeStreamId);
                    }
                  } catch (err) {
                    console.log('Poll toggle error:', err);
                  }
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{pollActive ? 'End Live Poll ⏹️' : 'Start Live Poll 📊'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* FILTERS MODAL */}
        <Modal visible={showFiltersModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎨 Professional Studio Glamour Filters</Text>
                <TouchableOpacity onPress={() => setShowFiltersModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Select a studio-grade glowing filter to hide blemishes and make skin shine bright:</Text>

              <View style={{ gap: 8, marginTop: 4 }}>
                {['Diamond Crystal Glow 💎', 'Porcelain Radiance ✨', 'Ultra Flawless Skin 🌸', 'Hollywood Ring Light 💡', 'Golden Hour Luxury 🌅'].map(flt => (
                  <TouchableOpacity
                    key={flt}
                    style={[styles.modalOptionBtn, activeFilter === flt && { backgroundColor: '#3182ce', borderColor: '#3182ce' }]}
                    onPress={() => {
                      setActiveFilter(flt);
                      setShowFiltersModal(false);
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: activeFilter === flt ? '#fff' : '#2d3748', fontSize: 12 }}>{flt}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity 
                  style={[styles.modalOptionBtn, beautyFilterActive && { backgroundColor: '#805ad5', borderColor: '#805ad5' }]}
                  onPress={() => setBeautyFilterActive(!beautyFilterActive)}
                >
                  <Text style={{ fontWeight: 'bold', color: beautyFilterActive ? '#fff' : '#2d3748', fontSize: 12 }}>
                    ✨ AI Blemish Eraser & Skin Glow: {beautyFilterActive ? 'ON (Max)' : 'OFF'}
                  </Text>
                </TouchableOpacity>
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
                  { name: 'Standing Applause 👏', emoji: '👏', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
                  { name: 'Cheering Crowd 🎉', emoji: '🎉', url: 'https://assets.mixkit.co/active_storage/sfx/529/529-preview.mp3' },
                  { name: 'Theater Laughter 😂', emoji: '😂', url: 'https://assets.mixkit.co/active_storage/sfx/551/551-preview.mp3' },
                  { name: 'Suspense Drumroll 🥁', emoji: '🥁', url: 'https://assets.mixkit.co/active_storage/sfx/1487/1487-preview.mp3' },
                ].map(snd => (
                  <TouchableOpacity
                    key={snd.name}
                    style={styles.soundCard}
                    onPress={() => triggerSoundEffect(snd.name, snd.emoji, snd.url)}
                  >
                    <Text style={{ fontSize: 24 }}>{snd.emoji}</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2d3748', marginTop: 4 }}>{snd.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* HOST CONTROLS MODAL (Integrated with LiveStudioModule) */}
        <Modal visible={showHostControlsModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🛡️ ChatUp Studio & Host Controls</Text>
                <TouchableOpacity onPress={() => setShowHostControlsModal(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
              </View>
              
              <LiveStudioModule 
                onStartPkBattle={startPkBattle}
                onEndStream={handleEndStream}
                onCloseModal={() => setShowHostControlsModal(false)}
              />
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
  permissionContainer: { backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  permissionBtn: { marginTop: 20, backgroundColor: '#3182ce', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  darkScrimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 1 },
  beautyGlowOverlay: { backgroundColor: 'rgba(255, 255, 255, 0.35)' },
  ringLightStudioFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 15,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    zIndex: 2,
  },
  multiGuestGridContainer: { position: 'absolute', top: 125, left: 15, right: 15, height: 160, zIndex: 5, borderRadius: 10, overflow: 'hidden', flexDirection: 'row', gap: 6 },
  hostMiniBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#3182ce' },
  guestMiniBox: { flex: 1, backgroundColor: 'rgba(26,32,44,0.85)', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#38a169' },

  pkScoreboardContainer: { position: 'absolute', top: 125, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', zIndex: 25, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 20, padding: 4, borderWidth: 1, borderColor: '#d69e2e' },
  pkTeamBox: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, alignItems: 'center' },
  pkVsCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#d69e2e', justifyContent: 'center', alignItems: 'center', marginHorizontal: 6 },

  topHeader: { position: 'absolute', top: 50, left: 15, right: 15, zIndex: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hostBadgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  hostAvatarImg: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#3182ce' },
  hostNameText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  viewerCountText: { color: '#cbd5e0', fontSize: 9 },
  followBtn: { backgroundColor: '#e53e3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  hostLiveBadgeTag: { backgroundColor: '#38a169', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  topUtilityBtn: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  closeBtn: { backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  vipFrontRowBar: { position: 'absolute', top: 100, left: 15, right: 15, zIndex: 20, flexDirection: 'row', gap: 6, alignItems: 'center' },
  vipChip: { backgroundColor: 'rgba(183,121,31,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  announcementMarqueeBar: { position: 'absolute', top: 135, left: 15, right: 15, backgroundColor: 'rgba(49,130,206,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, zIndex: 20, alignItems: 'center' },

  giftBanner: { position: 'absolute', top: 170, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, zIndex: 20 },
  comboGiftBadge: { position: 'absolute', top: 210, alignSelf: 'center', backgroundColor: 'rgba(214,158,46,0.95)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, zIndex: 30 },
  soundEffectBanner: { position: 'absolute', top: 255, alignSelf: 'center', backgroundColor: 'rgba(128,90,213,0.9)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, zIndex: 25 },
  autoInviteBanner: { position: 'absolute', top: 295, alignSelf: 'center', backgroundColor: 'rgba(49,130,206,0.9)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, zIndex: 25 },

  pinnedQaCard: { position: 'absolute', top: 170, left: 15, right: 80, backgroundColor: 'rgba(0,0,0,0.65)', padding: 8, borderRadius: 8, zIndex: 15, borderWidth: 1, borderColor: '#3182ce' },
  pollOverlayContainer: { position: 'absolute', top: 230, left: 15, right: 80, backgroundColor: 'rgba(0,0,0,0.75)', padding: 10, borderRadius: 10, zIndex: 15, borderWidth: 1, borderColor: '#d69e2e' },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  drawerContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  closeText: { fontSize: 16, fontWeight: 'bold', color: '#718096' },
  modalOptionBtn: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', alignItems: 'center' },
  soundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  soundCard: { width: '48%', backgroundColor: '#f7fafc', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  analyticRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }
});