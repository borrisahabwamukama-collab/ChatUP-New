import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function VirtualTVScreen({ isDarkMode, coins, setCoins }) {
  // Navigation & Persistent Media States (All 12 Tabs Intact)
  const [activeTab, setActiveTab] = useState('Guide'); // 'Guide', 'Live', 'CatchUp', 'WatchParty', 'Studio', 'ProEditing', 'Monetization', 'Cinema', 'OwnTV', 'Mesh', 'Analytics', 'VirtualVR'
  const [currentChannel, setCurrentChannel] = useState({
    id: 'ch_1',
    number: '01',
    title: 'Talk with Nature: Wildlife Expeditions',
    genre: 'Eco & Wildlife',
    streamer: 'Borris Ranger Hub',
    viewers: '1,420 watching',
    videoUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop',
    isOfficial: true,
  });

  // International Broadcast & Player Quality States
  const [streamQuality, setStreamQuality] = useState('Auto 1080p (HLS Adaptive)');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [isExpandedCameraMode, setIsExpandedCameraMode] = useState(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  // EPG / Channel Grid Data & Custom Schedule Creator
  const [epgChannels, setEpgChannels] = useState([
    { id: 'ch_1', number: '01', name: 'Talk with Nature HD', currentShow: 'Wildlife Expeditions in Queen Elizabeth Park', time: '02:00 PM - 04:00 PM', category: 'Wildlife' },
    { id: 'ch_2', number: '02', name: 'Kampala Sports TV', currentShow: 'Premier League Watch Party: Arsenal vs Man City', time: '02:30 PM - 05:00 PM', category: 'Sports' },
    { id: 'ch_3', number: '03', name: 'Studio UG Music', currentShow: 'East African Indie Showcase & Live Beats', time: '03:00 PM - 06:00 PM', category: 'Music' },
    { id: 'ch_4', number: '04', name: 'Global News & Tech Network', currentShow: 'AI & Software Innovation Forum Kampala', time: '01:30 PM - 03:30 PM', category: 'News' },
    { id: 'ch_5', number: '05', name: 'Pearl Africa Cinema', currentShow: 'The Heart of Bwindi: Gorillas in the Mist', time: '04:00 PM - 06:00 PM', category: 'Movies' },
  ]);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramTime, setNewProgramTime] = useState('');

  // Pro Video Editing & AI Studio States
  const [timelineClips, setTimelineClips] = useState([
    { id: 'clip_1', name: 'Intro Wildlife Bwindi Scene (00:00 - 00:45)', duration: '45s' },
    { id: 'clip_2', name: 'Main Elephant River Crossing (00:45 - 03:20)', duration: '2m 35s' },
    { id: 'clip_3', name: 'Sunset Savannah Aerial Drone Shot (03:20 - 05:00)', duration: '1m 40s' }
  ]);
  const [newClipName, setNewClipName] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [audioDenoiseActive, setAudioDenoiseActive] = useState(true);
  const [activeTransition, setActiveTransition] = useState('Crossfade 🎬');
  const [targetFps, setTargetFps] = useState('60 FPS (Ultra HD)');
  const [teleprompterText, setTeleprompterText] = useState('Welcome back wildlife lovers! Today we track elephant herds crossing the Kazinga channel and explore Bwindi impenetrable forest conservation updates...');

  // AI Smart Trim & Closed Captioning States
  const [smartTrimStatus, setSmartTrimStatus] = useState('Ready to analyze footage peaks');
  const [highlightReelsCount, setHighlightReelsCount] = useState(2);
  const [closedCaptionsActive, setClosedCaptionsActive] = useState(true);
  const [captionLanguage, setCaptionLanguage] = useState('English & Luganda (Auto-Translate Live)');
  const [latestCaptionSample, setLatestCaptionSample] = useState('Welcome back to Talk With Nature live stream from Uganda...');

  // Hardware Signal & RTMP Ingestion States
  const [rtmpStreamKey, setRtmpStreamKey] = useState('chatup_live_key_' + Math.random().toString(36).substring(7));
  const [rtmpEndpointUrl, setRtmpEndpointUrl] = useState('rtmp://ingest.chatup.tv/live');
  const [hardwareSignalStatus, setHardwareSignalStatus] = useState('Offline (Waiting for Switcher Signal)');

  // Zero-Friction One-Tap Publish State
  const [masterProjectTitle, setMasterProjectTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Advanced Monetization & Creator Earnings States
  const [creatorEarningsUSD, setCreatorEarningsUSD] = useState(482.50);
  const [adRevenueShare, setAdRevenueShare] = useState(158.00);
  const [superGiftsTotal, setSuperGiftsTotal] = useState(195.50);
  const [ticketSalesRevenue, setTicketSalesRevenue] = useState(129.00);
  const [adBreakRunning, setAdBreakRunning] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(245);

  // Presenter Studio Controls & Safety States
  const [killSwitchEngaged, setKillSwitchEngaged] = useState(false);
  const [faceAnonymization, setFaceAnonymization] = useState(false);
  const [voiceScrambler, setVoiceScrambler] = useState(false);
  const [broadcastDelay, setBroadcastDelay] = useState('2 Seconds Buffer');
  const [aiDubbingActive, setAiDubbingActive] = useState(false);
  const [selectedDubLanguage, setSelectedDubLanguage] = useState('Luganda 🇺🇬');

  // Built-in Laptop Camera, Extended Filters & Multi-Cam Switcher States
  const [useDeviceCamera, setUseDeviceCamera] = useState(false);
  const [mediaStreamRef, setMediaStreamRef] = useState(null);
  const [activeCameraFilter, setActiveCameraFilter] = useState('Normal (HD Clear)');
  const filterOptions = [
    'Normal (HD Clear)',
    'Smooth & Glow ✨',
    'Cinematic Warm 🎬',
    'Vivid Nature 🌿',
    'Studio Noir 🖤',
    'Golden Hour 🌅',
    'Cyberpunk Neon ⚡',
    'Vintage Retro 📼',
  ];

  const [cameraFeedsList, setCameraFeedsList] = useState([
    { id: 'cam_1', name: 'Camera 1 (Host Wide)', url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop' },
    { id: 'cam_2', name: 'Camera 2 (Stage Close-up)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop' },
    { id: 'cam_3', name: 'Camera 3 (Drone / Nature)', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop' },
    { id: 'cam_4', name: 'Camera 4 (Green Room Side)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop' }
  ]);
  const [activeCameraFeed, setActiveCameraFeed] = useState({
    id: 'cam_1',
    name: 'Camera 1 (Host Wide)',
    url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop'
  });
  const [newCameraNameInput, setNewCameraNameInput] = useState('');

  // Enterprise Live WebRTC Call-In Studio States
  const [incomingCallRequests, setIncomingCallRequests] = useState([
    { id: 'call_101', name: 'Dr. Evelyn Nakato', mode: 'HD Video Call', topic: 'Uganda Wildlife Veterinary Conservation' },
    { id: 'call_102', name: 'Kateregga Ronald', mode: 'Audio Only', topic: 'Kampala Youth Tech Incubator' },
    { id: 'call_103', name: 'Sarah Babirye', mode: 'HD Video Call', topic: 'Bwindi Gorilla Tracking Live Q&A' },
  ]);
  const [activeOnAirCaller, setActiveOnAirCaller] = useState(null);

  // Virtual Cinema Hall States & Snacks Ordering
  const [cinemaMovies] = useState([
    { id: 'mov_1', title: 'The Heart of Bwindi: Gorillas in the Mist', genre: 'Wildlife Feature', duration: '1h 45m', price: 100, poster: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop', status: 'Now Screening 🔴' },
    { id: 'mov_2', title: 'Kampala Nights: The Afrobeat Revolution', genre: 'Music Documentary', duration: '1h 20m', price: 75, poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', status: 'Premieres at 08:00 PM ⏰' },
    { id: 'mov_3', title: 'Savannah Titans: Elephant Migration Epics', genre: 'Eco Wildlife IMAX', duration: '2h 10m', price: 120, poster: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1000&auto=format&fit=crop', status: 'Available On-Demand 🎬' },
  ]);
  const [selectedMovieTicket, setSelectedMovieTicket] = useState(null);
  const [selectedCinemaSeat, setSelectedCinemaSeat] = useState('VIP Box A-12');
  const [cinemaSnacksCart, setCinemaSnacksCart] = useState([]);

  // Own a TV Station Franchise Application States (with secure review queue flow)
  const [stationApplicantName, setStationApplicantName] = useState('');
  const [stationNameInput, setStationNameInput] = useState('');
  const [stationGenreInput, setStationGenreInput] = useState('Eco & Wildlife 🌿');
  const [stationDescriptionInput, setStationDescriptionInput] = useState('');
  const [stationPayoutMethod, setStationPayoutMethod] = useState('Mobile Money (MTN / Airtel UG)');
  const [stationScheduleTier, setStationScheduleTier] = useState('24/7 Automated Linear Loop');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Synchronized Watch Party Advanced States
  const [watchPartyHostName, setWatchPartyHostName] = useState('Borris (Host)');
  const [isHostControlLocked, setIsHostControlLocked] = useState(true);
  const [watchPartyRoomCode, setWatchPartyRoomCode] = useState('UG-VTV-' + Math.floor(1000 + Math.random() * 9000));
  const [watchPartyParticipants, setWatchPartyParticipants] = useState([
    { id: 'p_1', name: 'Nimusiima Asifa', role: 'VIP Guest', status: 'Synced 🟢' },
    { id: 'p_2', name: 'Stella', role: 'Viewer', status: 'Synced 🟢' },
    { id: 'p_3', name: 'Ranger Brian', role: 'Moderator', status: 'Synced 🟢' },
    { id: 'p_4', name: 'Kateregga Ronald', role: 'Viewer', status: 'Synced 🟢' },
  ]);

  // Zero-Net & Ghost Vault States
  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(7);
  const [vaultPassword, setVaultPassword] = useState('');
  const [localChatMessage, setLocalChatMessage] = useState('');
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Wildlife archive chunk synced successfully offline.' },
    { id: '3', sender: 'Node_Entebbe_04', text: 'Low-power relay beacon broadcasting successfully.' }
  ]);
  const [ghostVaultFiles, setGhostVaultFiles] = useState([
    { id: 'v_1', name: 'Confidential_Wildlife_Census_2026.enc', size: '14.2 MB', date: 'Aug 28, 2026' },
    { id: 'v_2', name: 'Financial_Ledger_Q3_Encrypted.db', size: '4.8 MB', date: 'Sep 01, 2026' }
  ]);
  const [newVaultFileName, setNewVaultFileName] = useState('');

  // Interactive Live Viewer Poll States
  const [pollActive, setPollActive] = useState(true);
  const [pollQuestion, setPollQuestion] = useState('Should we extend the wildlife conservation segment by 30 minutes?');
  const [pollVotes, setPollVotes] = useState({ yes: 1120, no: 180 });
  const [userVoted, setUserVoted] = useState(false);
  const [selectedVoteOption, setSelectedVoteOption] = useState(null);

  // Crowdfunding & Monetization Goal Bar
  const [fundraisingGoal, setFundraisingGoal] = useState(5000);
  const [raisedCoins, setRaisedCoins] = useState(4150);

  // Chat States
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Nimusiima Asifa', text: 'Look at those elephants crossing the river! 🐘' },
    { id: '2', user: 'Stella', text: 'Amazing resolution on this official broadcaster stream.' },
    { id: '3', user: 'Borris', text: 'Welcome everyone to the synchronized watch party!' },
    { id: '4', user: 'Kateregga Ronald', text: 'Greetings from Kampala! The stream is super crisp.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Advanced Viewer Analytics & Heatmap States
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('Last 24 Hours');
  const [peakConcurrentViewers, setPeakConcurrentViewers] = useState(3840);
  const [averageWatchDuration, setAverageWatchDuration] = useState('42 minutes');
  const [audienceRetentionRate, setAudienceRetentionRate] = useState('84.2%');

  // Immersive Virtual Reality (VR) / 360° Spatial Theater States
  const [vrModeActive, setVrModeActive] = useState(false);
  const [spatialAudioPreset, setSpatialAudioPreset] = useState('Savannah 360° Ambience 🌿');
  const [headsetConnected, setHeadsetConnected] = useState(true);
  const [virtualRoomTheme, setVirtualRoomTheme] = useState('Kampala Luxury Penthouse Lounge 🌆');

  // Automated Subtitle Translation Language Selector Modal State
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const availableLanguages = [
    { code: 'en', name: 'English (Original)' },
    { code: 'lg', name: 'Luganda (Uganda)' },
    { code: 'sw', name: 'Swahili (East Africa)' },
    { code: 'fr', name: 'French (Français)' },
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'zh', name: 'Mandarin (中文)' }
  ];

  // Interactive Ad Creator & Schedulizer States
  const [customAdCampaignTitle, setCustomAdCampaignTitle] = useState('');
  const [customAdBudget, setCustomAdBudget] = useState('50');
  const [customAdList, setCustomAdList] = useState([
    { id: 'ad_1', title: 'Dr. Volt Smart Power Surge Protection Spot', duration: '30s', status: 'Scheduled (Next Break)' },
    { id: 'ad_2', title: 'Kampala Eco Tourism Safari Promo', duration: '15s', status: 'Active Rotation' }
  ]);

  // Creator Community Forum & Q&A Board States
  const [forumQuestions, setForumQuestions] = useState([
    { id: 'fq_1', author: 'Nimusiima Asifa', q: 'Will there be a special gorilla tracking documentary next week?', votes: 34 },
    { id: 'fq_2', author: 'Ronald K.', q: 'Can you demonstrate more React Native UI development tips?', votes: 28 }
  ]);
  const [newForumQuestionInput, setNewForumQuestionInput] = useState('');

  // Automated DRM & Content Copyright Protection Shield States
  const [drmWatermarkActive, setDrmWatermarkActive] = useState(true);
  const [geoBlockUgandaOnly, setGeoBlockUgandaOnly] = useState(false);
  const [antiPiracyShieldStatus, setAntiPiracyShieldStatus] = useState('Active (Zero Unauthorized Scraping Detected)');

  useEffect(() => {
    if (useDeviceCamera && mediaStreamRef && Platform.OS === 'web') {
      const timer = setTimeout(() => {
        const videoElement = document.getElementById('webcam-video-preview');
        if (videoElement) {
          videoElement.srcObject = mediaStreamRef;
          videoElement.play().catch(e => console.log('Webcam resume error:', e));
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab, useDeviceCamera]);

  // Real Local File Picker for Pro Editing Studio Timeline
  const handlePickAndUploadVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setIsUploadingFile(true);
      setTimeout(() => {
        setIsUploadingFile(false);
        setTimelineClips(prev => [
          ...prev,
          { id: 'clip_' + Date.now(), name: file.name, duration: 'Local Import' }
        ]);
        Alert.alert('Media Imported 🎞️', `Successfully attached "${file.name}" to your editing timeline.`);
      }, 800);
    } catch (err) {
      setIsUploadingFile(false);
      Alert.alert('Import Error', 'Could not open local media file picker.');
    }
  };

  const handleVote = (option) => {
    if (userVoted) return;
    if (option === 'yes') setPollVotes(prev => ({ ...prev, yes: prev.yes + 1 }));
    else setPollVotes(prev => ({ ...prev, no: prev.no + 1 }));
    setUserVoted(true);
    setSelectedVoteOption(option);
    Alert.alert('Vote Recorded 📊', 'Thank you! Your vote has been tallied and reflected live on the broadcast overlay.');
  };

  const handleSendTip = (amount, giftName) => {
    if (coins < amount) return Alert.alert('Insufficient Coins', 'Top up your in-chat wallet to send super-gifts!');
    setCoins(coins - amount);
    setRaisedCoins(prev => prev + amount);
    setSuperGiftsTotal(prev => prev + (amount * 0.1));
    Alert.alert('Super-Gift Sent! 🎉', `You successfully sent a ${giftName} worth 🪙 ${amount} coins to the creator!`);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now().toString(), user: 'Borris (Host)', text: chatInput }]);
    setChatInput('');
  };

  const handleSendReaction = (emoji) => {
    const newReaction = { id: Date.now().toString() + Math.random(), emoji, left: Math.floor(Math.random() * 80) + 10 };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  const handleBringCallerOnAir = (caller) => {
    setActiveOnAirCaller(caller);
    setIncomingCallRequests(prev => prev.filter(c => c.id !== caller.id));
    Alert.alert('🔴 CALL-IN LIVE ON AIR', `Successfully connected ${caller.name} (${caller.mode}) to the main broadcast audio/video stage!`);
  };

  const handleDisconnectCaller = () => {
    if (activeOnAirCaller) {
      setIncomingCallRequests(prev => [...prev, { id: 'call_' + Date.now(), name: activeOnAirCaller.name, mode: activeOnAirCaller.mode, topic: 'Returned to Green Room' }]);
      setActiveOnAirCaller(null);
      Alert.alert('Call Ended', 'Caller disconnected from main stage and returned to waiting room.');
    }
  };

  const handleBuyMovieTicket = (movie) => {
    if (coins < movie.price) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${movie.price} coins to book a showpass for "${movie.title}". Top up your wallet!`);
    }
    setCoins(coins - movie.price);
    setTicketSalesRevenue(prev => prev + movie.price);
    setSelectedMovieTicket(movie);
    Alert.alert('🎟️ Showpass Booked Successfully!', `Access granted to "${movie.title}" in seat ${selectedCinemaSeat}! Enjoy the screening.`);
  };

  const handleOrderCinemaSnack = (snackName, price) => {
    if (coins < price) return Alert.alert('Insufficient Coins', 'Top up coins to order snacks!');
    setCoins(coins - price);
    setCinemaSnacksCart(prev => [...prev, snackName]);
    Alert.alert('🍿 Snack Ordered!', `Your ${snackName} is being delivered to your virtual seat (${selectedCinemaSeat}) instantly!`);
  };

  const handleStationApplicationSubmitSecure = () => {
    if (!stationApplicantName.trim() || !stationNameInput.trim() || !stationDescriptionInput.trim()) {
      return Alert.alert('Missing Fields', 'Please fill in all required station franchise application fields.');
    }
    setApplicationSubmitted(true);
    Alert.alert(
      '📡 Application Logged to Supabase', 
      `Thank you ${stationApplicantName}! Your TV station "${stationNameInput}" has been submitted to the admin review queue with status pending_admin_review.`
    );
  };

  const handleAddProgramSchedule = () => {
    if (!newProgramTitle.trim() || !newProgramTime.trim()) return Alert.alert('Error', 'Enter both program title and time slot.');
    setEpgChannels(prev => [
      ...prev,
      { id: 'ch_' + Date.now(), number: '0' + (prev.length + 1), name: 'Custom Channel UG', currentShow: newProgramTitle, time: newProgramTime, category: 'Custom' }
    ]);
    setNewProgramTitle('');
    setNewProgramTime('');
    Alert.alert('Schedule Updated 📅', 'New program successfully added to the EPG grid.');
  };

  const handleRunSmartTrim = () => {
    setSmartTrimStatus('Analyzing silence peaks & action moments...');
    setTimeout(() => {
      setSmartTrimStatus('AI Smart Trim Complete! 3 highlights generated.');
      setHighlightReelsCount(prev => prev + 3);
      Alert.alert('AI Smart Trim ✂️', 'Successfully generated 3 viral short-form highlight clips from your broadcast archive.');
    }, 1200);
  };

  const handleAddTimelineClip = () => {
    if (!newClipName.trim()) return Alert.alert('Error', 'Enter clip name.');
    setTimelineClips(prev => [...prev, { id: 'clip_' + Date.now(), name: newClipName, duration: '1m 00s' }]);
    setNewClipName('');
    Alert.alert('Timeline Updated 🎞️', 'New video segment stitched into multi-clip timeline.');
  };

  const handleZeroFrictionPublish = () => {
    if (!masterProjectTitle.trim()) return Alert.alert('Error', 'Please enter a Master Project Title before publishing.');
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      Alert.alert('⚡ Published Successfully!', `Project "${masterProjectTitle}" rendered with multi-clip timeline and broadcasted live to Virtual TV!`);
      setMasterProjectTitle('');
    }, 1000);
  };

  const handleTriggerAdBreak = () => {
    setAdBreakRunning(true);
    Alert.alert('Targeted Ad Insertion (DAI) 📢', 'Broadcasting 30-second commercial break to all connected viewers...');
    setTimeout(() => {
      setAdBreakRunning(false);
      setAdRevenueShare(prev => prev + 15.00);
      setCreatorEarningsUSD(prev => prev + 15.00);
      Alert.alert('Ad Break Complete ✅', 'Commercial break successfully concluded. +$15.00 added to your ad revenue balance.');
    }, 3000);
  };

  const handleSendLocalMeshChat = () => {
    if (!localChatMessage.trim()) return;
    setLocalChatLog([...localChatLog, { id: Date.now().toString(), sender: 'Borris (Host)', text: localChatMessage }]);
    setLocalChatMessage('');
    Alert.alert('Mesh Relay 🛰️', 'Packet broadcasted across local multi-hop mesh nodes without internet connection.');
  };

  const handleAddNewCameraSource = () => {
    if (!newCameraNameInput.trim()) return Alert.alert('Error', 'Enter a name for the new camera source.');
    const newCam = {
      id: 'cam_' + Date.now(),
      name: newCameraNameInput,
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop'
    };
    setCameraFeedsList(prev => [...prev, newCam]);
    setActiveCameraFeed(newCam);
    setUseDeviceCamera(false);
    setNewCameraNameInput('');
    Alert.alert('Multi-Cam Switcher 🎥', `Added and switched live feed to: ${newCam.name}`);
  };

  const toggleDeviceCamera = async () => {
    if (!useDeviceCamera) {
      if (Platform.OS === 'web') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setMediaStreamRef(stream);
          setUseDeviceCamera(true);
          setTimeout(() => {
            const videoElement = document.getElementById('webcam-video-preview');
            if (videoElement) {
              videoElement.srcObject = stream;
              videoElement.play().catch(e => console.log('Autoplay error:', e));
            }
          }, 100);
          Alert.alert('Webcam Live 🔴', 'Laptop webcam successfully connected and broadcasting!');
        } catch (err) {
          Alert.alert('Camera Error', 'Could not access laptop webcam. Verify browser permissions.');
        }
      } else {
        setUseDeviceCamera(true);
        Alert.alert('Camera Live 🔴', 'Mobile device camera activated!');
      }
    } else {
      if (mediaStreamRef && Platform.OS === 'web') {
        mediaStreamRef.getTracks().forEach(track => track.stop());
      }
      setMediaStreamRef(null);
      setUseDeviceCamera(false);
      Alert.alert('Camera Closed ⏹️', 'Switched back to standard multi-cam feed.');
    }
  };

  const getCssFilterString = (filterName) => {
    switch (filterName) {
      case 'Smooth & Glow ✨': return 'brightness(1.1) contrast(0.95) saturate(1.2)';
      case 'Cinematic Warm 🎬': return 'sepia(0.3) contrast(1.1) brightness(1.05)';
      case 'Vivid Nature 🌿': return 'saturate(1.6) contrast(1.1)';
      case 'Studio Noir 🖤': return 'grayscale(1) contrast(1.25)';
      case 'Golden Hour 🌅': return 'sepia(0.5) hue-rotate(-20deg) saturate(1.4)';
      case 'Cyberpunk Neon ⚡': return 'invert(0.1) hue-rotate(180deg) saturate(2)';
      case 'Vintage Retro 📼': return 'sepia(0.6) contrast(1.2) brightness(0.9)';
      default: return 'none';
    }
  };

  const handleAddGhostVaultFile = () => {
    if (!newVaultFileName.trim()) return Alert.alert('Error', 'Enter a file name for the ghost vault.');
    setGhostVaultFiles(prev => [...prev, { id: 'v_' + Date.now(), name: newVaultFileName, size: '2.5 MB', date: 'Just now' }]);
    setNewVaultFileName('');
    Alert.alert('Ghost Vault 🛡️', 'File successfully encrypted and stored in local zero-knowledge vault.');
  };

  const handleAddCustomAd = () => {
    if (!customAdCampaignTitle.trim()) return Alert.alert('Error', 'Enter an ad campaign title.');
    setCustomAdList(prev => [...prev, { id: 'ad_' + Date.now(), title: customAdCampaignTitle, duration: '30s', status: 'Scheduled (Next Rotation)' }]);
    setCustomAdCampaignTitle('');
    Alert.alert('Ad Manager 📢', 'Custom ad campaign successfully added to programmatic rotation pool.');
  };

  const handleAddForumQuestion = () => {
    if (!newForumQuestionInput.trim()) return Alert.alert('Error', 'Enter your question.');
    setForumQuestions(prev => [...prev, { id: 'fq_' + Date.now(), author: 'Borris (Host)', q: newForumQuestionInput, votes: 1 }]);
    setNewForumQuestionInput('');
    Alert.alert('Q&A Board ❓', 'Question successfully posted to live audience Q&A ticker.');
  };

  const totalVotes = pollVotes.yes + pollVotes.no;
  const yesPercentage = totalVotes > 0 ? Math.round((pollVotes.yes / totalVotes) * 100) : 50;
  const noPercentage = totalVotes > 0 ? 100 - yesPercentage : 50;

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 160, padding: 12 }}>
      
      {/* HEADER & EARNINGS BANNER */}
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>📺 ChatUp Virtual TV & Ultimate Broadcast Suite</Text>
          <Text style={styles.subtitle}>Linear Channels, VR Theaters, Advanced Analytics, Security & Monetization</Text>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsLabel}>Creator Earnings 💵</Text>
          <Text style={styles.earningsAmount}>${creatorEarningsUSD.toFixed(2)}</Text>
        </View>
      </View>

      {/* TOP NAVIGATION TABS (ALL 12 TABS FULLY PRESERVED) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true} 
        style={styles.navRow}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {[
          { key: 'Guide', label: '📺 TV Guide & EPG' },
          { key: 'Live', label: '🔴 Live & Camera Feed' },
          { key: 'CatchUp', label: '⏪ Catch-Up TV & DVR' },
          { key: 'WatchParty', label: '👥 Watch Party' },
          { key: 'Studio', label: '🎛️ Presenter & Safety Studio' },
          { key: 'ProEditing', label: '🎞️ Pro Editing & AI Suite' },
          { key: 'Monetization', label: '🪙 Earnings & Payouts' },
          { key: 'Cinema', label: '🍿 Virtual Cinema Hall' },
          { key: 'OwnTV', label: '📡 Own a TV Station' },
          { key: 'Mesh', label: '🛰️ Zero-Net & Ghost Vault' },
          { key: 'Analytics', label: '📊 Audience & Heatmap' },
          { key: 'VirtualVR', label: '🥽 360° VR & Spatial Theater' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navTab, activeTab === tab.key && styles.activeNavTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.navTabText, activeTab === tab.key && styles.activeNavTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ================= TAB 1: TV GUIDE & EPG ================= */}
      {activeTab === 'Guide' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>📅 Linear Channel EPG & Schedule Grid</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Browse virtual channels or add custom programs to your station schedule.</Text>
          
          {epgChannels.map(ch => (
            <View key={ch.id} style={[styles.epgCard, isDarkMode && styles.darkCard]}>
              <View style={styles.epgChannelBadge}>
                <Text style={styles.epgChannelNumber}>CH {ch.number}</Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.epgChannelName, isDarkMode && styles.darkText]}>{ch.name} <Text style={{ fontSize: 10, color: '#3182ce' }}>({ch.category})</Text></Text>
                <Text style={[styles.epgShowTitle, isDarkMode && { color: '#cbd5e0' }]}>{ch.currentShow}</Text>
                <Text style={[styles.epgTimeText, isDarkMode && { color: '#a0aec0' }]}>🕒 {ch.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.watchChannelBtn} 
                onPress={() => { setCurrentChannel({ ...ch, videoUrl: currentChannel.videoUrl }); setActiveTab('Live'); }}
              >
                <Text style={styles.watchChannelText}>Tune In 📺</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 10 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>➕ Add New Station Program Schedule</Text>
            <TextInput
              style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
              placeholder="Program Title (e.g. Evening Wildlife Safari)..."
              placeholderTextColor="#a0aec0"
              value={newProgramTitle}
              onChangeText={setNewProgramTitle}
            />
            <TextInput
              style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
              placeholder="Time Slot (e.g. 06:00 PM - 08:00 PM)..."
              placeholderTextColor="#a0aec0"
              value={newProgramTime}
              onChangeText={setNewProgramTime}
            />
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleAddProgramSchedule}>
              <Text style={styles.actionBtnText}>Add Program to EPG Grid ➕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= TAB 2: LIVE STREAMING & FLOATING CAMERA VIEWPORT ================= */}
      {activeTab === 'Live' && (
        <View style={styles.sectionContainer}>
          
          <View style={[
            styles.videoViewport, 
            isExpandedCameraMode ? { height: 320 } : { height: 210 },
            isPipActive && { height: 120, width: 200, alignSelf: 'flex-end', marginBottom: 4 }
          ]}>
            {useDeviceCamera ? (
              Platform.OS === 'web' ? (
                <video
                  id="webcam-video-preview"
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000',
                    filter: getCssFilterString(activeCameraFilter),
                    WebkitFilter: getCssFilterString(activeCameraFilter)
                  }}
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                  <Text style={{ fontSize: 36, marginBottom: 4 }}>🔴📹</Text>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>[Live Mobile Camera Active]</Text>
                  <Text style={{ color: '#63b3ed', fontSize: 11, marginTop: 4 }}>✨ Active Filter: {activeCameraFilter}</Text>
                </View>
              )
            ) : (
              <Image 
                source={{ uri: activeCameraFeed.url }} 
                style={[
                  styles.videoScreen, 
                  Platform.OS === 'web' && {
                    filter: getCssFilterString(activeCameraFilter),
                    WebkitFilter: getCssFilterString(activeCameraFilter)
                  }
                ]} 
                resizeMode="cover" 
              />
            )}

            {activeOnAirCaller && (
              <View style={styles.onAirCallerOverlay}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🎙️ ON-AIR CALLER: {activeOnAirCaller.name} ({activeOnAirCaller.mode})</Text>
                <TouchableOpacity style={{ backgroundColor: '#e53e3e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 }} onPress={handleDisconnectCaller}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>Drop Call 🛑</Text>
                </TouchableOpacity>
              </View>
            )}

            {adBreakRunning && (
              <View style={styles.adOverlayBox}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>📢 COMMERCIAL BREAK (DAI)</Text>
                <Text style={{ color: '#cbd5e0', fontSize: 11, marginTop: 4 }}>Broadcasting partner advertisements...</Text>
              </View>
            )}

            {floatingReactions.map(r => (
              <View key={r.id} style={{ position: 'absolute', bottom: 50, left: `${r.left}%`, zIndex: 99 }}>
                <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
              </View>
            ))}

            <View style={styles.floatingTopBarOverlay}>
              <View style={styles.liveBadgeOverlay}>
                <Text style={styles.liveBadgeText}>🔴 LIVE • {currentChannel.viewers}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.expandToggleOverlayBtn}
                onPress={() => setIsExpandedCameraMode(!isExpandedCameraMode)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  {isExpandedCameraMode ? 'Shrink View ↙️' : 'Enlarge Stage ↗️'}
                </Text>
              </TouchableOpacity>
            </View>

            {currentChannel.isOfficial && !useDeviceCamera && (
              <View style={styles.verifiedBadgeOverlay}>
                <Text style={styles.verifiedBadgeText}>🛡️ Official Partner</Text>
              </View>
            )}

            <View style={styles.videoInfoOverlay}>
              <Text style={styles.videoTitleText}>{currentChannel.title}</Text>
              <Text style={styles.videoSubText}>
                {useDeviceCamera ? `Broadcasting via Webcam (${activeCameraFilter})` : `Feed: ${activeCameraFeed.name} | Filter: ${activeCameraFilter}`}
              </Text>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { paddingVertical: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <TouchableOpacity 
                  style={[styles.angleChip, isPipActive && styles.activeAngleChip]} 
                  onPress={() => setIsPipActive(!isPipActive)}
                >
                  <Text style={[styles.angleChipText, isPipActive && { color: '#fff' }]}>{isPipActive ? 'Expand View 🔲' : 'Mini PiP 📺'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.angleChip, showDiagnostics && styles.activeAngleChip]} 
                  onPress={() => setShowDiagnostics(!showDiagnostics)}
                >
                  <Text style={[styles.angleChipText, showDiagnostics && { color: '#fff' }]}>{showDiagnostics ? 'Hide HUD 📊' : 'Stream Stats 📊'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.angleChip, lowBandwidthMode && styles.activeAngleChip]}
                  onPress={() => {
                    setLowBandwidthMode(!lowBandwidthMode);
                    Alert.alert('Data Saver Mode', !lowBandwidthMode ? '📉 Low-bandwidth compression active (optimized for 2G/3G in Uganda).' : '⚡ Standard HD bandwidth restored.');
                  }}
                >
                  <Text style={[styles.angleChipText, lowBandwidthMode && { color: '#fff' }]}>{lowBandwidthMode ? 'Data Saver ON 📉' : 'Data Saver 📶'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: '#2b6cb0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                onPress={() => {
                  const qualities = ['Auto 1080p (HLS Adaptive)', '720p HD (Stable)', '480p SD (Data Saver)', '360p Low Bandwidth'];
                  const nextQ = qualities[(qualities.indexOf(streamQuality) + 1) % qualities.length];
                  setStreamQuality(nextQ);
                  Alert.alert('Stream Quality', `Bitrate profile locked to: ${nextQ}`);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>⚙️ {streamQuality.split(' ')[0]}</Text>
              </TouchableOpacity>
            </View>

            {showDiagnostics && (
              <View style={{ backgroundColor: '#000', padding: 8, borderRadius: 6, marginTop: 6 }}>
                <Text style={{ color: '#48bb78', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>⚡ Bitrate: 4,200 kbps | Codec: H.264/AAC</Text>
                <Text style={{ color: '#48bb78', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>🛰️ Latency: 1.2s (Ultra-Low) | Dropped Frames: 0</Text>
                <Text style={{ color: '#48bb78', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>🌐 CDN Edge: Kampala Node #4 (Uganda Telecom)</Text>
                <Text style={{ color: '#48bb78', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>🛡️ DRM Encryption: AES-128 Active</Text>
              </View>
            )}
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }]}>
            {['❤️', '🔥', '🐘', '🐆', '👏', '🎉', '🚀', '🇺🇬'].map(emoji => (
              <TouchableOpacity key={emoji} onPress={() => handleSendReaction(emoji)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎙️ Enterprise Live Call-In Queue (Audio & Video)</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(true)} style={{ backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🌐 Subtitle Language ⚙️</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Review incoming viewer call requests and bring them live onto the main broadcast stage:</Text>

            {incomingCallRequests.length === 0 ? (
              <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#718096', textAlign: 'center', padding: 6 }}>No pending callers in queue.</Text>
            ) : (
              incomingCallRequests.map(caller => (
                <View key={caller.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{caller.name} <Text style={{ color: '#3182ce', fontSize: 10 }}>({caller.mode})</Text></Text>
                    <Text style={{ fontSize: 10, color: '#718096' }}>Topic: {caller.topic}</Text>
                  </View>
                  <TouchableOpacity style={{ backgroundColor: '#38a169', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }} onPress={() => handleBringCallerOnAir(caller)}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Bring Live 🎙️</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: useDeviceCamera ? '#e53e3e' : '#e2e8f0', borderWidth: useDeviceCamera ? 2 : 1 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💻 Built-in Laptop Webcam & Variety Filters</Text>
              <TouchableOpacity 
                style={[styles.actionBtnBlue, { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: useDeviceCamera ? '#e53e3e' : '#3182ce' }]} 
                onPress={toggleDeviceCamera}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                  {useDeviceCamera ? 'Stop Webcam ⏹️' : 'Start Laptop Webcam 🔴'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>Select professional look & live color grading filters (applies instantly to live feed):</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {filterOptions.map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.angleChip, activeCameraFilter === filter && styles.activeAngleChip]}
                  onPress={() => {
                    setActiveCameraFilter(filter);
                    Alert.alert('Filter Applied 🎨', `Successfully applied "${filter}" grading.`);
                  }}
                >
                  <Text style={[styles.angleChipText, activeCameraFilter === filter && { color: '#fff' }]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎥 Interactive Multi-Camera Switcher & Feeds</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Tap any camera feed below to switch the live program output instantly:</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {cameraFeedsList.map(cam => (
                <TouchableOpacity
                  key={cam.id}
                  style={[
                    styles.angleChip, 
                    !useDeviceCamera && activeCameraFeed.id === cam.id && styles.activeAngleChip
                  ]}
                  onPress={() => {
                    setActiveCameraFeed(cam);
                    setUseDeviceCamera(false);
                    Alert.alert('Switcher Live 🎥', `Switched live program feed to: ${cam.name}`);
                  }}
                >
                  <Text style={[
                    styles.angleChipText, 
                    !useDeviceCamera && activeCameraFeed.id === cam.id && { color: '#fff' }
                  ]}>
                    {!useDeviceCamera && activeCameraFeed.id === cam.id ? '🟢 ' : ''}{cam.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12, marginTop: 4 }]}>➕ Add New Camera Input Source</Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                style={[styles.chatInput, { flex: 1, height: 36, marginBottom: 0 }, isDarkMode && styles.darkInput]}
                placeholder="Camera Name (e.g. Camera 5 - Studio Overhead)..."
                placeholderTextColor="#a0aec0"
                value={newCameraNameInput}
                onChangeText={setNewCameraNameInput}
              />
              <TouchableOpacity style={[styles.actionBtnBlue, { marginLeft: 6, paddingVertical: 8, paddingHorizontal: 12 }]} onPress={handleAddNewCameraSource}>
                <Text style={styles.actionBtnText}>Add Cam ➕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎯 Live Community Fundraising Goal</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38a169' }}>🪙 {raisedCoins} / {fundraisingGoal} Coins</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (raisedCoins / fundraisingGoal) * 100)}%` }]} />
            </View>
            <Text style={{ fontSize: 11, color: '#718096', marginVertical: 8 }}>Support this virtual TV station instantly with MoMo or in-app coin super-gifts:</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.giftBtnBlue} onPress={() => handleSendTip(50, 'Coffee ☕')}>
                <Text style={styles.giftBtnText}>☕ Tip 50</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.giftBtnGold} onPress={() => handleSendTip(250, 'Leopard 🐆')}>
                <Text style={styles.giftBtnText}>🐆 Gift 250</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.giftBtnRed} onPress={() => handleSendTip(500, 'Elephant 🐘')}>
                <Text style={styles.giftBtnText}>🐘 Super 500</Text>
              </TouchableOpacity>
            </View>
          </View>

          {pollActive && (
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📊 Live Interactive Viewer Poll</Text>
              <Text style={[styles.pollQuestionText, isDarkMode && styles.darkText]}>{pollQuestion}</Text>
              
              {!userVoted ? (
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <TouchableOpacity style={[styles.pollOptionBtn, { backgroundColor: '#3182ce', flex: 1, marginRight: 6 }]} onPress={() => handleVote('yes')}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>👍 Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.pollOptionBtn, { backgroundColor: '#e53e3e', flex: 1, marginLeft: 6 }]} onPress={() => handleVote('no')}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>👎 No</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#38a169', marginBottom: 6 }}>✓ Your Vote ({selectedVoteOption?.toUpperCase()}) Recorded Successfully!</Text>
                  
                  <View style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={[{ fontSize: 11 }, isDarkMode && styles.darkText]}>👍 Yes ({pollVotes.yes} votes)</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{yesPercentage}%</Text>
                    </View>
                    <View style={styles.pollBarBg}>
                      <View style={[styles.pollBarFill, { width: `${yesPercentage}%`, backgroundColor: '#3182ce' }]} />
                    </View>
                  </View>

                  <View style={{ marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={[{ fontSize: 11 }, isDarkMode && styles.darkText]}>👎 No ({pollVotes.no} votes)</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#e53e3e' }}>{noPercentage}%</Text>
                    </View>
                    <View style={styles.pollBarBg}>
                      <View style={[styles.pollBarFill, { width: `${noPercentage}%`, backgroundColor: '#e53e3e' }]} />
                    </View>
                  </View>
                </View>
              )}
              <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#718096', textAlign: 'center', marginTop: 6 }}>Total Tally: {totalVotes} viewer responses recorded in real-time.</Text>
            </View>
          )}
        </View>
      )}

      {/* ================= TAB 3: CATCH-UP TV & DVR ================= */}
      {activeTab === 'CatchUp' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>⏪ On-Demand Catch-Up TV (Restart TV & DVR)</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Rewind live broadcasts or watch programs missed over the past 7 days on-demand.</Text>

          {[
            { id: 'dvr_1', show: 'Morning Wildlife Breakfast Expedition', channel: 'Talk with Nature HD', date: 'Yesterday, 08:00 AM', duration: '2h 15m' },
            { id: 'dvr_2', show: 'Kampala Tech & Innovation Forum', channel: 'Global News Network', date: '2 days ago', duration: '1h 45m' },
            { id: 'dvr_3', show: 'East African Acoustic Sessions', channel: 'Studio UG Music', date: '3 days ago', duration: '3h 00m' },
            { id: 'dvr_4', show: 'Gorillas in the Mist Special Feature', channel: 'Pearl Africa Cinema', date: '4 days ago', duration: '1h 50m' },
          ].map(item => (
            <View key={item.id} style={[styles.dvrCard, isDarkMode && styles.darkCard]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dvrTitle, isDarkMode && styles.darkText]}>{item.show}</Text>
                <Text style={{ fontSize: 11, color: '#3182ce' }}>{item.channel} • {item.date}</Text>
                <Text style={[styles.dvrSubText, isDarkMode && { color: '#a0aec0' }]}>Duration: {item.duration} • 7-Day EPG Archive</Text>
              </View>
              <TouchableOpacity style={styles.dvrPlayBtn} onPress={() => Alert.alert('Catch-Up Playback', `Starting DVR stream for "${item.show}"`)}>
                <Text style={styles.dvrPlayText}>▶ Watch DVR</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ================= TAB 4: SYNCHRONIZED WATCH PARTIES ================= */}
      {activeTab === 'WatchParty' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>👥 Synchronized Watch Party (Virtual Living Room)</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>
            What this is: A shared virtual lounge where friends or communities watch the exact same TV broadcast simultaneously. Playback is locked in sync across all devices, so when someone pauses or cheers, everyone experiences it together in real-time.
          </Text>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔗 Room Code: <Text style={{ color: '#3182ce' }}>{watchPartyRoomCode}</Text></Text>
              <TouchableOpacity 
                style={{ backgroundColor: isHostControlLocked ? '#38a169' : '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => {
                  setIsHostControlLocked(!isHostControlLocked);
                  Alert.alert('Host Sync', !isHostControlLocked ? '🔒 Strict host playback lock enabled.' : '🔓 Anyone in room can control playback.');
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{isHostControlLocked ? 'Host Control: LOCKED 🔒' : 'UNLOCKED 🔓'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>Current Host: {watchPartyHostName}</Text>
            
            <Text style={[{ fontSize: 11, fontWeight: 'bold', marginTop: 4, marginBottom: 4 }, isDarkMode && styles.darkText]}>Participants in Room ({watchPartyParticipants.length}):</Text>
            {watchPartyParticipants.map(p => (
              <View key={p.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 6, borderRadius: 6, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[{ fontSize: 11 }, isDarkMode && styles.darkText]}>{p.name} <Text style={{ color: '#3182ce', fontSize: 10 }}>({p.role})</Text></Text>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#38a169' }}>{p.status}</Text>
              </View>
            ))}
          </View>

          <View style={styles.watchPartyScreen}>
            <Image source={{ uri: currentChannel.videoUrl }} style={{ width: '100%', height: 180, borderRadius: 8 }} resizeMode="cover" />
            <View style={styles.syncBadge}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🟢 Playback Millisecond Synced</Text>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { flex: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💬 Watch Party Room Chat & Reactions</Text>
            <ScrollView style={{ height: 140, marginBottom: 8, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 8 }}>
              {chatMessages.map(msg => (
                <View key={msg.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{msg.user}: <Text style={{ fontWeight: 'normal', color: isDarkMode ? '#fff' : '#2d3748' }}>{msg.text}</Text></Text>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                style={[styles.chatInput, { flex: 1, height: 36 }, isDarkMode && styles.darkInput]}
                placeholder="Say something to the room..."
                placeholderTextColor="#a0aec0"
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendChat}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ================= TAB 5: PRESENTER STUDIO & SAFETY CONTROLS ================= */}
      {activeTab === 'Studio' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🎛️ Presenter Studio & Master Safety Controls</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Director controls, hardware signal testing, face hiding, and kill switch.</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 2 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 External Hardware Signal & RTMP/SRT Relay</Text>
            <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: '#3182ce' }}>Ingest URL: {rtmpEndpointUrl}</Text>
              <Text style={{ fontSize: 11, color: '#3182ce' }}>Stream Key: {rtmpStreamKey}</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: hardwareSignalStatus.includes('Online') ? '#38a169' : '#e53e3e', marginTop: 4 }}>Status: {hardwareSignalStatus}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.actionBtnBlue, { flex: 1, marginRight: 4 }]} onPress={() => setHardwareSignalStatus('Online & Receiving Hardware Stream 🟢')}>
                <Text style={styles.actionBtnText}>Test Hardware Signal 📡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnRed, { flex: 1, marginLeft: 4 }]} onPress={() => setHardwareSignalStatus('Offline (Waiting for Switcher Signal)')}>
                <Text style={styles.actionBtnText}>Cut Signal 🛑</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: killSwitchEngaged ? '#e53e3e' : '#cbd5e0', borderWidth: 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🚨 Master Broadcast Safety & Kill Switch</Text>
              <TouchableOpacity 
                style={{ backgroundColor: killSwitchEngaged ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                onPress={() => { setKillSwitchEngaged(!killSwitchEngaged); Alert.alert('Kill Switch', !killSwitchEngaged ? '🚨 BROADCAST TAKEN OFF-AIR!' : '🟢 Broadcast restored.'); }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{killSwitchEngaged ? 'Restore Air 🟢' : 'ENGAGE KILL SWITCH'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Buffer Delay: {broadcastDelay}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={[styles.toggleBtn, faceAnonymization && { backgroundColor: '#3182ce' }]} 
                onPress={() => setFaceAnonymization(!faceAnonymization)}
              >
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: faceAnonymization ? '#fff' : '#2d3748' }}>👤 Face Hiding: {faceAnonymization ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, voiceScrambler && { backgroundColor: '#3182ce' }]} 
                onPress={() => setVoiceScrambler(!voiceScrambler)}
              >
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: voiceScrambler ? '#fff' : '#2d3748' }}>🎙️ Voice Scramble: {voiceScrambler ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🌍 AI-Powered Voice Cloning & Dubbing</Text>
              <TouchableOpacity 
                style={{ backgroundColor: aiDubbingActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => setAiDubbingActive(!aiDubbingActive)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{aiDubbingActive ? 'Dubbing: ACTIVE 🟢' : 'OFF ⚪'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Real-time neural voice cloning translating English/Swahili films into regional languages on the fly.</Text>
            <TouchableOpacity style={{ backgroundColor: '#2b6cb0', padding: 8, borderRadius: 6, alignItems: 'center' }} onPress={() => setSelectedDubLanguage(selectedDubLanguage === 'Luganda 🇺🇬' ? 'Swahili 🇹🇿' : 'Luganda 🇺🇬')}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Target Language: {selectedDubLanguage} (Tap to Switch)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= TAB 6: PRO VIDEO EDITING & AI SUITE (WITH REAL FILE PICKER) ================= */}
      {activeTab === 'ProEditing' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🎞️ Pro Video Editing & AI Studio Suite</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Multi-clip timeline stitching, local file upload, AI smart trim, teleprompter, and broadcast rendering.</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📜 AI Live Teleprompter & Script Scroll</Text>
            <TextInput
              style={[styles.chatInput, { height: 70, textAlignVertical: 'top', marginBottom: 8 }, isDarkMode && styles.darkInput]}
              multiline
              value={teleprompterText}
              onChangeText={setTeleprompterText}
            />
            <Text style={{ fontSize: 10, color: '#718096' }}>Scroll speed auto-synces with speech detection during live broadcast.</Text>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎚️ Professional Audio Denoise & Scene Transitions</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 }}>
              <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>AI Studio Audio Denoise Filter:</Text>
              <TouchableOpacity 
                style={{ backgroundColor: audioDenoiseActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => setAudioDenoiseActive(!audioDenoiseActive)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{audioDenoiseActive ? 'ACTIVE 🟢' : 'OFF ⚪'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginTop: 6, marginBottom: 4 }}>Scene Transition Effect:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Crossfade 🎬', 'Dynamic Wipe ⚡', 'Glitch FX 👾', 'Fade to Black 🖤'].map(trans => (
                <TouchableOpacity
                  key={trans}
                  style={[styles.angleChip, activeTransition === trans && styles.activeAngleChip]}
                  onPress={() => {
                    setActiveTransition(trans);
                    Alert.alert('Transition Set', `Active switcher transition set to: ${trans}`);
                  }}
                >
                  <Text style={[styles.angleChipText, activeTransition === trans && { color: '#fff' }]}>{trans}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚙️ Broadcast Resolution & Frame Rate Encoder</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
              {['60 FPS (Ultra HD)', '30 FPS (Standard)', '1080p 60fps CBR', '720p 30fps Mobile'].map(fps => (
                <TouchableOpacity
                  key={fps}
                  style={[styles.angleChip, targetFps === fps && styles.activeAngleChip]}
                  onPress={() => {
                    setTargetFps(fps);
                    Alert.alert('Encoder Updated', `Output encoder locked to: ${fps}`);
                  }}
                >
                  <Text style={[styles.angleChipText, targetFps === fps && { color: '#fff' }]}>{fps}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎞️ Multi-Clip Timeline & Local Video Upload</Text>
            
            <TouchableOpacity 
              style={[styles.actionBtnGreen, { marginBottom: 10, flexDirection: 'row', justifyContent: 'center' }]} 
              onPress={handlePickAndUploadVideo}
              disabled={isUploadingFile}
            >
              {isUploadingFile ? <ActivityIndicator color="#fff" style={{ marginRight: 6 }} /> : null}
              <Text style={styles.actionBtnText}>{isUploadingFile ? 'Uploading to Studio Storage...' : '📁 Upload & Attach Local Video File'}</Text>
            </TouchableOpacity>

            {timelineClips.map((clip, index) => (
              <View key={clip.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 6, borderRadius: 6, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>#{index + 1} {clip.name} ({clip.duration})</Text>
                <TouchableOpacity onPress={() => setTimelineClips(prev => prev.filter(c => c.id !== clip.id))}>
                  <Text style={{ color: '#e53e3e', fontSize: 10, fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={[styles.chatInput, { marginBottom: 8, marginTop: 4 }, isDarkMode && styles.darkInput]}
              placeholder="Manual clip name / scene..."
              placeholderTextColor="#a0aec0"
              value={newClipName}
              onChangeText={setNewClipName}
            />
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleAddTimelineClip}>
              <Text style={styles.actionBtnText}>Add Manual Clip ➕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>✂️ AI Smart Trim & Highlight Reels</Text>
              <View style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                <Text style={{ color: '#2b6cb0', fontSize: 10, fontWeight: 'bold' }}>Clips Generated: {highlightReelsCount}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Automatically detects peak engagement and wildlife action moments for short clips:</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 8 }}>Status: {smartTrimStatus}</Text>
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleRunSmartTrim}>
              <Text style={styles.actionBtnText}>Run AI Smart Trim Analysis 🎬</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💬 Closed Captioning & AI Subtitles</Text>
              <TouchableOpacity 
                style={{ backgroundColor: closedCaptionsActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => setClosedCaptionsActive(!closedCaptionsActive)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{closedCaptionsActive ? 'CC Engine: ON 🟢' : 'OFF ⚪'}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Active Language: {captionLanguage}</Text>
              <Text style={[{ fontSize: 11, fontStyle: 'italic', marginTop: 2 }, isDarkMode && styles.darkText]}>"{latestCaptionSample}"</Text>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 2 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚡ Zero-Friction One-Tap Publish Suite</Text>
            <TextInput
              style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
              placeholder="Master Project Title (e.g. Bwindi Wildlife Special)..."
              placeholderTextColor="#a0aec0"
              value={masterProjectTitle}
              onChangeText={setMasterProjectTitle}
            />
            <TouchableOpacity 
              style={[styles.actionBtnGreen, { paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} 
              onPress={handleZeroFrictionPublish}
              disabled={isPublishing}
            >
              {isPublishing ? <ActivityIndicator color="#fff" style={{ marginRight: 6 }} /> : null}
              <Text style={[styles.actionBtnText, { fontSize: 14 }]}>
                {isPublishing ? 'Rendering & Broadcasting...' : '⚡ Zero-Friction One-Tap Publish 🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= TAB 7: CREATOR EARNINGS & MONETIZATION ================= */}
      {activeTab === 'Monetization' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🪙 Virtual TV Channel Monetization & Treasury</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Advanced commercial ad insertion, subscriptions, and instant payout gateway:</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💰 Revenue Streams & Ad Management</Text>
            
            <View style={styles.earnRow}>
              <Text style={[styles.earnTitle, isDarkMode && styles.darkText]}>1. Targeted Dynamic Ad Insertion (DAI)</Text>
              <Text style={styles.earnVal}>${adRevenueShare.toFixed(2)}</Text>
            </View>
            <Text style={styles.earnDesc}>Programmatic ad server framework integrated into the HLS pipeline serving local commercials.</Text>

            <TouchableOpacity 
              style={[styles.actionBtnBlue, { marginVertical: 8, backgroundColor: '#d69e2e' }]}
              onPress={handleTriggerAdBreak}
              disabled={adBreakRunning}
            >
              <Text style={styles.actionBtnText}>{adBreakRunning ? 'Broadcasting Commercial Break...' : '📢 Trigger Commercial Ad Break Now ($15)'}</Text>
            </TouchableOpacity>

            <View style={styles.earnRow}>
              <Text style={[styles.earnTitle, isDarkMode && styles.darkText]}>2. Wildlife Super-Gifts & Tips</Text>
              <Text style={styles.earnVal}>${superGiftsTotal.toFixed(2)}</Text>
            </View>
            <Text style={styles.earnDesc}>Viewers send in-app coins (Cows, Leopards, Elephants) convertible to cash via Mobile Money (MoMo).</Text>

            <View style={styles.earnRow}>
              <Text style={[styles.earnTitle, isDarkMode && styles.darkText]}>3. Cinema Showpasses & Ticket Sales</Text>
              <Text style={styles.earnVal}>${ticketSalesRevenue.toFixed(2)}</Text>
            </View>
            <Text style={styles.earnDesc}>Exclusive ticketed screenings, live premieres, and monthly eco-supporter subscriptions.</Text>

            <View style={styles.earnRow}>
              <Text style={[styles.earnTitle, isDarkMode && styles.darkText]}>4. Monthly VIP Channel Memberships</Text>
              <Text style={styles.earnVal}>{subscriberCount} Active Fans</Text>
            </View>
            <Text style={styles.earnDesc}>Recurring monthly support generating steady creator revenue ($5.00/month per subscriber).</Text>

            <View style={styles.totalEarnBox}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2b6cb0' }}>Total Withdrawable Payout Balance:</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#38a169' }}>${creatorEarningsUSD.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.payoutBtn} onPress={() => Alert.alert('MoMo Payout', 'Successfully initiated Mobile Money (MoMo) withdrawal request for $' + creatorEarningsUSD.toFixed(2))}>
              <Text style={styles.payoutBtnText}>Withdraw via Mobile Money (MoMo) 📱</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= TAB 8: VIRTUAL CINEMA HALL & SNACK BAR ================= */}
      {activeTab === 'Cinema' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🍿 Virtual Cinema Hall & VIP Premieres</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Book showpasses, choose VIP seating, and order snacks for exclusive cinematic premieres.</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💺 Select Your Virtual Cinema Seat Tier</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {['Stalls Row 3 (🪙 50)', 'VIP Box A-12 (🪙 100)', 'Balcony Royal (🪙 150)'].map(seat => (
                <TouchableOpacity
                  key={seat}
                  style={[styles.angleChip, selectedCinemaSeat === seat && styles.activeAngleChip]}
                  onPress={() => setSelectedCinemaSeat(seat)}
                >
                  <Text style={[styles.angleChipText, selectedCinemaSeat === seat && { color: '#fff' }]}>{seat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12, marginTop: 4 }]}>🍿 Virtual Concession Stand (Snacks & Drinks)</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <TouchableOpacity style={styles.snackBtn} onPress={() => handleOrderCinemaSnack(' Jumbo Popcorn 🍿', 20)}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🍿 Popcorn (20)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.snackBtn} onPress={() => handleOrderCinemaSnack(' Cold Soda 🥤', 15)}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🥤 Soda (15)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.snackBtn} onPress={() => handleOrderCinemaSnack(' Hot Samosa 🥟', 25)}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🥟 Samosa (25)</Text>
              </TouchableOpacity>
            </View>
            {cinemaSnacksCart.length > 0 && (
              <Text style={{ fontSize: 11, color: '#38a169', marginTop: 4, fontWeight: 'bold' }}>Snacks Ordered to Seat: {cinemaSnacksCart.join(', ')}</Text>
            )}
          </View>

          {cinemaMovies.map(movie => (
            <View key={movie.id} style={[styles.card, isDarkMode && styles.darkCard, { flexDirection: 'row', alignItems: 'center' }]}>
              <Image source={{ uri: movie.poster }} style={{ width: 80, height: 110, borderRadius: 8, marginRight: 10 }} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12 }]}>{movie.title}</Text>
                <Text style={{ fontSize: 11, color: '#3182ce', marginBottom: 2 }}>{movie.genre} • {movie.duration}</Text>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#e53e3e', marginBottom: 6 }}>{movie.status}</Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#d69e2e', marginBottom: 6 }}>🎟️ Showpass: 🪙 {movie.price} Coins</Text>
                
                <TouchableOpacity 
                  style={{ backgroundColor: '#38a169', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-start' }}
                  onPress={() => handleBuyMovieTicket(movie)}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Book Showpass 🎟️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {selectedMovieTicket && (
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#38a169', borderWidth: 2 }]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎬 Now Screening in Virtual Cinema VIP Room</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38a169', marginBottom: 4 }}>Access Active: {selectedMovieTicket.title} ({selectedCinemaSeat})</Text>
              <Image source={{ uri: selectedMovieTicket.poster }} style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
              <TouchableOpacity style={styles.actionBtnBlue} onPress={() => Alert.alert('Cinema Player', 'Entering immersive fullscreen theater mode with live audience chat...')}>
                <Text style={styles.actionBtnText}>Enter Fullscreen Theater Mode 🍿</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ================= TAB 9: OWN A TV STATION FRANCHISE (WITH SECURE REVIEW QUEUE) ================= */}
      {activeTab === 'OwnTV' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>📡 "Own a TV Station" Franchise Application Portal</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Launch your own independent linear virtual TV channel on the ChatUp global network with automated EPG and monetization.</Text>

          {!applicationSubmitted ? (
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 2 }]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📝 Comprehensive TV Station Franchise Application Form</Text>
              
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Applicant Full Name (Legal Owner):</Text>
              <TextInput
                style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
                placeholder="e.g. Borris Ahabwamukama..."
                placeholderTextColor="#a0aec0"
                value={stationApplicantName}
                onChangeText={setStationApplicantName}
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Desired TV Station / Channel Name:</Text>
              <TextInput
                style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
                placeholder="e.g. Pearl Africa Wildlife TV..."
                placeholderTextColor="#a0aec0"
                value={stationNameInput}
                onChangeText={setStationNameInput}
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Primary Broadcast Genre & Category:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {['Eco & Wildlife 🌿', 'Sports & League ⚽', 'Music & Indie Beats 🎶', 'Tech & Innovation 💡', 'Global News 📰'].map(genre => (
                  <TouchableOpacity
                    key={genre}
                    style={[styles.angleChip, stationGenreInput === genre && styles.activeAngleChip]}
                    onPress={() => setStationGenreInput(genre)}
                  >
                    <Text style={[styles.angleChipText, stationGenreInput === genre && { color: '#fff' }]}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Automated Scheduling & Loop Tier:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {['24/7 Automated Linear Loop', 'Live-to-Air Scheduled Blocks', 'Hybrid DVR & On-Demand Archive'].map(tier => (
                  <TouchableOpacity
                    key={tier}
                    style={[styles.angleChip, stationScheduleTier === tier && styles.activeAngleChip]}
                    onPress={() => setStationScheduleTier(tier)}
                  >
                    <Text style={[styles.angleChipText, stationScheduleTier === tier && { color: '#fff' }]}>{tier}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Preferred Creator Payout Gateway:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {['Mobile Money (MTN / Airtel UG)', 'USDT / Crypto Wallet', 'Direct Bank Wire'].map(pay => (
                  <TouchableOpacity
                    key={pay}
                    style={[styles.angleChip, stationPayoutMethod === pay && styles.activeAngleChip]}
                    onPress={() => setStationPayoutMethod(pay)}
                  >
                    <Text style={[styles.angleChipText, stationPayoutMethod === pay && { color: '#fff' }]}>{pay}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Station Mission & Programming Summary:</Text>
              <TextInput
                style={[styles.chatInput, { height: 60, textAlignVertical: 'top', marginBottom: 10 }, isDarkMode && styles.darkInput]}
                placeholder="Describe your target audience and scheduled programs..."
                placeholderTextColor="#a0aec0"
                multiline
                value={stationDescriptionInput}
                onChangeText={setStationDescriptionInput}
              />

              <TouchableOpacity style={styles.actionBtnGreen} onPress={handleStationApplicationSubmitSecure}>
                <Text style={styles.actionBtnText}>Submit Application for Admin Review 🚀</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 2, alignItems: 'center', padding: 20 }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>⏳📡</Text>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 15, textAlign: 'center' }]}>Application Pending Admin Review</Text>
              <Text style={{ fontSize: 12, color: '#3182ce', textAlign: 'center', marginBottom: 6, fontWeight: 'bold' }}>Station: {stationNameInput} ({stationGenreInput})</Text>
              <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 14 }}>Your station application has been securely logged to Supabase with status <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>pending_admin_review</Text>.</Text>
              
              <TouchableOpacity style={styles.actionBtnBlue} onPress={() => setApplicationSubmitted(false)}>
                <Text style={styles.actionBtnText}>Submit Another Application ➕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ================= TAB 10: ZERO-NET MESH & GHOST VAULT ================= */}
      {activeTab === 'Mesh' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🛰️ Zero-Internet P2P Mesh & Encrypted Ghost Vaults</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Local multi-hop packet forwarding, offline peer-to-peer file/chat sharing, and secure local storage.</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: meshNodeActive ? '#38a169' : '#e53e3e', borderWidth: 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Multi-Hop Packet Forwarder & Mesh Node</Text>
              <TouchableOpacity 
                style={{ backgroundColor: meshNodeActive ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                onPress={() => {
                  setMeshNodeActive(!meshNodeActive);
                  Alert.alert('Mesh Node', !meshNodeActive ? '🛰️ Mesh node online & relaying packets!' : 'Mesh node paused.');
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{meshNodeActive ? 'Node ACTIVE 🟢' : 'Node PAUSED 🔴'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold' }}>Connected Mesh Peers: {meshPeerCount} nearby devices</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>Relaying local data packets securely via Wi-Fi Direct and Bluetooth mesh without internet access.</Text>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💬 Zero-Internet Local Chat & File Share</Text>
            <ScrollView style={{ height: 120, marginBottom: 8, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 8 }}>
              {localChatLog.map(msg => (
                <View key={msg.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{msg.sender}: <Text style={{ fontWeight: 'normal', color: isDarkMode ? '#fff' : '#2d3748' }}>{msg.text}</Text></Text>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                style={[styles.chatInput, { flex: 1, height: 36 }, isDarkMode && styles.darkInput]}
                placeholder="Broadcast to local mesh peers..."
                placeholderTextColor="#a0aec0"
                value={localChatMessage}
                onChangeText={setLocalChatMessage}
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendLocalMeshChat}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Broadcast</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Encrypted Local Ghost Vaults & Files</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Store and lock sensitive files offline with zero cloud footprint:</Text>
            
            {ghostVaultFiles.map(vf => (
              <View key={vf.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{vf.name}</Text>
                  <Text style={{ fontSize: 10, color: '#718096' }}>Size: {vf.size} • Encrypted AES-256</Text>
                </View>
                <TouchableOpacity onPress={() => setGhostVaultFiles(prev => prev.filter(f => f.id !== vf.id))}>
                  <Text style={{ color: '#e53e3e', fontSize: 10, fontWeight: 'bold' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              style={[styles.chatInput, { marginBottom: 8, marginTop: 4 }, isDarkMode && styles.darkInput]}
              placeholder="New vault file name (e.g. project_notes.enc)..."
              placeholderTextColor="#a0aec0"
              value={newVaultFileName}
              onChangeText={setNewVaultFileName}
            />
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleAddGhostVaultFile}>
              <Text style={styles.actionBtnText}>Encrypt & Add File to Ghost Vault 🔒</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= TAB 11: ADVANCED VIEWER ANALYTICS & HEATMAP ================= */}
      {activeTab === 'Analytics' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>📊 Advanced Viewer Analytics & Engagement Heatmap</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Track peak viewership, audience retention curves, and geographic distribution across East Africa.</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 0 }]}>📈 Performance Metrics ({analyticsTimeRange})</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#2b6cb0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                onPress={() => {
                  const ranges = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'All-Time'];
                  const nextR = ranges[(ranges.indexOf(analyticsTimeRange) + 1) % ranges.length];
                  setAnalyticsTimeRange(nextR);
                  Alert.alert('Analytics Range', `Report updated for: ${nextR}`);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>📅 {analyticsTimeRange}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={[styles.analyticsBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
                <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>PEAK VIEWERS</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3182ce', marginTop: 2 }}>{peakConcurrentViewers}</Text>
              </View>
              <View style={[styles.analyticsBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
                <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>AVG DURATION</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#38a169', marginTop: 2 }}>{averageWatchDuration}</Text>
              </View>
              <View style={[styles.analyticsBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
                <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>RETENTION</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#d69e2e', marginTop: 2 }}>{audienceRetentionRate}</Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12, marginTop: 6 }]}>🌍 Geographic Viewer Heatmap (Top Regions)</Text>
            {[
              { region: 'Kampala, Uganda', percentage: '54%', viewers: '2,070' },
              { region: 'Entebbe & Jinja, Uganda', percentage: '22%', viewers: '840' },
              { region: 'Nairobi, Kenya', percentage: '14%', viewers: '535' },
              { region: 'Dar es Salaam, Tanzania', percentage: '10%', viewers: '395' },
            ].map(item => (
              <View key={item.region} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={[{ fontSize: 11 }, isDarkMode && styles.darkText]}>{item.region} ({item.viewers} viewers)</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{item.percentage}</Text>
                </View>
                <View style={styles.pollBarBg}>
                  <View style={[styles.pollBarFill, { width: item.percentage, backgroundColor: '#3182ce' }]} />
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📢 Programmatic Ad Campaign Schedulizer</Text>
            <TextInput
              style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
              placeholder="Ad Campaign Title (e.g. Nile Breweries Spot)..."
              placeholderTextColor="#a0aec0"
              value={customAdCampaignTitle}
              onChangeText={setCustomAdCampaignTitle}
            />
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleAddCustomAd}>
              <Text style={styles.actionBtnText}>Schedule Ad Campaign into Rotation ➕</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12, marginTop: 10 }]}>Active Ad Inventory ({customAdList.length}):</Text>
            {customAdList.map(ad => (
              <View key={ad.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{ad.title} ({ad.duration})</Text>
                  <Text style={{ fontSize: 10, color: '#38a169' }}>Status: {ad.status}</Text>
                </View>
                <TouchableOpacity onPress={() => setCustomAdList(prev => prev.filter(a => a.id !== ad.id))}>
                  <Text style={{ color: '#e53e3e', fontSize: 10, fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ================= TAB 12: 360° VR & SPATIAL THEATER ================= */}
      {activeTab === 'VirtualVR' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🥽 360° VR & Spatial Theater Experience</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Immerse yourself in virtual reality broadcast rooms with spatial 3D audio and custom environment skins.</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: vrModeActive ? '#38a169' : '#3182ce', borderWidth: 2 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🥽 Spatial VR Headset Integration</Text>
              <TouchableOpacity 
                style={{ backgroundColor: vrModeActive ? '#38a169' : '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                onPress={() => {
                  setVrModeActive(!vrModeActive);
                  Alert.alert('Spatial VR Mode', !vrModeActive ? '🥽 Immersive 360° VR theater mode activated!' : 'VR mode closed.');
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{vrModeActive ? 'VR Mode: ACTIVE 🟢' : 'Launch VR Mode 🥽'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold' }}>Headset Status: {headsetConnected ? 'Connected (Wireless VR Headset)' : 'Disconnected'}</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>Experience wildlife documentaries as if you are standing directly inside Queen Elizabeth National Park or Bwindi Forest.</Text>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🏛️ Virtual Theater Environment Theme</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {['Kampala Luxury Penthouse Lounge 🌆', 'Bwindi Canopy Treehouse 🌳', 'IMAX Star Theater 🎬', 'Sunset Savannah Campfire 🔥'].map(theme => (
                <TouchableOpacity
                  key={theme}
                  style={[styles.angleChip, virtualRoomTheme === theme && styles.activeAngleChip]}
                  onPress={() => {
                    setVirtualRoomTheme(theme);
                    Alert.alert('Environment Theme', `Virtual theater skin updated to: ${theme}`);
                  }}
                >
                  <Text style={[styles.angleChipText, virtualRoomTheme === theme && { color: '#fff' }]}>{theme}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12, marginTop: 4 }]}>🔊 3D Spatial Audio Preset</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Savannah 360° Ambience 🌿', 'Entebbe Lake Waves 🌊', 'Studio Acoustic Master 🎵', 'Cinematic Surround 5.1 🔊'].map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.angleChip, spatialAudioPreset === preset && styles.activeAngleChip]}
                  onPress={() => {
                    setSpatialAudioPreset(preset);
                    Alert.alert('Spatial Audio', `3D acoustic profile updated to: ${preset}`);
                  }}
                >
                  <Text style={[styles.angleChipText, spatialAudioPreset === preset && { color: '#fff' }]}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>❓ Creator Q&A Community Board</Text>
            {forumQuestions.map(fq => (
              <View key={fq.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6 }}>
                <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{fq.author}: "{fq.q}"</Text>
                <Text style={{ fontSize: 10, color: '#3182ce', marginTop: 2 }}>👍 Upvotes: {fq.votes}</Text>
              </View>
            ))}
            <TextInput
              style={[styles.chatInput, { marginBottom: 8, marginTop: 4 }, isDarkMode && styles.darkInput]}
              placeholder="Ask the creator a question for the next live stream..."
              placeholderTextColor="#a0aec0"
              value={newForumQuestionInput}
              onChangeText={setNewForumQuestionInput}
            />
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleAddForumQuestion}>
              <Text style={styles.actionBtnText}>Post Question to Q&A Board 💬</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Automated DRM & Anti-Piracy Shield</Text>
            <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold', marginBottom: 4 }}>Status: {antiPiracyShieldStatus}</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Dynamic session watermarking prevents unauthorized screen recording and stream scraping across all connected clients.</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>Geo-Lock to Uganda & East Africa:</Text>
              <Switch
                value={geoBlockUgandaOnly}
                onValueChange={(val) => {
                  setGeoBlockUgandaOnly(val);
                  Alert.alert('Geo-Lock Shield', val ? '🔒 Broadcast geo-locked exclusively to East African IP ranges.' : '🌐 Global broadcast access enabled.');
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* LANGUAGE SELECTOR MODAL */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? '#2d3748' : '#fff', padding: 20, borderRadius: 12, width: '100%', maxWidth: 340 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 10 }]}>🌍 Select Subtitle & Translation Language</Text>
            {availableLanguages.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={{ padding: 10, borderRadius: 8, backgroundColor: captionLanguage.includes(lang.name) ? '#3182ce' : '#edf2f7', marginBottom: 6 }}
                onPress={() => {
                  setCaptionLanguage(lang.name);
                  setLatestCaptionSample(`Live auto-translation active in ${lang.name}...`);
                  setShowLanguageModal(false);
                  Alert.alert('Language Updated', `Subtitles switched to: ${lang.name}`);
                }}
              >
                <Text style={{ color: captionLanguage.includes(lang.name) ? '#fff' : '#2d3748', fontWeight: 'bold' }}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.actionBtnRed, { marginTop: 10 }]} onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.actionBtnText}>Close Modal ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkCard: { backgroundColor: '#2d3748' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  earningsBox: { backgroundColor: '#ebf8ff', padding: 8, borderRadius: 8, alignItems: 'center' },
  earningsLabel: { fontSize: 9, fontWeight: 'bold', color: '#2b6cb0' },
  earningsAmount: { fontSize: 14, fontWeight: 'bold', color: '#3182ce' },
  navRow: { maxHeight: 45, marginBottom: 12 },
  navTab: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginRight: 8, height: 38, justifyContent: 'center' },
  activeNavTab: { backgroundColor: '#3182ce' },
  navTabText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  activeNavTabText: { color: '#fff' },
  sectionContainer: { flex: 1 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  epgCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  epgChannelBadge: { backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  epgChannelNumber: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  epgChannelName: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  epgShowTitle: { fontSize: 11, color: '#4a5568' },
  epgTimeText: { fontSize: 10, color: '#718096' },
  watchChannelBtn: { backgroundColor: '#38a169', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  watchChannelText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  videoViewport: { backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 10 },
  videoScreen: { width: '100%', height: '100%' },
  floatingTopBarOverlay: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
  liveBadgeOverlay: { backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  expandToggleOverlayBtn: { backgroundColor: 'rgba(49, 130, 206, 0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  verifiedBadgeOverlay: { position: 'absolute', top: 44, right: 10, backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, zIndex: 100 },
  verifiedBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  videoInfoOverlay: { position: 'absolute', bottom: 10, left: 10, right: 10, zIndex: 100 },
  videoTitleText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },
  videoSubText: { color: '#cbd5e0', fontSize: 10, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },
  onAirCallerOverlay: { position: 'absolute', top: 76, left: 10, backgroundColor: 'rgba(229, 62, 62, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 100 },
  adOverlayBox: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  angleChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  activeAngleChip: { backgroundColor: '#3182ce' },
  angleChipText: { fontSize: 11, color: '#4a5568', fontWeight: 'bold' },
  snackBtn: { backgroundColor: '#d69e2e', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, flex: 1, marginHorizontal: 2, alignItems: 'center' },
  progressBarContainer: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#48bb78' },
  giftBtnBlue: { backgroundColor: '#3182ce', padding: 8, borderRadius: 6, flex: 1, marginRight: 4, alignItems: 'center' },
  giftBtnGold: { backgroundColor: '#d69e2e', padding: 8, borderRadius: 6, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  giftBtnRed: { backgroundColor: '#e53e3e', padding: 8, borderRadius: 6, flex: 1, marginLeft: 4, alignItems: 'center' },
  giftBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  pollQuestionText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  pollOptionBtn: { padding: 8, borderRadius: 6, alignItems: 'center' },
  pollBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  pollBarFill: { height: '100%' },
  dvrCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  dvrTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  dvrSubText: { fontSize: 10, color: '#718096' },
  dvrPlayBtn: { backgroundColor: '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  dvrPlayText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  watchPartyScreen: { backgroundColor: '#000', borderRadius: 12, padding: 4, position: 'relative', marginBottom: 10 },
  syncBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  chatSendBtn: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, borderRadius: 8, marginLeft: 6 },
  toggleBtn: { backgroundColor: '#edf2f7', padding: 8, borderRadius: 6, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  actionBtnBlue: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnRed: { backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnGreen: { backgroundColor: '#48bb78', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  earnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  earnTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  earnVal: { fontSize: 12, fontWeight: 'bold', color: '#38a169' },
  earnDesc: { fontSize: 11, color: '#718096', marginBottom: 6 },
  totalEarnBox: { backgroundColor: '#ebf8ff', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  payoutBtn: { backgroundColor: '#38a169', padding: 12, borderRadius: 8, alignItems: 'center' },
  payoutBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  analyticsBox: { flex: 1, backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 2, borderWidth: 1, borderColor: '#e2e8f0' },
});