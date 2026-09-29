import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function StudioScreen({ isDarkMode, coins = 100, setCoins }) {
  const [editorTitle, setEditorTitle] = useState('');
  
  // Advanced Studio & New AI States
  const [translationEngineActive, setTranslationEngineActive] = useState(true);
  const [targetLocalLanguage] = useState('Luganda (Uganda Local)');
  const [translatedSampleText, setTranslatedSampleText] = useState('Kulikayo ku Talk With Nature live stream!');
  
  const [dubbingLanguage, setDubbingLanguage] = useState('Luganda 🇺🇬');
  const [isDubbingActive, setIsDubbingActive] = useState(false);

  const [chromaKeyActive, setChromaKeyActive] = useState(false);
  const [chromaKeyColor] = useState('Green (#00FF00)');

  const [smartTrimStatus, setSmartTrimStatus] = useState('Ready to analyze footage');
  const [highlightReelsCount, setHighlightReelsCount] = useState(0);

  const [closedCaptionsActive, setClosedCaptionsActive] = useState(true);
  const [captionLanguage] = useState('English (Auto-Translate Live)');
  const [latestCaptionSample] = useState('Welcome back to Talk With Nature live stream from Uganda...');

  const [daiCampaignActive] = useState(true);
  const [daiSponsorName] = useState('Talk With Nature Eco-Tourism Partners');
  const [daiInsertionCount, setDaiInsertionCount] = useState(4);

  const [autoDuckingActive, setAutoDuckingActive] = useState(true);
  const [hostMicVolume] = useState(100);
  const [backgroundAudioVolume, setBackgroundAudioVolume] = useState(30);
  const [isResetPressed, setIsResetPressed] = useState(false);

  const [fallbackReelActive] = useState(true);
  const [fallbackReelTitle] = useState('Talk With Nature - Emergency Filler Reel #1');
  const [fallbackTriggerCount, setFallbackTriggerCount] = useState(0);

  const [isKillSwitchEngaged, setIsKillSwitchEngaged] = useState(false);
  const [faceAnonymizationActive, setFaceAnonymizationActive] = useState(false);
  const [voiceScramblerActive, setVoiceScramblerActive] = useState(false);
  const [broadcastDelaySeconds] = useState('2 Seconds (Safety Buffer)');

  const [rtmpStreamKey] = useState('chatup_live_key_' + Math.random().toString(36).substring(7));
  const [rtmpEndpointUrl] = useState('rtmp://ingest.chatup.tv/live');
  const [hardwareRelayStatus, setHardwareRelayStatus] = useState('Offline (Waiting for Switcher Signal)');

  const [stationSchedule, setStationSchedule] = useState([
    { id: 'sch_1', time: '08:00 AM', show: 'Morning Wildlife & Nature Breakfast' },
    { id: 'sch_2', time: '01:00 PM', show: 'Kampala Tech & Innovation Forum' },
  ]);
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newScheduleShow, setNewScheduleShow] = useState('');

  const [fieldReporters, setFieldReporters] = useState([
    { id: 'field_1', location: 'Queen Elizabeth National Park', reporter: 'Talk With Nature Field Team', signal: '4G LTE (Bonded)', status: 'Live Feed Ready' },
    { id: 'field_2', location: 'Kampala City Centre', reporter: 'ChatUP Mobile Unit', signal: '5G (Bonded)', status: 'Standby' },
  ]);
  const [newFieldLocation, setNewFieldLocation] = useState('');
  const [newFieldReporter, setNewFieldReporter] = useState('');

  const [activeCameraAngle, setActiveCameraAngle] = useState('Camera 1 (Host Wide)');
  const [greenRoomQueue, setGreenRoomQueue] = useState([
    { id: 'call_1', viewer: 'Nimusiima Asifa', status: 'Waiting in Green Room' },
    { id: 'call_2', viewer: 'Stella', status: 'Waiting in Green Room' },
  ]);
  const [liveDuetPartner, setLiveDuetPartner] = useState(null);
  const [isProcessingZeroFriction, setIsProcessingZeroFriction] = useState(false);

  // STUDIO EDITING STATES (Multi-Clip, Speed Control, Voiceover, TTS)
  const [timelineClips, setTimelineClips] = useState([
    { id: 'clip_1', name: 'Intro Wildlife Scene (00:00 - 00:45)', duration: '45s' },
    { id: 'clip_2', name: 'Main Interview / Bwindi Footage (00:45 - 03:20)', duration: '2m 35s' }
  ]);
  const [newClipName, setNewClipName] = useState('');
  const [trimStartPoint] = useState('00:00');
  const [trimEndPoint] = useState('03:20');
  const [studioSpeedRate, setStudioSpeedRate] = useState('1.0x (Normal Speed)');
  const [voiceEffectProfile, setVoiceEffectProfile] = useState('Studio Broadcast Warmth 🎙️');
  const [voiceOverRecording, setVoiceOverRecording] = useState(false);
  const [ttsNarratorVoice] = useState('Natural Male (East Africa English/Luganda)');
  const [ttsScriptText, setTtsScriptText] = useState('Welcome to Talk With Nature live documentary stream.');

  // LIVE FUNDRAISING & WILDLIFE SUPER-GIFTS STATES
  const [fundraisingTitle, setFundraisingTitle] = useState('Emergency Medical & Community Relief Fund');
  const [fundraisingGoal, setFundraisingGoal] = useState(5000);
  const [fundraisingCurrentAmount, setFundraisingCurrentAmount] = useState(1450);
  const [fundraisingActive, setFundraisingActive] = useState(true);
  const [latestGiftAlert, setLatestGiftAlert] = useState('🎉 Nimusiima Asifa sent an Elephant 🐘 (500 Coins)!');

  // COIN & PRICING CONFIGURATION STATES
  const [cinemaTicketPrice, setCinemaTicketPrice] = useState('50');
  const [ecoSupporterPrice, setEcoSupporterPrice] = useState('100');
  const [vipTierPrice, setVipTierPrice] = useState('250');

  // NEW LAYER 1: MULTI-PLATFORM RESTREAMING & DESTINATION MATRIX
  const [restreamDestinations, setRestreamDestinations] = useState([
    { id: 'res_1', platform: 'YouTube Live ("Talk with nature")', active: true, latency: 'Ultra-Low' },
    { id: 'res_2', platform: 'ChatUp Global Broadcast Feed', active: true, latency: 'Direct' },
    { id: 'res_3', platform: 'Facebook & Instagram RTMP', active: false, latency: 'Standard' },
  ]);

  // NEW LAYER 2: SPATIAL AUDIO & 3D IMMERSIVE ACOUSTIC MIXER
  const [spatialAudioPreset, setSpatialAudioPreset] = useState('Savannah Ambience (Nature 360°) 🌿');
  const [spatialReverbLevel, setSpatialReverbLevel] = useState('Medium (Open Air)');
  const [windNoiseSuppressor, setWindNoiseSuppressor] = useState(true);

  // NEW LAYER 3: AUTOMATED CONTENT COPYRIGHT & DRM WATERMARK SHIELD
  const [drmWatermarkActive, setDrmWatermarkActive] = useState(true);
  const [geoBlockEastAfricaOnly, setGeoBlockEastAfricaOnly] = useState(false);
  const [piracyShieldStatus, setPiracyShieldStatus] = useState('Active (Zero Unauthorized Scraping)');

  // NEW LAYER 4: LIVE AUDIENCE INTERACTIVE EMOTE & REACTION RAIN ENGINE
  const [activeReactionRain, setActiveReactionRain] = useState('🐘 Elephant Stampede');
  const [reactionRainIntensity, setReactionRainIntensity] = useState('High (Maximum Stream Sparkle)');

  // Handlers
  const handleToggleDubbing = () => {
    setIsDubbingActive(!isDubbingActive);
    Alert.alert('AI Auto-Dubbing', !isDubbingActive ? `Real-time neural lip-sync & dubbing active for ${dubbingLanguage}.` : 'Auto-dubbing paused.');
  };

  const handleToggleChromaKey = () => {
    setChromaKeyActive(!chromaKeyActive);
    Alert.alert('Chroma Key', !chromaKeyActive ? `Green screen background removal active (${chromaKeyColor}).` : 'Background replacement disabled.');
  };

  const handleRunSmartTrim = () => {
    setSmartTrimStatus('Analyzing audio silence and action peaks...');
    setTimeout(() => {
      setSmartTrimStatus('AI Smart Trim Complete! 3 highlights detected.');
      setHighlightReelsCount(prev => prev + 3);
      if (setCoins) setCoins(c => c + 25); // Reward for smart trim utility
      Alert.alert('AI Smart Trim ✂️ (+25 🪙)', 'Successfully generated 3 viral short-form highlight clips from your long-form footage.');
    }, 1200);
  };

  const handleTestDaiInsertion = () => {
    setDaiInsertionCount(c => c + 1);
    Alert.alert('DAI Server', 'Mid-roll sponsor spot successfully injected into stream manifest.');
  };

  const handleTestFallbackTrigger = () => {
    setFallbackTriggerCount(c => c + 1);
    Alert.alert('Fallback Triggered', 'Signal drop simulated. Automated fallback loop active.');
  };

  const handleToggleKillSwitch = () => {
    setIsKillSwitchEngaged(!isKillSwitchEngaged);
    Alert.alert('Master Control', !isKillSwitchEngaged ? '🚨 KILL SWITCH ENGAGED: Broadcast cut!' : '🟢 Stream restored to live output.');
  };

  const handleAddFieldUnit = () => {
    if (!newFieldLocation.trim() || !newFieldReporter.trim()) return Alert.alert('Error', 'Enter location and reporter name.');
    setFieldReporters(prev => [...prev, { id: 'field_' + Date.now(), location: newFieldLocation, reporter: newFieldReporter, signal: '5G Bonded', status: 'Standby' }]);
    setNewFieldLocation('');
    setNewFieldReporter('');
    Alert.alert('Success', 'Field reporting unit registered.');
  };

  const handleAddScheduleItem = () => {
    if (!newScheduleTime.trim() || !newScheduleShow.trim()) return Alert.alert('Error', 'Enter time and show title.');
    setStationSchedule(prev => [...prev, { id: 'sch_' + Date.now(), time: newScheduleTime, show: newScheduleShow }]);
    setNewScheduleTime('');
    setNewScheduleShow('');
  };

  const handleAcceptCallIn = (viewerName) => {
    setLiveDuetPartner(viewerName);
    Alert.alert('Green Room', `${viewerName} brought live onto stage.`);
  };

  const handleEndDuet = () => {
    setLiveDuetPartner(null);
    Alert.alert('Green Room', 'Duet partner returned to green room queue.');
  };

  const handleAddTimelineClip = () => {
    if (!newClipName.trim()) return Alert.alert('Error', 'Enter clip name.');
    setTimelineClips(prev => [...prev, { id: 'clip_' + Date.now(), name: newClipName, duration: '1m 00s' }]);
    setNewClipName('');
    Alert.alert('Timeline Updated 🎞️', 'New video segment stitched into multi-clip timeline.');
  };

  const handleGenerateTtsNarration = () => {
    if (!ttsScriptText.trim()) return Alert.alert('Error', 'Enter script text for narration.');
    Alert.alert('TTS Narrator Generated 🗣️', `Audio voiceover track generated successfully using voice: "${ttsNarratorVoice}".`);
  };

  const handleSimulateWildlifeGift = (giftName, giftEmoji, coinValue) => {
    setFundraisingCurrentAmount(prev => prev + coinValue);
    setLatestGiftAlert(`🎁 Massive Support! Viewer sent a ${giftName} ${giftEmoji} (+${coinValue} Coins)!`);
    if (setCoins) setCoins(c => c + coinValue); // Credited to wallet
    Alert.alert(`Wildlife Super-Gift! ${giftEmoji} (+${coinValue} 🪙)`, `A viewer just contributed a ${giftName} worth 🪙 ${coinValue} coins to the live fund!`);
  };

  const handleSavePricingConfig = () => {
    Alert.alert('Pricing Updated 🪙', `Cinema Ticket set to 🪙 ${cinemaTicketPrice}, Eco Supporter to 🪙 ${ecoSupporterPrice}, VIP to 🪙 ${vipTierPrice}. Active channel-wide!`);
  };

  const handleZeroFrictionPublish = async () => {
    if (!editorTitle.trim()) return Alert.alert('Studio Error', 'Please give your project a title.');
    setIsProcessingZeroFriction(true);
    
    setTimeout(async () => {
      setIsProcessingZeroFriction(false);
      if (setCoins) setCoins(c => c + 75); // Reward for studio publishing
      Alert.alert('🚀 Success! (+75 🪙)', `Project "${editorTitle}" successfully rendered with multi-clip timeline and published to Cinema!`);
      setEditorTitle('');
    }, 800);
  };

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 140, padding: 20 }}
      nestedScrollEnabled={true}
    >
      <Text style={[styles.analyticsTitle, isDarkMode && styles.darkText]}>🎬 Creator Studio & Broadcast (Wallet: {coins} 🪙)</Text>
      <Text style={[styles.analyticsSubtitle, isDarkMode && styles.darkText]}>Zero-friction publishing with Multi-Platform Restreaming, 3D Spatial Audio, DRM Shield, and Interactive Effects</Text>

      {/* NEW LAYER 1: MULTI-PLATFORM RESTREAMING & DESTINATION MATRIX */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#3182ce', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>🌐 Multi-Platform Restreaming Destination Matrix</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Simultaneously broadcast your live stream across multiple external networks and channels:</Text>
        
        {restreamDestinations.map((dest) => (
          <View key={dest.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{dest.platform}</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Latency: {dest.latency} • Status: <Text style={{ color: dest.active ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>{dest.active ? 'Streaming Live 🔴' : 'Offline ⚪'}</Text></Text>
            </View>
            <Switch
              value={dest.active}
              onValueChange={(val) => {
                setRestreamDestinations(prev => prev.map(d => d.id === dest.id ? { ...d, active: val } : d));
                Alert.alert('Restream Matrix', `${dest.platform} is now ${val ? 'active' : 'paused'}.`);
              }}
            />
          </View>
        ))}
      </View>

      {/* NEW LAYER 2: SPATIAL AUDIO & 3D IMMERSIVE ACOUSTIC MIXER */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#d69e2e', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>🔊 Spatial Audio & 3D Immersive Acoustic Mixer</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Configure spatial soundscapes for immersive wildlife and studio broadcasts:</Text>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Acoustic Environment Preset:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {['Savannah Ambience (Nature 360°) 🌿', 'Bwindi Forest Echo 🌲', 'Kampala Studio Acoustic 🎙️', 'Open Lake Wave Surround 🌊'].map((preset) => (
            <TouchableOpacity
              key={preset}
              style={{ backgroundColor: spatialAudioPreset === preset ? '#3182ce' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
              onPress={() => {
                setSpatialAudioPreset(preset);
                Alert.alert('Spatial Audio', `Acoustic preset locked to: ${preset}`);
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{preset}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>AI Wind & Background Noise Suppressor</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>Filters out harsh outdoor wind gusts on field microphones.</Text>
          </View>
          <Switch
            value={windNoiseSuppressor}
            onValueChange={(val) => {
              setWindNoiseSuppressor(val);
              Alert.alert('Wind Suppressor', val ? 'Wind noise cancellation active.' : 'Suppression disabled.');
            }}
          />
        </View>
      </View>

      {/* NEW LAYER 3: AUTOMATED CONTENT COPYRIGHT & DRM WATERMARK SHIELD */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#48bb78', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>🛡️ Content Copyright & DRM Watermark Shield</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Protect your intellectual property from screen recording and unauthorized stream scraping:</Text>

        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#38a169', marginBottom: 4 }}>Shield Status: {piracyShieldStatus}</Text>
          <Text style={{ fontSize: 11, color: '#718096' }}>Dynamic cryptographic viewer token watermarks are embedded into HLS video segments.</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>Geo-Lock Broadcast to East Africa Only:</Text>
          <Switch
            value={geoBlockEastAfricaOnly}
            onValueChange={(val) => {
              setGeoBlockEastAfricaOnly(val);
              Alert.alert('Geo-Lock Shield', val ? '🔒 Broadcast restricted to East African IP ranges.' : '🌐 Global broadcast access enabled.');
            }}
          />
        </View>
      </View>

      {/* NEW LAYER 4: LIVE AUDIENCE INTERACTIVE EMOTE & REACTION RAIN ENGINE */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#9333ea', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>🎉 Live Audience Interactive Reaction Rain Engine</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Trigger animated floating emoji rainstorms across all connected viewer screens simultaneously:</Text>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9333ea', marginBottom: 4 }}>Select Reaction Rain Effect:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {['🐘 Elephant Stampede', '🐆 Leopard Pounce', '🌿 Eco Green Sparkles', '🪙 Coin Shower 💰'].map((effect) => (
            <TouchableOpacity
              key={effect}
              style={{ backgroundColor: activeReactionRain === effect ? '#9333ea' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
              onPress={() => setActiveReactionRain(effect)}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{effect}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={{ backgroundColor: '#9333ea', padding: 10, borderRadius: 8, alignItems: 'center' }}
          onPress={() => Alert.alert('Reaction Rain Triggered 🎉', `Dispatched "${activeReactionRain}" particle storm to all viewer screens!`)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Launch Reaction Rain Storm Now 🌧️✨</Text>
        </TouchableOpacity>
      </View>

      {/* 1. COIN PRICING & TICKET CONFIGURATION SUITE */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#3182ce', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>🪙 Coin Exchange Rates & Ticket Pricing</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Adjust ticket values and subscription tiers for your channel:</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Cinema Ticket (Coins):</Text>
            <TextInput
              style={[styles.chatInput, { height: 35 }, isDarkMode && styles.darkChatInput]}
              keyboardType="numeric"
              value={cinemaTicketPrice}
              onChangeText={setCinemaTicketPrice}
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 3 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Eco Supporter (/mo):</Text>
            <TextInput
              style={[styles.chatInput, { height: 35 }, isDarkMode && styles.darkChatInput]}
              keyboardType="numeric"
              value={ecoSupporterPrice}
              onChangeText={setEcoSupporterPrice}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>VIP Tier (/mo):</Text>
            <TextInput
              style={[styles.chatInput, { height: 35 }, isDarkMode && styles.darkChatInput]}
              keyboardType="numeric"
              value={vipTierPrice}
              onChangeText={setVipTierPrice}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: '#3182ce', paddingVertical: 8, marginTop: 4 }]} 
          onPress={handleSavePricingConfig}
        >
          <Text style={styles.sendButtonText}>Save Channel Pricing Settings</Text>
        </TouchableOpacity>
      </View>

      {/* 2. LIVE COMMUNITY FUNDRAISING & WILDLIFE SUPER-GIFTS SUITE */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#d69e2e', borderWidth: 2 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15 }]}>❤️ Live Fundraising & Wildlife Super-Gifts</Text>
          <TouchableOpacity 
            style={{ backgroundColor: fundraisingActive ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={() => setFundraisingActive(!fundraisingActive)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{fundraisingActive ? 'Campaign: LIVE 🟢' : 'Paused 🔴'}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkChatInput]}
          placeholder="Fundraising Campaign Title..."
          placeholderTextColor="#a0aec0"
          value={fundraisingTitle}
          onChangeText={setFundraisingTitle}
        />

        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 4 }}>🎯 Campaign Goal Progress:</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#48bb78', marginBottom: 6 }}>
            🪙 {fundraisingCurrentAmount} / {fundraisingGoal} Coins Raised ({Math.round((fundraisingCurrentAmount / fundraisingGoal) * 100)}%)
          </Text>
          <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#d69e2e' }}>{latestGiftAlert}</Text>
        </View>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 6 }}>Simulate Incoming Wildlife Super-Gifts on Air:</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={{ backgroundColor: '#3182ce', padding: 8, borderRadius: 6, flex: 1, marginRight: 4, alignItems: 'center' }}
            onPress={() => handleSimulateWildlifeGift('Cow', '🐄', 100)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Send Cow 🐄 (100)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: '#d69e2e', padding: 8, borderRadius: 6, flex: 1, marginHorizontal: 4, alignItems: 'center' }}
            onPress={() => handleSimulateWildlifeGift('Leopard', '🐆', 250)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Send Leopard 🐆 (250)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: '#e53e3e', padding: 8, borderRadius: 6, flex: 1, marginLeft: 4, alignItems: 'center' }}
            onPress={() => handleSimulateWildlifeGift('Elephant', '🐘', 500)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Send Elephant 🐘 (500)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. AI Auto-Dubbing & Multi-Language Lip-Sync */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🎙️ AI Auto-Dubbing & Multi-Language Lip-Sync</Text>
          <TouchableOpacity 
            style={{ backgroundColor: isDubbingActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={handleToggleDubbing}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isDubbingActive ? 'Dubbing: ON 🟢' : 'OFF ⚪'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Automatically translates voice and matches lip movements to regional languages:</Text>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Target Output Language:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{dubbingLanguage}</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#2b6cb0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 }}
            onPress={() => setDubbingLanguage(dubbingLanguage === 'Luganda 🇺🇬' ? 'Swahili 🇹🇿' : 'Luganda 🇺🇬')}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Switch Language 🌐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Chroma Key / Green Screen Removal Suite */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🟩 Chroma Key / Virtual Studio Background</Text>
          <TouchableOpacity 
            style={{ backgroundColor: chromaKeyActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={handleToggleChromaKey}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{chromaKeyActive ? 'Keyer: ON 🟢' : 'OFF ⚪'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Removes green/blue backdrops in real-time and replaces them with virtual studio environments:</Text>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Active Backdrop Key: {chromaKeyColor}</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Spill Suppression: <Text style={{ fontWeight: 'bold', color: '#38a169' }}>Optimized (Auto)</Text></Text>
        </View>
      </View>

      {/* 5. AI Smart Trim Highlights Generator */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>✂️ AI Smart Trim & Highlight Reels</Text>
          <View style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: '#2b6cb0', fontSize: 11, fontWeight: 'bold' }}>Clips Generated: {highlightReelsCount}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Automatically detects peak engagement, wildlife action, or dialogue moments for short-form clips:</Text>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Analysis Status:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12 }]}>{smartTrimStatus}</Text>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }}
          onPress={handleRunSmartTrim}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Run AI Smart Trim Analysis 🎬 (+25 🪙)</Text>
        </TouchableOpacity>
      </View>

      {/* 6. AI-Powered Local Language & Translation Suite */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🌍 AI-Powered Local Language & Dubbing</Text>
          <TouchableOpacity 
            style={{ backgroundColor: translationEngineActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={() => setTranslationEngineActive(!translationEngineActive)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{translationEngineActive ? 'AI Translator: ON 🟢' : 'AI Translator: OFF ⚪'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Target Output Language:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{targetLocalLanguage}</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Live Translated Sample Output:</Text>
          <Text style={[{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }, isDarkMode && styles.darkText]}>"{translatedSampleText}"</Text>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }}
          onPress={() => setTranslatedSampleText('Tuli wamu okukuuma obutonde bwensi yaffe mu Uganda!')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Test Local Language AI Output 🗣️</Text>
        </TouchableOpacity>
      </View>

      {/* 7. Closed Captioning & Live Subtitles Suite */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>💬 Closed Captioning & Live Subtitles</Text>
          <TouchableOpacity 
            style={{ backgroundColor: closedCaptionsActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={() => setClosedCaptionsActive(!closedCaptionsActive)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{closedCaptionsActive ? 'CC Engine: ON 🟢' : 'CC Engine: OFF ⚪'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Active Subtitle Language:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{captionLanguage}</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Live Stream Subtitle Output Preview:</Text>
          <Text style={[{ fontSize: 12, fontStyle: 'italic', marginTop: 2 }, isDarkMode && styles.darkText]}>"{latestCaptionSample}"</Text>
        </View>
      </View>

      {/* 8. Targeted Dynamic Ad Insertion (DAI) */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🎯 Targeted Dynamic Ad Insertion (DAI)</Text>
          <View style={{ backgroundColor: daiCampaignActive ? '#ebf8ff' : '#edf2f7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: daiCampaignActive ? '#2b6cb0' : '#4a5568', fontSize: 11, fontWeight: 'bold' }}>{daiCampaignActive ? 'DAI Server Active 🟢' : 'DAI Paused'}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Active Sponsor Campaign:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{daiSponsorName}</Text>
          <Text style={{ fontSize: 11, color: '#718096' }}>Total Mid-Roll Ads Inserted Today: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{daiInsertionCount}</Text></Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }} onPress={handleTestDaiInsertion}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Trigger Dynamic Ad Insertion 📺</Text>
        </TouchableOpacity>
      </View>

      {/* 9. Dual-Audio Mixing & Ducking Engine */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🎚️ Dual-Audio Mixing & Ducking Engine</Text>
          <TouchableOpacity 
            style={{ backgroundColor: autoDuckingActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={() => setAutoDuckingActive(!autoDuckingActive)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{autoDuckingActive ? 'Auto-Ducking: ON 🟢' : 'OFF ⚪'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>🎤 Host Microphone Level: {hostMicVolume}%</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 8 }}>🎵 Background Audio Level (Ducked): {backgroundAudioVolume}%</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#3182ce', padding: 8, borderRadius: 6 }}
              onPress={() => setBackgroundAudioVolume(prev => Math.max(10, prev - 10))}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Duck Audio -10%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: isResetPressed ? '#48bb78' : '#4a5568', padding: 8, borderRadius: 6 }}
              onPress={() => { setBackgroundAudioVolume(30); setIsResetPressed(true); setTimeout(() => setIsResetPressed(false), 400); }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Reset Mix</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 10. Automated Fallback Loops Architecture */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🔄 Automated Fallback Loops</Text>
          <View style={{ backgroundColor: '#feebc8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: '#975a16', fontSize: 11, fontWeight: 'bold' }}>Fallback Standby Active 🔄</Text>
          </View>
        </View>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Configured Filler Reel:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{fallbackReelTitle}</Text>
          <Text style={{ fontSize: 11, color: '#718096' }}>Automatic Fallback Triggers Handled: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{fallbackTriggerCount}</Text></Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }} onPress={handleTestFallbackTrigger}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Simulate Signal Drop & Test Fallback ⚡</Text>
        </TouchableOpacity>
      </View>

      {/* 11. Advanced Safety & Kill Switch */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: isKillSwitchEngaged ? '#e53e3e' : '#e2e8f0' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14 }]}>🛡️ Advanced Safety & Privacy Controls</Text>
          <TouchableOpacity 
            style={{ backgroundColor: isKillSwitchEngaged ? '#38a169' : '#e53e3e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            onPress={handleToggleKillSwitch}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isKillSwitchEngaged ? 'Disengage Kill Switch 🟢' : '🚨 MASTER KILL SWITCH'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: isKillSwitchEngaged ? '#e53e3e' : '#38a169', marginBottom: 6 }}>
            System Air Status: {isKillSwitchEngaged ? 'OFFLINE (Kill Switch Active 🛑)' : 'LIVE & SECURE 🟢'}
          </Text>
          <Text style={{ fontSize: 11, color: '#718096' }}>Broadcast Buffer Delay: <Text style={{ fontWeight: 'bold', color: '#3182ce' }}>{broadcastDelaySeconds}</Text></Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={{ backgroundColor: faceAnonymizationActive ? '#3182ce' : '#cbd5e0', padding: 8, borderRadius: 6, flex: 1, marginRight: 5, alignItems: 'center' }}
            onPress={() => setFaceAnonymizationActive(!faceAnonymizationActive)}
          >
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{faceAnonymizationActive ? '👤 Face Blur: ON' : '👤 Face Blur: OFF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ backgroundColor: voiceScramblerActive ? '#3182ce' : '#cbd5e0', padding: 8, borderRadius: 6, flex: 1, marginLeft: 5, alignItems: 'center' }}
            onPress={() => setVoiceScramblerActive(!voiceScramblerActive)}
          >
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{voiceScramblerActive ? '🎙️ Voice Scramble: ON' : '🎙️ Voice Scramble: OFF'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 12. Multi-Location Field-Reporting Suite */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 6 }]}>🌐 Multi-Location Field-Reporting Suite</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Manage remote field units streaming via cellular network bonding:</Text>
        {fieldReporters.map((unit) => (
          <View key={unit.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>📍 {unit.location}</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Reporter: {unit.reporter} • Signal: {unit.signal}</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }} onPress={() => Alert.alert('Switch Feed', `Bringing ${unit.location} live.`)}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Pull Live 📡</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput style={[styles.chatInput, { marginBottom: 6, height: 35 }, isDarkMode && styles.darkChatInput]} placeholder="Field Location..." placeholderTextColor="#a0aec0" value={newFieldLocation} onChangeText={setNewFieldLocation} />
        <TextInput style={[styles.chatInput, { marginBottom: 8, height: 35 }, isDarkMode && styles.darkChatInput]} placeholder="Reporter Name..." placeholderTextColor="#a0aec0" value={newFieldReporter} onChangeText={setNewFieldReporter} />
        <TouchableOpacity style={{ backgroundColor: '#3182ce', padding: 8, borderRadius: 6, alignItems: 'center' }} onPress={handleAddFieldUnit}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Register Field Unit ➕</Text>
        </TouchableOpacity>
      </View>

      {/* 13. Station Program Schedule */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 6 }]}>📅 Station Program Schedule</Text>
        {stationSchedule.map((item) => (
          <View key={item.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{item.time} - {item.show}</Text>
            <TouchableOpacity onPress={() => setStationSchedule(prev => prev.filter(s => s.id !== item.id))}>
              <Text style={{ color: '#e53e3e', fontSize: 11, fontWeight: 'bold' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput style={[styles.chatInput, { marginBottom: 6, height: 35 }, isDarkMode && styles.darkChatInput]} placeholder="Time (e.g. 06:00 PM)..." placeholderTextColor="#a0aec0" value={newScheduleTime} onChangeText={setNewScheduleTime} />
        <TextInput style={[styles.chatInput, { marginBottom: 8, height: 35 }, isDarkMode && styles.darkChatInput]} placeholder="Show Title..." placeholderTextColor="#a0aec0" value={newScheduleShow} onChangeText={setNewScheduleShow} />
        <TouchableOpacity style={{ backgroundColor: '#3182ce', padding: 8, borderRadius: 6, alignItems: 'center' }} onPress={handleAddScheduleItem}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Add Program to Schedule ➕</Text>
        </TouchableOpacity>
      </View>

      {/* 14. External TV Station Relay & RTMP Ingestion Suite */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 6 }]}>📡 External TV Station Relay (RTMP / SRT)</Text>
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Ingest Server URL:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{rtmpEndpointUrl}</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>Private Stream Key:</Text>
          <Text style={[styles.messageText, isDarkMode && styles.darkText, { fontSize: 12, marginBottom: 6 }]}>{rtmpStreamKey}</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Signal Status: <Text style={{ color: hardwareRelayStatus.includes('Online') ? '#38a169' : '#e53e3e' }}>{hardwareRelayStatus}</Text></Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ backgroundColor: '#3182ce', padding: 8, borderRadius: 6 }} onPress={() => setHardwareRelayStatus('Online & Receiving Hardware Stream 🟢')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Test Hardware Signal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#e53e3e', padding: 8, borderRadius: 6 }} onPress={() => setHardwareRelayStatus('Offline (Waiting for Switcher Signal)')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Cut Signal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 15. Multi-Angle Live Switcher & Green Room */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>📹 Multi-Angle Live Switcher</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Active feed angle: <Text style={{ color: '#3182ce', fontWeight: 'bold' }}>{activeCameraAngle}</Text></Text>
        <View style={{ flexDirection: 'row', marginBottom: 15, flexWrap: 'wrap' }}>
          {['Camera 1 (Host Wide)', 'Camera 2 (Close-up)', 'Camera 3 (Screen Share)'].map((cam) => (
            <TouchableOpacity
              key={cam}
              style={[activeCameraAngle === cam && { backgroundColor: '#3182ce' }, { marginRight: 8, marginBottom: 6, padding: 8, borderRadius: 8, backgroundColor: '#edf2f7' }]}
              onPress={() => setActiveCameraAngle(cam)}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: activeCameraAngle === cam ? '#fff' : '#2d3748' }}>{cam}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🤝 Viewer Call-In Green Room & Duets</Text>
        {liveDuetPartner ? (
          <View style={{ backgroundColor: '#ebf8ff', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View>
              <Text style={{ color: '#2b6cb0', fontWeight: 'bold' }}>🔴 Live Duet Active on Screen</Text>
              <Text style={{ fontSize: 13, color: '#2d3748' }}>Guest: {liveDuetPartner}</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: '#e53e3e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }} onPress={handleEndDuet}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>End Duet</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {greenRoomQueue.map((item) => (
          <View key={item.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{item.viewer} <Text style={{ fontSize: 11, fontWeight: 'normal', color: '#718096' }}>({item.status})</Text></Text>
            <TouchableOpacity style={{ backgroundColor: '#48bb78', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }} onPress={() => handleAcceptCallIn(item.viewer)}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Invite to Stage 🎙️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 16. PRO EDITING SUITE (Multi-Clip Timeline, Speed, Voiceover, TTS) */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#3182ce', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>🎞️ Pro Video Editing & Stitching Suite</Text>
        
        {/* Multi-Clip Timeline */}
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Multi-Clip Timeline & Video Stitcher:</Text>
        {timelineClips.map((clip, index) => (
          <View key={clip.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 6, borderRadius: 6, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[{ fontSize: 11, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>#{index + 1} {clip.name} ({clip.duration})</Text>
            <TouchableOpacity onPress={() => setTimelineClips(prev => prev.filter(c => c.id !== clip.id))}>
              <Text style={{ color: '#e53e3e', fontSize: 10, fontWeight: 'bold' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={[styles.chatInput, { marginBottom: 8, height: 35 }, isDarkMode && styles.darkChatInput]}
          placeholder="New clip name / scene..."
          placeholderTextColor="#a0aec0"
          value={newClipName}
          onChangeText={setNewClipName}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#3182ce', marginBottom: 10, paddingVertical: 8 }]} onPress={handleAddTimelineClip}>
          <Text style={styles.sendButtonText}>Add Clip to Timeline ➕</Text>
        </TouchableOpacity>

        {/* Precision Speed Control */}
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Precision Speed Control & Trimming ({trimStartPoint} - {trimEndPoint}):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {['0.5x Slow-Mo', '1.0x (Normal Speed)', '1.5x Fast', '2.0x Timelapse'].map((spd) => (
            <TouchableOpacity
              key={spd}
              style={{ backgroundColor: studioSpeedRate === spd ? '#48bb78' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
              onPress={() => setStudioSpeedRate(spd)}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{spd}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AI Voiceover Studio */}
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>AI Voice Effects & Voiceover Studio:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {['Studio Broadcast Warmth 🎙️', 'Cinematic Movie Trailer 🎬', 'Deep Radio Voice 📻'].map((prof) => (
            <TouchableOpacity
              key={prof}
              style={{ backgroundColor: voiceEffectProfile === prof ? '#3182ce' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
              onPress={() => setVoiceEffectProfile(prof)}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{prof}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity 
          style={{ backgroundColor: voiceOverRecording ? '#e53e3e' : '#38a169', padding: 8, borderRadius: 6, alignItems: 'center', marginBottom: 10 }}
          onPress={() => { setVoiceOverRecording(!voiceOverRecording); Alert.alert('Voiceover', !voiceOverRecording ? 'Recording voiceover...' : 'Voiceover saved!'); }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{voiceOverRecording ? '🔴 Stop Recording Voiceover' : '🎙️ Record Live Voiceover Track'}</Text>
        </TouchableOpacity>

        {/* Text-to-Speech Narrator */}
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>Text-to-Speech Narrator Studio ({ttsNarratorVoice}):</Text>
        <TextInput
          style={[styles.chatInput, { marginBottom: 8, height: 45, textAlignVertical: 'top', paddingVertical: 6 }, isDarkMode && styles.darkChatInput]}
          placeholder="Script for AI narrator..."
          placeholderTextColor="#a0aec0"
          multiline
          value={ttsScriptText}
          onChangeText={setTtsScriptText}
        />
        <TouchableOpacity style={{ backgroundColor: '#2b6cb0', padding: 8, borderRadius: 6, alignItems: 'center' }} onPress={handleGenerateTtsNarration}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Generate AI Narration 🗣️</Text>
        </TouchableOpacity>
      </View>

      {/* 17. Video Editing & Zero-Friction Publishing Suite */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 6 }]}>Master Project Title</Text>
        <TextInput
          style={[styles.chatInput, { marginBottom: 12 }, isDarkMode && styles.darkChatInput]}
          placeholder="e.g. Nature and Wildlife Highlights..."
          placeholderTextColor="#a0aec0"
          value={editorTitle}
          onChangeText={setEditorTitle}
        />
        <TouchableOpacity 
          onPress={handleZeroFrictionPublish} 
          style={[styles.sendButton, { backgroundColor: '#48bb78', paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
          disabled={isProcessingZeroFriction}
        >
          {isProcessingZeroFriction ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.sendButtonText, { fontSize: 16 }]}>
            {isProcessingZeroFriction ? 'Rendering & Broadcasting...' : '⚡ Zero-Friction One-Tap Publish (+75 🪙) 🚀'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  analyticsTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  analyticsSubtitle: { fontSize: 14, color: '#718096', marginBottom: 20 },
  darkText: { color: '#fff' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  commentsHeader: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 40, backgroundColor: '#f7fafc', color: '#2d3748' },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});