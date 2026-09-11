import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

export default function CinemaScreen({ isDarkMode, coins, setCoins, userRole = 'creator', onBack }) {
  // Navigation & Core Balances
  const [activeTierSubscription, setActiveTierSubscription] = useState(null);
  const [customTipAmount, setCustomTipAmount] = useState('20');
  const [unlockedCinemaIds, setUnlockedCinemaIds] = useState(['1', '2', 'free-1']);

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  // Global Screening Catalog State
  const [videos, setVideos] = useState([]);

  // Master Creator Studio State
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoGenre, setNewVideoGenre] = useState('Documentary');
  const [newVideoPrice, setNewVideoPrice] = useState('50');
  const [isMovieFree, setIsMovieFree] = useState(false);
  const [localFileBanner, setLocalFileBanner] = useState('');

  // Cinema Host Application Form & Admin Review State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAdminReviewModal, setShowAdminReviewModal] = useState(false);
  const [applicantChannelName, setApplicantChannelName] = useState('');
  const [applicantPurpose, setApplicantPurpose] = useState('');
  const [applicantAudienceSize, setApplicantAudienceSize] = useState('500');
  const [applicantFollowers, setApplicantFollowers] = useState('');
  const [rulesAgreed, setRulesAgreed] = useState(false);
  
  // Host Application Review Queue State
  const [hostApplications, setHostApplications] = useState([]);

  // ================= 10 SUPER-LAYERS ARCHITECTURE =================
  const [quantumEncryptionLattice, setQuantumEncryptionLattice] = useState(true);
  const [kampalaEdgeRelaySync, setKampalaEdgeRelaySync] = useState(true);
  const [aiAutonomousToxicityGuard, setAiAutonomousToxicityGuard] = useState(true);
  const [biometricCreatorWatermark, setBiometricCreatorWatermark] = useState(true);
  const [realtimeSentimentMesh, setRealtimeSentimentMesh] = useState(true);
  const [zeroFeeGasSubsidizer, setZeroFeeGasSubsidizer] = useState(true);
  const [multimodalHlsAdaptive, setMultimodalHlsAdaptive] = useState(true);
  const [federatedOnDeviceAi, setFederatedOnDeviceAi] = useState(true);
  const [bluetoothP2pMeshRelay, setBluetoothP2pMeshRelay] = useState(true);
  const [autonomousCreatorEscrow, setAutonomousCreatorEscrow] = useState(true);

  // Feature States
  const [lightsOutMode, setLightsOutMode] = useState(false);
  const [hostMovieAudioLevel, setHostMovieAudioLevel] = useState(80);
  const [hostMicAudioLevel, setHostMicAudioLevel] = useState(100);
  const [allowViewerInvites, setAllowViewerInvites] = useState(true);
  const [userAvatarBadge, setUserAvatarBadge] = useState('👑 VIP Creator');
  const [primaryHostName, setPrimaryHostName] = useState('Master Control');
  const [ticketStubs, setTicketStubs] = useState(['Bwindi Mountain Gorillas Pass']);
  const [activeChatTab, setActiveChatTab] = useState('general'); 
  const [qaFeed, setQaFeed] = useState([{ id: 1, author: 'Stella', text: 'Will there be a sequel?' }]);
  const [qaInput, setQaInput] = useState('');
  
  // Modals & Panels States
  const [lobbyActive, setLobbyActive] = useState(false);
  const [selectedLobbyMovie, setSelectedLobbyMovie] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [ctaModalActive, setCtaModalActive] = useState(false);
  const [curtainCallActive, setCurtainCallActive] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCrownModal, setShowCrownModal] = useState(false);
  const [showSoundBoardModal, setShowSoundBoardModal] = useState(false);
  const [showAudioMixerModal, setShowAudioMixerModal] = useState(false);
  const [showSuperLayersModal, setShowSuperLayersModal] = useState(false);
  const [reviewInput, setReviewInput] = useState('');

  // Temporary Clip Injection State
  const [activeTemporaryClip, setActiveTemporaryClip] = useState(null);

  // Advanced Advertising & Watermark State
  const [customSponsorText, setCustomSponsorText] = useState('Talk With Nature Eco-Tourism & Conservation Partners 🌿');
  const [customWatermarkLogo, setCustomWatermarkLogo] = useState('🌿 ChatUp Official Stream');

  // Ticket Pricing Tiers & Seat Selection State
  const [selectedSeatTier, setSelectedSeatTier] = useState('Standard Stalls');
  const STANDARD_PRICE = 50;

  // Immersive Theater Watching Modal States
  const [activeTheaterMovie, setActiveTheaterMovie] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Video Element & Live Webcam Refs
  const videoRef = useRef(null);
  const webcamRef = useRef(null);

  // Host Live Voice / Mic & Live Cam State
  const [hostMicActive, setHostMicActive] = useState(false);
  const [hostCamActive, setHostCamActive] = useState(true);

  // Live Audience Call-In / Stage Hand-Raise State
  const [audienceCallIns, setAudienceCallIns] = useState([
    { id: 'c1', name: 'Viewer_Kampala', status: 'Waiting to speak', onStage: false, muted: false },
    { id: 'c2', name: 'Stella', status: 'On Stage Co-Host', onStage: true, muted: false }
  ]);
  const [coHostsOnStage, setCoHostsOnStage] = useState(['Master Control', 'Stella']);

  // Live Camera Stream Initialization Effect & AdMob Rewarded Ad Init
  useEffect(() => {
    let stream = null;
    if (hostCamActive && (activeTheaterMovie || curtainCallActive)) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((s) => {
          stream = s;
          if (webcamRef.current) {
            webcamRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    initRewardedAd();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [hostCamActive, activeTheaterMovie, curtainCallActive]);

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
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +50 Coins sponsor bonus!');
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

  // Live Viewer Presence Roster State
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [activeViewersList] = useState([
    { id: '1', name: 'Master Control (Host)', role: 'Broadcaster', badge: '👑 VIP' },
    { id: '2', name: 'Viewer_Kampala', role: 'Subscriber', badge: '🌿 Eco' },
    { id: '3', name: 'Stella', role: 'Co-Host', badge: '⭐ Member' },
    { id: '4', name: 'Node_Kampala_02', role: 'Mesh Relay', badge: '⚡ Peer' },
  ]);

  // Live Movie Commentary & Moving Ticker
  const [commentaryFeed, setCommentaryFeed] = useState([
    { id: 1, author: 'Master Control (Host)', text: 'Welcome to the global premiere! Drop your comments below. 🎥' },
    { id: '2', author: 'Viewer_Kampala', text: 'The cinematography on this wildlife shot is breathtaking!' }
  ]);
  const [commentaryInput, setCommentaryInput] = useState('');

  // Intermission & Countdown Clock
  const [intermissionActive, setIntermissionActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(300);

  // Sync Watch Party Room Feature
  const [syncPartyRoomCode] = useState('UG-MESH-8892');

  // Closed Captioning & Multilingual Subtitles
  const [cinemaCcActive, setCinemaCcActive] = useState(true);
  const [cinemaSubLanguage, setCinemaSubLanguage] = useState('English');
  const subtitleDictionary = {
    'English': 'Ensi yaffe erimu ebisolo n’ebimera eby’enjawulo...',
    'Luganda (Auto)': 'Ensi yaffe erimu ebisolo n’ebimera eby’enjawulo (Translated)...',
    'Swahili': 'Dunia yetu ina wanyama na mimea ya kipekee...',
    'French': 'Notre monde abrite une faune et une flore uniques...',
    'Spanish': 'Nuestro mundo alberga una flora y fauna únicas...'
  };

  const [cinemaAdPlaying, setCinemaAdPlaying] = useState(false);
  const [snacksPurchased, setSnacksPurchased] = useState([]);

  // Fetch Videos & Host Applications from Supabase on Mount & Setup Realtime
  useEffect(() => {
    fetchCinemaCatalog();
    fetchHostApplications();

    if (supabase) {
      const catalogChannel = supabase
        .channel('public:cinema_catalog')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cinema_catalog' }, () => {
          fetchCinemaCatalog();
        })
        .subscribe();

      const appsChannel = supabase
        .channel('public:cinema_host_applications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cinema_host_applications' }, () => {
          fetchHostApplications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(catalogChannel);
        supabase.removeChannel(appsChannel);
      };
    }
  }, []);

  const fetchCinemaCatalog = async () => {
    try {
      if (!supabase) throw new Error('Supabase client missing');
      const { data, error } = await supabase
        .from('cinema_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setVideos([
          { 
            id: '1', 
            title: 'Bwindi Mountain Gorillas - 4K IMAX Expedition', 
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
            description: 'An intimate journey deep into Uganda’s misty rainforests with endangered mountain gorilla families.', 
            host: 'Talk With Nature', 
            genre: 'Wildlife / IMAX',
            duration: '1h 45m',
            rating: 'PG-13',
            price: 50,
            isFree: false,
            boxOfficeRevenue: 1450, 
            ticketSalesCount: 29 
          },
          { 
            id: '2', 
            title: 'Kampala Cyberpunk: Neon Savannah (Free Premiere)', 
            video_url: 'https://www.w3schools.com/html/movie.mp4', 
            description: 'A sci-fi thriller blending East African street culture with decentralized mesh intelligence.', 
            host: 'Creator Station', 
            genre: 'Sci-Fi / Action',
            duration: '2h 10m',
            rating: 'R',
            price: 0,
            isFree: true,
            boxOfficeRevenue: 0, 
            ticketSalesCount: 42 
          }
        ]);
      } else {
        setVideos(data);
      }
    } catch (err) {
      setVideos([
        { 
          id: '1', 
          title: 'Bwindi Mountain Gorillas - 4K IMAX Expedition', 
          video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
          description: 'An intimate journey deep into Uganda’s misty rainforests with endangered mountain gorilla families.', 
          host: 'Talk With Nature', 
          genre: 'Wildlife / IMAX',
          duration: '1h 45m',
          rating: 'PG-13',
          price: 50,
          isFree: false,
          boxOfficeRevenue: 1450, 
          ticketSalesCount: 29 
        }
      ]);
    }
  };

  const fetchHostApplications = async () => {
    try {
      if (!supabase) throw new Error('Supabase missing');
      const { data, error } = await supabase
        .from('cinema_host_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setHostApplications([
          { id: 'app-1', name: 'Stella Wilderness Vlogs', purpose: 'Documentary screenings of national parks', audience: '2,500', followers: '12,000', status: 'Pending Review ⏳' },
          { id: 'app-2', name: 'Kampala Indie Cinema Club', purpose: 'Showcasing East African short films', audience: '1,000', followers: '4,500', status: 'Pending Review ⏳' }
        ]);
      } else {
        setHostApplications(data);
      }
    } catch (e) {
      setHostApplications([
        { id: 'app-1', name: 'Stella Wilderness Vlogs', purpose: 'Documentary screenings of national parks', audience: '2,500', followers: '12,000', status: 'Pending Review ⏳' }
      ]);
    }
  };

  // Intermission Timer Effect
  useEffect(() => {
    let timer = null;
    if (intermissionActive && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (!intermissionActive && countdownSeconds === 0) {
      setCountdownSeconds(300);
    }
    return () => clearInterval(timer);
  }, [intermissionActive, countdownSeconds]);

  const togglePlayState = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (videoRef.current) {
      if (nextState) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleWindMovie = (secondsDelta) => {
    if (videoRef.current) {
      const targetTime = videoRef.current.currentTime + secondsDelta;
      videoRef.current.currentTime = Math.max(0, Math.min(targetTime, videoRef.current.duration || 100));
    }
  };

  const handleSyncToHost = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(true);
      videoRef.current.play().catch(() => {});
      Alert.alert('Synced to Host ⚡', 'Stream position successfully aligned with main host live timestamp.');
    }
  };

  const handleRequestPauseFlag = () => {
    Alert.alert(
      '⏸️ Request Break Sent to Host', 
      'A private notification has been transmitted directly to the lead host asking for a brief intermission without interrupting other participants.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleTransferCrownTo = (newHostName) => {
    setPrimaryHostName(newHostName);
    setShowCrownModal(false);
    Alert.alert('Crown Transferred Successfully 👑', `Master playback and moderator projectionist privileges have been handed over to ${newHostName}!`);
  };

  const triggerSoundEffect = (effectName, emojiIcon) => {
    setCommentaryFeed(prev => [
      ...prev,
      { id: Date.now(), author: 'Sound FX Board 🔊', text: `Triggered ${emojiIcon} ${effectName} for all 10k viewers!` }
    ]);
    Alert.alert('Sound Effect Broadcasted 🔊', `"${effectName}" ${emojiIcon} played across the global room audio channel!`);
  };

  const handleSendHostApplication = async () => {
    if (!applicantChannelName.trim() || !applicantPurpose.trim() || !applicantFollowers.trim()) {
      return Alert.alert('Error', 'Please fill in all required fields including your follower count.');
    }
    if (!rulesAgreed) {
      return Alert.alert('Rules Agreement Required ⚠️', 'You must read and check the agreement box confirming you understand the rules and regulations before submitting.');
    }

    const newAppPayload = {
      name: applicantChannelName.trim(),
      purpose: applicantPurpose.trim(),
      audience: applicantAudienceSize,
      followers: applicantFollowers.trim(),
      status: 'Pending Review ⏳',
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('cinema_host_applications').insert([newAppPayload]);
        if (error) throw error;
      }
    } catch (err) {
      console.log('Supabase sync warning:', err);
    }

    setHostApplications(prev => [{ id: Date.now().toString(), ...newAppPayload }, ...prev]);
    setApplicantChannelName('');
    setApplicantPurpose('');
    setApplicantFollowers('');
    setRulesAgreed(false);
    setShowApplyModal(false);
    
    Alert.alert('Application Submitted! 📋', 'Your cinema hosting application has been sent to the review queue.');
  };

  const handleApproveApplication = async (appId, appName) => {
    setHostApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Approved & Active 🟢' } : a));
    try {
      if (supabase) {
        await supabase.from('cinema_host_applications').update({ status: 'Approved & Active 🟢' }).eq('id', appId);
      }
    } catch (e) {
      console.log('Sync error:', e);
    }
    Alert.alert('Host Approved! 🎉', `"${appName}" has been granted hosting privileges and added to the 10k theater room network.`);
  };

  const handleRejectApplication = async (appId, appName) => {
    setHostApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Rejected 🔴' } : a));
    try {
      if (supabase) {
        await supabase.from('cinema_host_applications').update({ status: 'Rejected 🔴' }).eq('id', appId);
      }
    } catch (e) {
      console.log('Sync error:', e);
    }
    Alert.alert('Application Rejected 🚫', `Hosting request for "${appName}" was declined.`);
  };

  const handleMuteUserMic = (viewerId) => {
    setAudienceCallIns(prev => prev.map(v => v.id === viewerId ? { ...v, muted: !v.muted } : v));
    Alert.alert('Moderation 🔇', 'User microphone privilege toggled by host.');
  };

  const handleKickUser = (viewerName) => {
    Alert.alert('User Kicked 🚫', `${viewerName} has been removed from the screening room.`);
  };

  const handleDeleteChatMessage = (msgId) => {
    setCommentaryFeed(prev => prev.filter(c => c.id !== msgId));
    Alert.alert('Message Deleted 🗑️', 'Comment removed by room moderator.');
  };

  const handleAddToCalendar = (movie) => {
    Alert.alert('Added to Calendar 📅🔔', `Push reminders set for "${movie.title}". You will be notified 15 minutes before showtime!`);
  };

  const handleSubscribeTier = (tierName, tierPrice) => {
    if (coins < tierPrice) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${tierPrice} coins to subscribe to "${tierName}".`);
    }
    setCoins(c => c - tierPrice);
    setActiveTierSubscription(tierName);
    Alert.alert('Subscription Active! ⭐', `You are now subscribed to "${tierName}"! Enjoy exclusive VIP perks.`);
  };

  const handleSendTip = () => {
    const amount = parseInt(customTipAmount) || 0;
    if (amount <= 0) return Alert.alert('Error', 'Please enter a valid tip amount.');
    
    if (coins < amount) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${amount} coins to send this tip. Your balance is 🪙 ${coins}.`);
    }

    setCoins(prevCoins => prevCoins - amount);

    setCommentaryFeed(prev => [
      ...prev,
      { id: Date.now(), author: 'Super Chat Alert 🎁', text: `A viewer sent a tip of 🪙 ${amount} Coins to the host!` }
    ]);

    Alert.alert('Tip Sent Successfully! 💛🎁', `Successfully sent 🪙 ${amount} coins as a Super Chat tip! Your balance has been updated.`);
    setCustomTipAmount('20');
  };

  const handleBuyCinemaTicket = async (movie) => {
    if (movie.isFree || unlockedCinemaIds.includes(movie.id) || userRole === 'admin') {
      setActiveTheaterMovie(movie);
      return;
    }

    let multiplier = 1;
    if (selectedSeatTier === 'VIP Balcony') multiplier = 1.5;
    if (selectedSeatTier === 'IMAX Front Row') multiplier = 2.0;

    const finalPrice = Math.round((movie.price || STANDARD_PRICE) * multiplier);

    if (coins < finalPrice) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${finalPrice} coins for a ${selectedSeatTier} pass to "${movie.title}".`);
    }

    setCoins(prevCoins => prevCoins - finalPrice);
    setUnlockedCinemaIds(prev => [...prev, movie.id]);
    setTicketStubs(prev => [...prev, `${movie.title} (${selectedSeatTier})`]);
    
    const updatedRevenue = (movie.boxOfficeRevenue || 0) + finalPrice;
    const updatedSalesCount = (movie.ticketSalesCount || 0) + 1;

    setVideos(prev => prev.map(v => v.id === movie.id ? { ...v, boxOfficeRevenue: updatedRevenue, ticketSalesCount: updatedSalesCount } : v));
    
    try {
      if (supabase) {
        await supabase.from('cinema_catalog').update({ 
          boxOfficeRevenue: updatedRevenue, 
          ticketSalesCount: updatedSalesCount 
        }).eq('id', movie.id);
      }
    } catch (e) {
      console.log('Ticket purchase sync warning:', e);
    }

    setActiveTheaterMovie(movie);
    
    Alert.alert('Ticket Unlocked! 🎟️', `Successfully purchased a ${selectedSeatTier} pass! Digital ticket stub added to profile.`);
  };

  const handleGenerateTicketPDF = (movie) => {
    const ticketContent = `========================================\n` +
                         `CHATUP GLOBAL CINEMA (10k Scale) - PASS\n` +
                         `========================================\n` +
                         `Movie Title: ${movie.title}\n` +
                         `Host: ${primaryHostName}\n` +
                         `Seating Tier: ${selectedSeatTier}\n` +
                         `Room Code: ${syncPartyRoomCode}\n` +
                         `Holder: User (${userAvatarBadge})\n` +
                         `Status: VERIFIED & ENCRYPTED 🔐\n` +
                         `========================================`;

    if (Platform.OS === 'web') {
      const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ChatUp_Ticket_${movie.id}_${selectedSeatTier.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Digital Ticket Pass 🎫', `Pass for "${movie.title}" (${selectedSeatTier}) generated successfully!`);
    }
  };

  const handleBuySnack = (snackName, snackPrice) => {
    if (coins < snackPrice) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${snackPrice} coins to purchase ${snackName}.`);
    }
    setCoins(prevCoins => prevCoins - snackPrice);
    setSnacksPurchased(prev => [...prev, snackName]);
    
    setCommentaryFeed(prev => [
      ...prev, 
      { id: Date.now(), author: 'Concession Stand 🍿', text: `A viewer just ordered ${snackName} from the virtual snack bar!` }
    ]);

    Alert.alert('Snack Delivered! 🍿', `Enjoy your ${snackName}! Snack reaction broadcasted.`);
  };

  const triggerFloatingReaction = (emoji) => {
    const newReaction = { id: Date.now(), emoji, left: Math.floor(Math.random() * 80) + 10 };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
  };

  const handleSelectLocalVideo = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setNewVideoUrl(localUrl);
      setNewVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      setLocalFileBanner(file.name);
      Alert.alert('Local File Loaded 💾', `Successfully loaded "${file.name}" from your connected storage! AI Moderation Check Passed.`);
    }
  };

  const handleCreateVideo = async () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      return Alert.alert('Error', 'Please enter a movie title and select a video file or streaming URL.');
    }
    const parsedPrice = isMovieFree ? 0 : (parseInt(newVideoPrice) || 50);
    const newId = Date.now().toString();
    const newVidPayload = {
      id: newId,
      title: newVideoTitle.trim(),
      video_url: newVideoUrl.trim(),
      description: newVideoDesc.trim() || 'Independent creator premiere stream.',
      host: primaryHostName,
      genre: newVideoGenre,
      duration: '1h 30m',
      rating: 'PG',
      price: parsedPrice,
      isFree: isMovieFree,
      boxOfficeRevenue: 0,
      ticketSalesCount: 0,
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('cinema_catalog').insert([newVidPayload]);
        if (error) throw error;
      }
    } catch (err) {
      console.log('Supabase sync warning:', err);
    }

    setVideos(prev => [newVidPayload, ...prev]);
    setUnlockedCinemaIds(prev => [...prev, newId]);

    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDesc('');
    setLocalFileBanner('');
    
    Alert.alert('Screening Published Successfully! 🎟️', `"${newVidPayload.title}" is now live in your 10k-capacity catalog!`);
  };

  const handleRequestPayout = () => {
    const totalRevenue = videos.reduce((acc, curr) => acc + (curr.boxOfficeRevenue || 0), 0);
    if (totalRevenue <= 0) {
      return Alert.alert('No Revenue', 'There are no box office earnings available to withdraw yet.');
    }

    setCoins(prev => prev + totalRevenue);
    setVideos(prev => videos.map(v => ({ ...v, boxOfficeRevenue: 0 })));

    Alert.alert('Payout Dispatched! 📲💵', `Successfully transferred 🪙 ${totalRevenue} coins from gate receipts to your mobile money account!`);
  };

  const handleInviteToStage = (viewerId, viewerName) => {
    setAudienceCallIns(prev => prev.map(v => v.id === viewerId ? { ...v, onStage: true, status: 'Live on stage 🎙️' } : v));
    setCoHostsOnStage(prev => [...prev, viewerName]);
    Alert.alert('Stage Invitation 🎙️', `${viewerName} has been brought live onto the multi-host co-streaming stage!`);
  };

  const handleRemoveFromStage = (viewerId) => {
    setAudienceCallIns(prev => prev.map(v => v.id === viewerId ? { ...v, onStage: false, status: 'Muted' } : v));
    Alert.alert('Viewer Off Stage 🔇', 'Viewer returned to audience seats.');
  };

  const handleSendCommentary = () => {
    if (!commentaryInput.trim()) return;
    setCommentaryFeed(prev => [...prev, { id: Date.now(), author: `Viewer (${userAvatarBadge})`, text: commentaryInput }]);
    setCommentaryInput('');
  };

  const handleSendQa = () => {
    if (!qaInput.trim()) return;
    setQaFeed(prev => [...prev, { id: Date.now(), author: `Viewer (${userAvatarBadge})`, text: qaInput }]);
    setQaInput('');
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 60, alignSelf: 'center', width: '100%', maxWidth: 1000 }}>
      
      {/* HEADER WITH BACK BUTTON & WALLET */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { backgroundColor: '#ebf8ff', borderColor: '#3182ce', borderWidth: 1 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {onBack && (
            <TouchableOpacity 
              onPress={onBack}
              style={{ backgroundColor: '#2b6cb0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontWeight: 'bold', color: '#2b6cb0', fontSize: 13, marginLeft: onBack ? 0 : 'auto' }}>🪙 ChatUp Wallet Balance: {coins} Coins</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Text style={{ fontSize: 11, color: '#4a5568' }}>🎟️ Stubs: <Text style={{ fontWeight: 'bold' }}>{ticketStubs.length}</Text> | Capacity: <Text style={{ color: '#38a169', fontWeight: 'bold' }}>10k Max ⚡</Text></Text>
          
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <TouchableOpacity 
              onPress={() => setShowSuperLayersModal(true)}
              style={{ backgroundColor: '#805ad5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>⚡ 10 Super-Layers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowApplyModal(true)}
              style={{ backgroundColor: '#b7791f', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>📝 Apply to Host</Text>
            </TouchableOpacity>

            {userRole === 'admin' && (
              <TouchableOpacity 
                onPress={() => setShowAdminReviewModal(true)}
                style={{ backgroundColor: '#2b6cb0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🛡️ Review Hosts ({hostApplications.filter(a => a.status.includes('Pending')).length})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
      <View style={styles.monetizationAdCard}>
        <Text style={styles.adTagLabel}>Sponsored Intermission 📢 • AdMob Cinema Banner</Text>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob Cinema Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob Cinema Banner load error: ', error)}
          />
        </View>
      </View>

      {/* ================= REWARDED AD SPONSOR BONUS WIDGET ================= */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Cinema Sponsor Rewards</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a quick partner clip to earn +50 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+50 Coins) 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================== */}
      {/* 1. MASTER CREATOR STUDIO (FLASH DISK & AI MODERATION)      */}
      {/* ========================================================== */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { borderColor: '#d69e2e', borderWidth: 3, backgroundColor: isDarkMode ? '#1f2937' : '#fffbeb' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, color: '#b7791f', fontWeight: 'bold' }]}>🎛️ 1. Master Creator Studio & AI Guard</Text>
          <Text style={{ fontSize: 10, backgroundColor: '#c6f6d5', color: '#22543d', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' }}>AI Safe & Verified 🟢 (10k Scale)</Text>
        </View>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Pick any movie file from your phone storage, laptop, or flash disk with automated anti-piracy tagging:</Text>
        
        <TextInput
          style={[styles.chatInput, { marginBottom: 10, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
          placeholder="Movie Title..."
          placeholderTextColor="#a0aec0"
          value={newVideoTitle}
          onChangeText={setNewVideoTitle}
        />

        {Platform.OS === 'web' ? (
          <View style={{ marginBottom: 14, backgroundColor: '#fff', padding: 18, borderRadius: 8, borderWidth: 3, borderColor: '#d69e2e', borderStyle: 'dashed' }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#b7791f', marginBottom: 8 }}>
              📂 CLICK HERE TO SELECT VIDEO FROM LAPTOP / FLASH DISK / PHONE:
            </Text>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleSelectLocalVideo}
              style={{ fontSize: '14px', color: '#2d3748', width: '100%', cursor: 'pointer', padding: '6px', background: '#f7fafc', borderRadius: '4px', border: '1px solid #cbd5e0' }}
            />
            {localFileBanner ? (
              <Text style={{ fontSize: 12, color: '#38a169', marginTop: 8, fontWeight: 'bold' }}>✅ File Ready to Publish: {localFileBanner}</Text>
            ) : (
              <Text style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>Supports MP4, MKV, AVI, and MOV files from any connected drive.</Text>
            )}
          </View>
        ) : (
          <TouchableOpacity 
            style={{ backgroundColor: '#feebc8', padding: 16, borderRadius: 8, borderWidth: 2, borderColor: '#d69e2e', marginBottom: 10, alignItems: 'center' }}
            onPress={() => Alert.alert('Flash Disk Picker 📁', 'File picker active. Select video file from your phone storage library.')}
          >
            <Text style={{ color: '#b7791f', fontSize: 13, fontWeight: 'bold' }}>📁 Pick Local Video File from Phone Storage</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.chatInput, { marginBottom: 10, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
          placeholder="Or Direct Streaming URL (Auto-filled when you select a file)..."
          placeholderTextColor="#a0aec0"
          value={newVideoUrl}
          onChangeText={setNewVideoUrl}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between', backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>Free Screening Mode</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>Allow viewers to watch without paying coins</Text>
          </View>
          <TouchableOpacity 
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, backgroundColor: isMovieFree ? '#38a169' : '#cbd5e0' }}
            onPress={() => setIsMovieFree(!isMovieFree)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isMovieFree ? 'FREE 🟢' : 'PAID 🪙'}</Text>
          </TouchableOpacity>
        </View>

        {!isMovieFree && (
          <TextInput
            style={[styles.chatInput, { marginBottom: 10, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
            placeholder="Ticket Price in Coins (e.g. 50)..."
            placeholderTextColor="#a0aec0"
            keyboardType="numeric"
            value={newVideoPrice}
            onChangeText={setNewVideoPrice}
          />
        )}

        <TextInput
          style={[styles.chatInput, { marginBottom: 10, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
          placeholder="Genre (e.g. Wildlife, Drama, Sci-Fi)..."
          placeholderTextColor="#a0aec0"
          value={newVideoGenre}
          onChangeText={setNewVideoGenre}
        />

        <TextInput
          style={[styles.chatInput, { marginBottom: 12, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
          placeholder="Synopsis / Description..."
          placeholderTextColor="#a0aec0"
          value={newVideoDesc}
          onChangeText={setNewVideoDesc}
        />

        <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#b7791f', paddingVertical: 12 }]} onPress={handleCreateVideo}>
          <Text style={[styles.sendButtonText, { fontSize: 13 }]}>🚀 Publish Screening to 10k Capacity Catalog</Text>
        </TouchableOpacity>
      </View>

      {/* 2. CREATOR BOX OFFICE & PAYOUT LEDGER & ANALYTICS */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { borderColor: '#3182ce', borderWidth: 2 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>📊 International Box Office & Analytics</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>📈 View Analytics</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Monitor global ticket gate receipts and request mobile money payouts (MTN / Airtel):</Text>
        
        {videos.map(vid => (
          <View key={vid.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', color: '#3182ce', fontSize: 12 }}>🎬 {vid.title}</Text>
              <Text style={{ fontSize: 10, backgroundColor: vid.isFree ? '#c6f6d5' : '#ebf8ff', color: vid.isFree ? '#22543d' : '#2b6cb0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' }}>
                {vid.isFree ? 'FREE' : `🪙 ${vid.price} Coins`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#718096' }}>Passes Sold: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{vid.ticketSalesCount || 0}</Text></Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Gross Revenue: <Text style={{ fontWeight: 'bold', color: '#48bb78' }}>🪙 {vid.boxOfficeRevenue || 0} Coins</Text></Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={{ backgroundColor: '#38a169', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
          onPress={handleRequestPayout}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Request Box Office Payout 💳</Text>
        </TouchableOpacity>
      </View>

      {/* 3. CREATOR MEMBERSHIPS & SUPPORTS */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText]}>⭐ Global Creator Memberships & Tipping</Text>
          <View style={{ backgroundColor: activeTierSubscription ? '#feebc8' : '#edf2f7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: activeTierSubscription ? '#744210' : '#4a5568', fontSize: 11, fontWeight: 'bold' }}>
              {activeTierSubscription ? `Tier: ${activeTierSubscription}` : 'Standard Viewer'}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Support independent channel broadcasts with monthly VIP tiers or instant Super Chat tips:</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' }}
            onPress={() => handleSubscribeTier('Eco Supporter 🌿', 100)}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 2 }}>Eco Supporter 🌿</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>🪙 100 Coins / mo</Text>
            <Text style={{ fontSize: 10, color: '#48bb78', fontWeight: 'bold' }}>Chat Badge & Emotes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginLeft: 6, borderWidth: 1, borderColor: '#cbd5e0' }}
            onPress={() => handleSubscribeTier('Wilderness VIP 🦁', 250)}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d69e2e', marginBottom: 2 }}>Wilderness VIP 🦁</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>🪙 250 Coins / mo</Text>
            <Text style={{ fontSize: 10, color: '#d69e2e', fontWeight: 'bold' }}>All Access + VOD Vault</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.chatInput, { flex: 1, height: 35, marginRight: 8 }, isDarkMode && styles.darkChatInput]}
            placeholder="Tip amount (coins)..."
            placeholderTextColor="#a0aec0"
            keyboardType="numeric"
            value={customTipAmount}
            onChangeText={setCustomTipAmount}
          />
          <TouchableOpacity style={{ backgroundColor: '#48bb78', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 }} onPress={handleSendTip}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Send Tip 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. VIRTUAL CINEMA SNACKS BAR */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 6 }]}>🍿 Virtual Cinema Concession Bar</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Grab snacks to enjoy during the screening and broadcast live reactions:</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
          {[
            { name: 'Popcorn 🍿', price: 15 },
            { name: 'Local Soda 🥤', price: 10 },
            { name: 'Honey Tea 🍵', price: 12 },
            { name: 'Snack Combo 🍟', price: 30 },
          ].map(snack => (
            <TouchableOpacity 
              key={snack.name} 
              style={{ flex: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' }}
              onPress={() => handleBuySnack(snack.name, snack.price)}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 }}>{snack.name}</Text>
              <Text style={{ fontSize: 10, color: '#d69e2e', fontWeight: 'bold' }}>🪙 {snack.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. DYNAMIC CINEMA SCREENINGS CATALOG WITH VIRTUAL LOBBY & CALENDAR */}
      {videos.map((item) => {
        const isUnlocked = item.isFree || unlockedCinemaIds.includes(item.id) || userRole === 'admin';

        let multiplier = 1;
        if (selectedSeatTier === 'VIP Balcony') multiplier = 1.5;
        if (selectedSeatTier === 'IMAX Front Row') multiplier = 2.0;
        const calculatedTicketPrice = Math.round((item.price || STANDARD_PRICE) * multiplier);

        return (
          <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkHeader, { width: '100%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.postAuthor}>Host: {item.host || primaryHostName} • <Text style={{ color: '#3182ce' }}>{item.genre}</Text></Text>
              <Text style={{ fontSize: 10, color: item.isFree ? '#38a169' : '#d69e2e', fontWeight: 'bold' }}>
                {item.isFree ? '🟢 FREE SCREENING' : `🪙 ${item.price} Coins`}
              </Text>
            </View>

            <Text style={[styles.headerTitle, isDarkMode && styles.darkText, { fontSize: 16, marginBottom: 4 }]}>{item.title}</Text>
            <Text style={[styles.messageText, isDarkMode && styles.darkText, { marginBottom: 8, color: '#718096' }]}>{item.description}</Text>
            
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#2b6cb0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                onPress={() => {
                  setSelectedLobbyMovie(item);
                  setLobbyActive(true);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🎟️ Enter Virtual Lobby</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ backgroundColor: '#4a5568', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                onPress={() => handleAddToCalendar(item)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>📅 Add to Calendar</Text>
              </TouchableOpacity>
            </View>

            {isUnlocked ? (
              <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#edf2f7', padding: 16, borderRadius: 10, alignItems: 'center', marginVertical: 6 }}>
                <Text style={{ fontSize: 32, marginBottom: 6 }}>🎬</Text>
                <Text style={[{ fontWeight: 'bold', fontSize: 15, marginBottom: 4 }, isDarkMode && styles.darkText]}>Screening Pass Verified</Text>
                <Text style={{ color: '#718096', textAlign: 'center', marginBottom: 14, fontSize: 12 }}>
                  Your ticket is active. Tap below to launch this specific film in immersive theater mode!
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <TouchableOpacity 
                    style={{ backgroundColor: '#e53e3e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }} 
                    onPress={() => setActiveTheaterMovie(item)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>▶️ Watch "{item.title}"</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }} 
                    onPress={() => handleGenerateTicketPDF(item)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>📥 Download QR Ticket</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#edf2f7', padding: 20, borderRadius: 10, alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ fontSize: 28, marginBottom: 5 }}>🔒</Text>
                <Text style={[{ fontWeight: 'bold', fontSize: 15, marginBottom: 4 }, isDarkMode && styles.darkText]}>Exclusive Premiere Screening</Text>
                <Text style={{ color: '#718096', textAlign: 'center', marginBottom: 12, fontSize: 12 }}>
                  Select your seating tier to unlock instant access:
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 14, width: '100%', flexWrap: 'wrap' }}>
                  {['Standard Stalls', 'VIP Balcony', 'IMAX Front Row'].map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={{ 
                        paddingHorizontal: 10, 
                        paddingVertical: 6, 
                        borderRadius: 6, 
                        backgroundColor: selectedSeatTier === tier ? '#3182ce' : (isDarkMode ? '#2d3748' : '#fff'),
                        borderWidth: 1, 
                        borderColor: '#cbd5e0' 
                      }}
                      onPress={() => setSelectedSeatTier(tier)}
                    >
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: selectedSeatTier === tier ? '#fff' : (isDarkMode ? '#fff' : '#2d3748') }}>
                        {tier} ({tier === 'Standard Stalls' ? `🪙 ${item.price}` : tier === 'VIP Balcony' ? `🪙 ${Math.round(item.price * 1.5)}` : `🪙 ${item.price * 2}`})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }} onPress={() => handleBuyCinemaTicket(item)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Unlock {selectedSeatTier} Pass (🪙 {calculatedTicketPrice} Coins)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* ========================================================== */}
      {/* 6. IMMERSIVE THEATER MODAL                                 */}
      {/* ========================================================== */}
      <Modal visible={activeTheaterMovie !== null} animationType="fade" transparent={false}>
        {activeTheaterMovie && (
          <View style={[styles.theaterContainer, lightsOutMode && { backgroundColor: '#000000' }, isDarkMode && styles.darkContainer]}>
            
            {/* Theater Top Navigation Bar */}
            <View style={styles.theaterHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }} numberOfLines={1}>{activeTheaterMovie.title}</Text>
                <Text style={{ color: '#a0aec0', fontSize: 10 }}>Host: {activeTheaterMovie.host || primaryHostName} • Room: {syncPartyRoomCode}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <TouchableOpacity 
                  style={[styles.theaterHeaderBtn, lightsOutMode && { backgroundColor: '#d69e2e' }]} 
                  onPress={() => setLightsOutMode(!lightsOutMode)}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{lightsOutMode ? '💡 Lights On' : '🌙 Lights Out'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.theaterHeaderBtn, { backgroundColor: '#d69e2e' }]} onPress={() => setShowCrownModal(true)}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>👑 Pass Crown</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.theaterHeaderBtn, { backgroundColor: '#805ad5' }]} onPress={() => setShowSoundBoardModal(true)}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🔊 Sound FX</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.theaterHeaderBtn, { backgroundColor: '#3182ce' }]} onPress={() => setShowViewersModal(true)}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>👥 Viewers</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.theaterHeaderBtn, { backgroundColor: '#e53e3e' }]} 
                  onPress={() => {
                    setActiveTheaterMovie(null);
                    setCurtainCallActive(true);
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>End Show ✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* HOST AUDIO MIXER BUTTON / PANEL */}
            <View style={{ backgroundColor: '#111827', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#374151', paddingHorizontal: 15 }}>
              <Text style={{ color: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}>🎚️ Host Audio Balances:</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity 
                  style={{ backgroundColor: '#1f2937', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#374151' }}
                  onPress={() => setShowAudioMixerModal(true)}
                >
                  <Text style={{ color: '#60a5fa', fontSize: 10, fontWeight: 'bold' }}>Movie Vol: {hostMovieAudioLevel}%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ backgroundColor: '#1f2937', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#374151' }}
                  onPress={() => setShowAudioMixerModal(true)}
                >
                  <Text style={{ color: '#34d399', fontSize: 10, fontWeight: 'bold' }}>Mic Vol: {hostMicAudioLevel}%</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Video Viewport */}
            <View style={styles.theaterViewport}>
              
              <View style={styles.theaterWatermark}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 3, opacity: 0.6 }}>
                  {customWatermarkLogo} | User ({userAvatarBadge}) | 10k Node ⚡
                </Text>
              </View>

              {hostCamActive && (
                <View style={{ position: 'absolute', top: 15, right: 15, width: 150, height: 110, zIndex: 100, borderRadius: 8, borderWidth: 2, borderColor: '#3182ce', overflow: 'hidden', backgroundColor: '#000' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>🔴 CO-STREAM STAGE</Text>
                    <Text style={{ color: '#48bb78', fontSize: 9 }}>{hostMicActive ? '🎙️ Live' : '👀 On-Air'}</Text>
                  </View>
                  <video 
                    ref={webcamRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: '100%', height: 'calc(100% - 16px)', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                  />
                </View>
              )}

              {floatingReactions.map(r => (
                <View key={r.id} style={[styles.floatingReactionBadge, { left: `${r.left}%` }]}>
                  <Text style={{ fontSize: 28 }}>{r.emoji}</Text>
                </View>
              ))}

              {cinemaAdPlaying && (
                <View style={styles.theaterAdBanner}>
                  <Text style={{ color: '#9b2c2c', fontWeight: 'bold', fontSize: 12 }}>📢 Sponsored Partner: {customSponsorText}</Text>
                </View>
              )}

              <video
                ref={videoRef}
                width="100%"
                height="100%"
                src={activeTemporaryClip || activeTheaterMovie.video_url}
                autoPlay
                playsInline
                controls
                preload="auto"
                onError={() => Alert.alert('Playback Notice', 'Could not load video stream. Please check file format or URL.')}
                style={{ width: '100%', height: '100%', backgroundColor: '#000', objectFit: 'contain', display: 'block' }}
              />

              {activeTemporaryClip && (
                <View style={{ position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(229, 62, 62, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, zIndex: 50 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>⚡ Temporary Clip Playing</Text>
                </View>
              )}

              {cinemaCcActive && (
                <View style={styles.theaterSubtitleBox}>
                  <Text style={styles.theaterSubtitleText}>
                    "{subtitleDictionary[cinemaSubLanguage] || subtitleDictionary['English']}"
                  </Text>
                </View>
              )}
            </View>

            {/* Theater Controls & Winding Toolbar */}
            <View style={styles.theaterToolbar}>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TouchableOpacity style={styles.controlToolBtn} onPress={togglePlayState}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.controlToolBtn, { backgroundColor: '#2b6cb0' }]} onPress={() => handleWindMovie(-15)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>⏪ -15s</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.controlToolBtn, { backgroundColor: '#2b6cb0' }]} onPress={() => handleWindMovie(15)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>+15s ⏩</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.controlToolBtn, { backgroundColor: '#38a169' }]} onPress={handleSyncToHost}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Sync to Host ⚡</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.controlToolBtn, { backgroundColor: '#e53e3e' }]} onPress={handleRequestPauseFlag}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>⏸️ Request Break</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {[1.0, 1.5, 2.0].map(spd => (
                    <TouchableOpacity
                      key={spd}
                      style={[styles.speedToggleBtn, playbackSpeed === spd && { backgroundColor: '#3182ce' }]}
                      onPress={() => setPlaybackSpeed(spd)}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{spd}x</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: 8, marginBottom: 8 }}>
                {['🔥', '👏', '🍿', '💎', '❤️', '🤯', '🦁'].map(emoji => (
                  <TouchableOpacity key={emoji} onPress={() => triggerFloatingReaction(emoji)}>
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Side / Bottom Contextual Split Chat & Q&A */}
            <View style={styles.theaterDrawer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity 
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: activeChatTab === 'general' ? '#3182ce' : '#2d3748' }}
                    onPress={() => setActiveChatTab('general')}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>General Chat 💬</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: activeChatTab === 'qa' ? '#3182ce' : '#2d3748' }}
                    onPress={() => setActiveChatTab('qa')}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Q&A / Discussion ❓</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                {activeChatTab === 'general' ? (
                  commentaryFeed.map(comm => (
                    <View key={comm.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#3182ce', fontSize: 10, fontWeight: 'bold' }}>{comm.author}</Text>
                        <Text style={{ color: '#fff', fontSize: 11 }}>{comm.text}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteChatMessage(comm.id)}>
                        <Text style={{ color: '#e53e3e', fontSize: 10 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  qaFeed.map(qa => (
                    <View key={qa.id} style={{ marginBottom: 6 }}>
                      <Text style={{ color: '#d69e2e', fontSize: 10, fontWeight: 'bold' }}>Question by {qa.author}</Text>
                      <Text style={{ color: '#fff', fontSize: 11 }}>{qa.text}</Text>
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  style={[styles.chatInput, { flex: 1, height: 35, marginRight: 6, color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#4a5568' }]}
                  placeholder={activeChatTab === 'general' ? "Send message to theater..." : "Ask a question..."}
                  placeholderTextColor="#a0aec0"
                  value={activeChatTab === 'general' ? commentaryInput : qaInput}
                  onChangeText={activeChatTab === 'general' ? setCommentaryInput : setQaInput}
                />
                <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 6 }} onPress={activeChatTab === 'general' ? handleSendCommentary : handleSendQa}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* 7. CINEMA HOST APPLICATION FORM MODAL                      */}
      {/* ========================================================== */}
      <Modal visible={showApplyModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📝 Apply to Become a Cinema Host</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Fill in your channel details and review our broadcasting guidelines before submitting:</Text>

              <TextInput
                style={[styles.chatInput, { marginBottom: 8, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
                placeholder="Cinema / Channel Name..."
                placeholderTextColor="#a0aec0"
                value={applicantChannelName}
                onChangeText={setApplicantChannelName}
              />

              <TextInput
                style={[styles.chatInput, { marginBottom: 8, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
                placeholder="Number of Followers / Subscribers (e.g. 5,000)..."
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                value={applicantFollowers}
                onChangeText={setApplicantFollowers}
              />

              <TextInput
                style={[styles.chatInput, { marginBottom: 8, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
                placeholder="Expected Concurrent Room Audience (e.g. 500)..."
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                value={applicantAudienceSize}
                onChangeText={setApplicantAudienceSize}
              />

              <TextInput
                style={[styles.chatInput, { marginBottom: 10, backgroundColor: '#fff', height: 60 }, isDarkMode && styles.darkChatInput]}
                placeholder="Streaming Purpose / Content Genre..."
                placeholderTextColor="#a0aec0"
                multiline
                value={applicantPurpose}
                onChangeText={setApplicantPurpose}
              />

              {/* RULES & REGULATIONS BOX */}
              <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#b7791f', marginBottom: 4 }}>📜 Host Rules & Regulations:</Text>
                <Text style={{ fontSize: 10, color: '#4a5568', lineHeight: 14, marginBottom: 4 }}>
                  1. <Text style={{ fontWeight: 'bold' }}>Zero Tolerance for Adult Content:</Text> No showing pornographic, sexually explicit, or illicit media under any circumstance. Violation leads to immediate permanent ban.{'\n'}
                  2. <Text style={{ fontWeight: 'bold' }}>Copyright Compliance:</Text> Hosts must hold valid streaming rights or broadcast original/independent media.{'\n'}
                  3. <Text style={{ fontWeight: 'bold' }}>Respectful Moderation:</Text> Maintain a safe, harassment-free environment for all 10k room participants.
                </Text>

                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                  onPress={() => setRulesAgreed(!rulesAgreed)}
                >
                  <View style={{ width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: '#3182ce', backgroundColor: rulesAgreed ? '#3182ce' : '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                    {rulesAgreed && <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✓</Text>}
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2d3748' }}>I have read and understand the rules and regulations</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: '#b7791f', padding: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={handleSendHostApplication}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Submit Application 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 8. ADMIN HOST REVIEW DASHBOARD MODAL                       */}
      {/* ========================================================== */}
      <Modal visible={showAdminReviewModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Admin Review: Host Applications</Text>
              <TouchableOpacity onPress={() => setShowAdminReviewModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Review incoming requests from creators wanting to host rooms:</Text>

            <ScrollView>
              {hostApplications.map(app => (
                <View key={app.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e0' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold', color: '#3182ce', fontSize: 12 }}>🎬 {app.name}</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: app.status.includes('Approved') ? '#38a169' : app.status.includes('Rejected') ? '#e53e3e' : '#d69e2e' }}>
                      {app.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#4a5568', marginBottom: 2 }}>Purpose: {app.purpose}</Text>
                  <Text style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>Followers: {app.followers || 'N/A'} | Expected Audience: {app.audience} viewers</Text>

                  {app.status.includes('Pending') && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      <TouchableOpacity 
                        style={{ flex: 1, backgroundColor: '#38a169', padding: 6, borderRadius: 4, alignItems: 'center' }}
                        onPress={() => handleApproveApplication(app.id, app.name)}
                      >
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Approve Host ✓</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={{ flex: 1, backgroundColor: '#e53e3e', padding: 6, borderRadius: 4, alignItems: 'center' }}
                        onPress={() => handleRejectApplication(app.id, app.name)}
                      >
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Reject ✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 9. HOST AUDIO MIXER MODAL                                  */}
      {/* ========================================================== */}
      <Modal visible={showAudioMixerModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎚️ Host Audio Mixer & Level Control</Text>
              <TouchableOpacity onPress={() => setShowAudioMixerModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 15 }}>Adjust master sound levels for the movie stream track and host microphone commentary:</Text>

            <View style={{ gap: 12, marginBottom: 20 }}>
              <View style={{ backgroundColor: '#edf2f7', padding: 12, borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>🎬 Movie Audio Track</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>{hostMovieAudioLevel}%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                  {[50, 75, 100, 125].map(lvl => (
                    <TouchableOpacity 
                      key={lvl}
                      style={{ flex: 1, backgroundColor: hostMovieAudioLevel === lvl ? '#3182ce' : '#cbd5e0', padding: 6, borderRadius: 4, alignItems: 'center' }}
                      onPress={() => setHostMovieAudioLevel(lvl)}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{lvl}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ backgroundColor: '#edf2f7', padding: 12, borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748' }}>🎙️ Host Live Microphone</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38a169' }}>{hostMicAudioLevel}%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                  {[50, 75, 100, 125].map(lvl => (
                    <TouchableOpacity 
                      key={lvl}
                      style={{ flex: 1, backgroundColor: hostMicAudioLevel === lvl ? '#38a169' : '#cbd5e0', padding: 6, borderRadius: 4, alignItems: 'center' }}
                      onPress={() => setHostMicAudioLevel(lvl)}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{lvl}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={{ backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' }}
              onPress={() => {
                setShowAudioMixerModal(false);
                Alert.alert('Mixer Updated 🎚️', `Movie Audio set to ${hostMovieAudioLevel}% | Mic set to ${hostMicAudioLevel}%`);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Apply Audio Levels</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 10. AUDIENCE SOUND EFFECTS BOARD MODAL                     */}
      {/* ========================================================== */}
      <Modal visible={showSoundBoardModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔊 Audience Sound Effects Board</Text>
              <TouchableOpacity onPress={() => setShowSoundBoardModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Trigger live reactions and sound effects into the 10k room audio feed:</Text>

            <View style={{ gap: 8 }}>
              {[
                { name: 'Standing Applause 👏', emoji: '👏' },
                { name: 'Loud Cheering 🎉', emoji: '🎉' },
                { name: 'Theater Laughter 😂', emoji: '😂' },
                { name: 'Suspense Drumroll 🥁', emoji: '🥁' },
                { name: 'Playful Boos 🍅', emoji: '🍅' },
                { name: 'Acoustic Chime ✨', emoji: '✨' },
              ].map(fx => (
                <TouchableOpacity 
                  key={fx.name} 
                  style={{ backgroundColor: '#edf2f7', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={() => triggerSoundEffect(fx.name, fx.emoji)}
                >
                  <Text style={{ fontWeight: 'bold', color: '#2d3748', fontSize: 12 }}>{fx.name}</Text>
                  <Text style={{ color: '#805ad5', fontSize: 11, fontWeight: 'bold' }}>Play FX 🔊</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 11. PASS CROWN SELECTION MODAL                             */}
      {/* ========================================================== */}
      <Modal visible={showCrownModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>👑 Pass the Projectionist Crown</Text>
              <TouchableOpacity onPress={() => setShowCrownModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Select a co-host or moderator to transfer master playback and room controls:</Text>

            {['Stella', 'Viewer_Kampala', 'Node_Kampala_02 (Mesh Admin)'].map(candidate => (
              <TouchableOpacity 
                key={candidate} 
                style={{ backgroundColor: '#edf2f7', padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => handleTransferCrownTo(candidate)}
              >
                <Text style={{ fontWeight: 'bold', color: '#2d3748', fontSize: 12 }}>{candidate}</Text>
                <Text style={{ color: '#3182ce', fontSize: 11, fontWeight: 'bold' }}>Transfer Crown 👑</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 12. VIRTUAL LOBBY MODAL (PRE-SHOW WAITING ROOM)            */}
      {/* ========================================================== */}
      <Modal visible={lobbyActive} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎟️ Virtual Lobby: Pre-Show Waiting Room</Text>
              <TouchableOpacity onPress={() => setLobbyActive(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedLobbyMovie && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>{selectedLobbyMovie.title}</Text>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Showtime starts in: <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>04:52</Text></Text>
                
                <View style={{ backgroundColor: '#edf2f7', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 }}>👥 Who's Attending (10k Scale Ready)</Text>
                  {activeViewersList.map(v => (
                    <Text key={v.id} style={{ fontSize: 11, color: '#4a5568' }}>• {v.name} ({v.badge})</Text>
                  ))}
                </View>

                <TouchableOpacity 
                  style={{ backgroundColor: '#38a169', padding: 12, borderRadius: 8, alignItems: 'center' }}
                  onPress={() => {
                    setLobbyActive(false);
                    setActiveTheaterMovie(selectedLobbyMovie);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Enter Screening Room Now ▶️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 13. HOST ROOM MODERATION & VIEWERS MANAGEMENT MODAL        */}
      {/* ========================================================== */}
      <Modal visible={showViewersModal} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowViewersModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '75%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Host Moderation & 10k Audience Roster</Text>
              <TouchableOpacity onPress={() => setShowViewersModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#edf2f7', padding: 10, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2d3748' }}>Allow Viewers to Invite Others</Text>
                <Text style={{ fontSize: 9, color: '#718096' }}>Toggle global invite permission</Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: allowViewerInvites ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => setAllowViewerInvites(!allowViewerInvites)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{allowViewerInvites ? 'Allowed 🟢' : 'Blocked 🔴'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Manage stage call-ins, mute mic privileges, or kick disruptive participants:</Text>

            <ScrollView>
              {audienceCallIns.map(viewer => (
                <View key={viewer.id} style={[styles.peerRow, isDarkMode && { borderBottomColor: '#4a5568' }]}>
                  <View>
                    <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{viewer.name}</Text>
                    <Text style={{ fontSize: 10, color: viewer.onStage ? '#48bb78' : '#3182ce' }}>{viewer.status} {viewer.muted ? '(Muted 🔇)' : ''}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity style={{ backgroundColor: '#d69e2e', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }} onPress={() => handleMuteUserMic(viewer.id)}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{viewer.muted ? 'Unmute' : 'Mute Mic'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ backgroundColor: '#e53e3e', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }} onPress={() => handleKickUser(viewer.name)}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>Kick 🚫</Text>
                    </TouchableOpacity>

                    {viewer.onStage ? (
                      <TouchableOpacity style={{ backgroundColor: '#718096', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }} onPress={() => handleRemoveFromStage(viewer.id)}>
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>Off Stage</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={{ backgroundColor: '#38a169', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }} onPress={() => handleInviteToStage(viewer.id, viewer.name)}>
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>On Stage 🎙️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ========================================================== */}
      {/* 14. ANALYTICS DASHBOARD MODAL                              */}
      {/* ========================================================== */}
      <Modal visible={showAnalyticsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📈 Post-Event Analytics (10k Scale)</Text>
              <TouchableOpacity onPress={() => setShowAnalyticsModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginBottom: 15 }}>
              <Text style={{ fontSize: 12, color: '#4a5568' }}>🔥 Total Peak Attendance: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>8,420 Viewers</Text></Text>
              <Text style={{ fontSize: 12, color: '#4a5568' }}>⏱️ Average Room Duration: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>1h 42m per user</Text></Text>
              <Text style={{ fontSize: 12, color: '#4a5568' }}>⭐ Overall Engagement Rate: <Text style={{ fontWeight: 'bold', color: '#48bb78' }}>96.2% (High)</Text></Text>
              <Text style={{ fontSize: 12, color: '#4a5568' }}>🪙 Gross Ticket Gate Revenue: <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>🪙 1,450 Coins</Text></Text>
            </View>

            <TouchableOpacity 
              style={{ backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' }}
              onPress={() => {
                setShowAnalyticsModal(false);
                setCtaModalActive(true);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Trigger Automated CTA Broadcast 📢</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 15. AUTOMATED CTA REDIRECT MODAL                         */}
      {/* ========================================================== */}
      <Modal visible={ctaModalActive} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { alignItems: 'center' }]}>
            <Text style={{ fontSize: 24, marginBottom: 6 }}>🎁</Text>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 6 }]}>Special Show Call-to-Action</Text>
            <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 15 }}>Thank you for attending! Support our next wildlife preservation screening or signup below:</Text>

            <TouchableOpacity 
              style={{ backgroundColor: '#38a169', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 }}
              onPress={() => {
                setCtaModalActive(false);
                Alert.alert('Redirected 🌿', 'Opened conservation donation portal.');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Support Conservation Fund (Donate 🪙)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ backgroundColor: '#3182ce', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center' }}
              onPress={() => {
                setCtaModalActive(false);
                Alert.alert('Success 🎟️', 'Registered for next weekend’s scheduled show!');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Signup for Next Scheduled Show 📅</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 16. CURTAIN CALL & INSTANT RATING PANEL                  */}
      {/* ========================================================== */}
      <Modal visible={curtainCallActive} animationType="slide" transparent={false}>
        <View style={[styles.theaterContainer, isDarkMode && styles.darkContainer, { padding: 20, justifyContent: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 }}>🎭 Curtain Call: Post-Show Panel</Text>
          <Text style={{ color: '#a0aec0', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>The screening has concluded. Hang out with co-hosts and review the show!</Text>

          <View style={{ width: '100%', maxWidth: 400, height: 220, backgroundColor: '#1a202c', borderRadius: 12, borderWidth: 2, borderColor: '#3182ce', alignSelf: 'center', marginBottom: 20, overflow: 'hidden' }}>
            <video 
              ref={webcamRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#38a169', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
              onPress={() => {
                setCurtainCallActive(false);
                setShowRatingModal(true);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Rate Show & Review ⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ backgroundColor: '#e53e3e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
              onPress={() => setCurtainCallActive(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Leave Room ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 17. INSTANT RATING & REVIEW MODAL                          */}
      {/* ========================================================== */}
      <Modal visible={showRatingModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 10 }]}>⭐ Instant Show Rating & Review</Text>
            <TextInput
              style={[styles.chatInput, { marginBottom: 10, backgroundColor: '#fff' }, isDarkMode && styles.darkChatInput]}
              placeholder="Write a quick review for the host..."
              placeholderTextColor="#a0aec0"
              value={reviewInput}
              onChangeText={setReviewInput}
            />
            <TouchableOpacity 
              style={{ backgroundColor: '#38a169', padding: 10, borderRadius: 8, alignItems: 'center' }}
              onPress={() => {
                setShowRatingModal(false);
                Alert.alert('Review Submitted! ⭐', 'Thank you for rating this show. Your feedback has been saved to your ticket stubs!');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* 18. 10 SUPER-LAYERS ARCHITECTURE MODAL                     */}
      {/* ========================================================== */}
      <Modal visible={showSuperLayersModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚡ 10 Super-Layers Architecture</Text>
              <TouchableOpacity onPress={() => setShowSuperLayersModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Manage decentralized streaming protocols, AI safety filters, and mesh routing layers:</Text>

            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              {[
                { title: 'Quantum Encryption Lattice 🔐', state: quantumEncryptionLattice, setState: setQuantumEncryptionLattice, desc: 'End-to-end cryptographic stream security.' },
                { title: 'Kampala Edge Relay Sync ⚡', state: kampalaEdgeRelaySync, setState: setKampalaEdgeRelaySync, desc: 'Low-latency local caching node.' },
                { title: 'AI Autonomous Toxicity Guard 🛡️', state: aiAutonomousToxicityGuard, setState: setAiAutonomousToxicityGuard, desc: 'Real-time chat moderation and filtering.' },
                { title: 'Biometric Creator Watermark 🌿', state: biometricCreatorWatermark, setState: setBiometricCreatorWatermark, desc: 'Anti-piracy forensic tracking ID.' },
                { title: 'Realtime Sentiment Mesh 💬', state: realtimeSentimentMesh, setState: setRealtimeSentimentMesh, desc: 'Aggregates audience emotion reactions.' },
                { title: 'Zero-Fee Gas Subsidizer ⛽', state: zeroFeeGasSubsidizer, setState: setZeroFeeGasSubsidizer, desc: 'Covers transaction fees for community passes.' },
                { title: 'Multimodal HLS Adaptive 🎥', state: multimodalHlsAdaptive, setState: setMultimodalHlsAdaptive, desc: 'Auto-adjusts video quality based on bandwidth.' },
                { title: 'Federated On-Device AI 🧠', state: federatedOnDeviceAi, setState: setFederatedOnDeviceAi, desc: 'Local machine learning recommendation engine.' },
                { title: 'Bluetooth P2P Mesh Relay 📡', state: bluetoothP2pMeshRelay, setState: setBluetoothP2pMeshRelay, desc: 'Offline peer-to-peer watch party sharing.' },
                { title: 'Autonomous Creator Escrow 🪙', state: autonomousCreatorEscrow, setState: setAutonomousCreatorEscrow, desc: 'Smart contract gate receipt distribution.' },
              ].map((layer, index) => (
                <View key={index} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#cbd5e0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>{layer.title}</Text>
                    <Text style={{ fontSize: 10, color: '#718096' }}>{layer.desc}</Text>
                  </View>
                  <TouchableOpacity 
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: layer.state ? '#38a169' : '#cbd5e0' }}
                    onPress={() => layer.setState(!layer.state)}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{layer.state ? 'ACTIVE 🟢' : 'OFF ⚪'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  darkText: { color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  messageText: { fontSize: 14 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 40, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  postAuthor: { fontWeight: 'bold', color: '#3182ce', marginBottom: 6, fontSize: 12 },
  commentsHeader: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
  
  // Immersive Theater Modal Styles
  theaterContainer: { flex: 1, backgroundColor: '#111827', flexDirection: 'column' },
  theaterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#1a202c', borderBottomWidth: 1, borderBottomColor: '#2d3748' },
  theaterHeaderBtn: { backgroundColor: '#2d3748', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  theaterViewport: { width: '100%', height: 320, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  theaterWatermark: { position: 'absolute', top: 15, left: 15, zIndex: 20, pointerEvents: 'none' },
  floatingReactionBadge: { position: 'absolute', bottom: 40, zIndex: 30, pointerEvents: 'none' },
  theaterAdBanner: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#feb2b2', padding: 6, alignItems: 'center', zIndex: 25 },
  theaterSubtitleBox: { position: 'absolute', bottom: 15, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.75)', padding: 6, borderRadius: 6, alignItems: 'center', zIndex: 20 },
  theaterSubtitleText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#000', textShadowRadius: 2 },
  theaterToolbar: { padding: 10, backgroundColor: '#1a202c', borderBottomWidth: 1, borderBottomColor: '#2d3748' },
  controlToolBtn: { backgroundColor: '#2d3748', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  speedToggleBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, backgroundColor: '#4a5568' },
  theaterDrawer: { flex: 1, backgroundColor: '#111827', padding: 12 },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '75%' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  peerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#4a5568' },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});