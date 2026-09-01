import React, { useState } from 'react';
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
} from 'react-native';

export default function VirtualTVScreen({ isDarkMode, coins, setCoins }) {
  // Navigation & Channel Surfing States
  const [activeTab, setActiveTab] = useState('Guide'); // 'Guide', 'Live', 'CatchUp', 'WatchParty', 'Studio', 'ProEditing', 'Monetization', 'Mesh'
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

  // EPG / Channel Grid Data & Custom Schedule Creator
  const [epgChannels, setEpgChannels] = useState([
    { id: 'ch_1', number: '01', name: 'Talk with Nature HD', currentShow: 'Wildlife Expeditions in Queen Elizabeth Park', time: '02:00 PM - 04:00 PM', category: 'Wildlife' },
    { id: 'ch_2', number: '02', name: 'Kampala Sports TV', currentShow: 'Premier League Watch Party: Arsenal vs Man City', time: '02:30 PM - 05:00 PM', category: 'Sports' },
    { id: 'ch_3', number: '03', name: 'Studio UG Music', currentShow: 'East African Indie Showcase & Live Beats', time: '03:00 PM - 06:00 PM', category: 'Music' },
    { id: 'ch_4', number: '04', name: 'Global News & Tech Network', currentShow: 'AI & Software Innovation Forum Kampala', time: '01:30 PM - 03:30 PM', category: 'News' },
  ]);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramTime, setNewProgramTime] = useState('');

  // Pro Video Editing Suite States
  const [timelineClips, setTimelineClips] = useState([
    { id: 'clip_1', name: 'Intro Wildlife Bwindi Scene (00:00 - 00:45)', duration: '45s' },
    { id: 'clip_2', name: 'Main Elephant River Crossing (00:45 - 03:20)', duration: '2m 35s' }
  ]);
  const [newClipName, setNewClipName] = useState('');

  // AI Smart Trim & Closed Captioning States
  const [smartTrimStatus, setSmartTrimStatus] = useState('Ready to analyze footage peaks');
  const [highlightReelsCount, setHighlightReelsCount] = useState(0);
  const [closedCaptionsActive, setClosedCaptionsActive] = useState(true);
  const [captionLanguage] = useState('English & Luganda (Auto-Translate Live)');
  const [latestCaptionSample] = useState('Welcome back to Talk With Nature live stream from Uganda...');

  // Hardware Signal & RTMP Ingestion States
  const [rtmpStreamKey] = useState('chatup_live_key_' + Math.random().toString(36).substring(7));
  const [rtmpEndpointUrl] = useState('rtmp://ingest.chatup.tv/live');
  const [hardwareSignalStatus, setHardwareSignalStatus] = useState('Offline (Waiting for Switcher Signal)');

  // Zero-Friction One-Tap Publish State
  const [masterProjectTitle, setMasterProjectTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Monetization & Creator Earnings States
  const [creatorEarningsUSD] = useState(342.50);
  const [adRevenueShare] = useState(128.00);
  const [superGiftsTotal, setSuperGiftsTotal] = useState(145.50);
  const [ticketSalesRevenue] = useState(69.00);

  // Presenter Studio Controls & Safety States
  const [killSwitchEngaged, setKillSwitchEngaged] = useState(false);
  const [faceAnonymization, setFaceAnonymization] = useState(false);
  const [voiceScrambler, setVoiceScrambler] = useState(false);
  const [broadcastDelay] = useState('2 Seconds Buffer');
  const [activeCameraAngle, setActiveCameraAngle] = useState('Camera 1 (Host Wide)');
  const [aiDubbingActive, setAiDubbingActive] = useState(false);
  const [selectedDubLanguage, setSelectedDubLanguage] = useState('Luganda 🇺🇬');

  // Built-in Camera & Variety Filters States
  const [useDeviceCamera, setUseDeviceCamera] = useState(false);
  const [activeCameraFilter, setActiveCameraFilter] = useState('Normal (HD Clear)');

  // Zero-Net & Ghost Vault States
  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(4);
  const [vaultPassword, setVaultPassword] = useState('');
  const [localChatMessage, setLocalChatMessage] = useState('');
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Wildlife archive chunk synced successfully offline.' }
  ]);

  // Interactive Features States
  const [pollActive] = useState(true);
  const [pollQuestion] = useState('Should we extend the wildlife conservation segment?');
  const [pollVotes, setPollVotes] = useState({ yes: 840, no: 120 });
  const [userVoted, setUserVoted] = useState(false);

  // Crowdfunding & Monetization Goal Bar
  const [fundraisingGoal] = useState(5000);
  const [raisedCoins, setRaisedCoins] = useState(3450);

  // Watch Party & Chat States
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Nimusiima Asifa', text: 'Look at those elephants crossing the river! 🐘' },
    { id: '2', user: 'Stella', text: 'Amazing resolution on this official broadcaster stream.' },
    { id: '3', user: 'Borris', text: 'Welcome everyone to the synchronized watch party!' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Green Room Call-In States
  const [greenRoomQueue, setGreenRoomQueue] = useState([
    { id: 'call_1', name: 'Ranger Brian', topic: 'Bwindi Impenetrable Forest Update' },
    { id: 'call_2', name: 'Ahabwamukama', topic: 'Tech & Community Mesh Network' },
  ]);
  const [liveCaller, setLiveCaller] = useState(null);

  // Handlers
  const handleVote = (option) => {
    if (userVoted) return;
    if (option === 'yes') setPollVotes(prev => ({ ...prev, yes: prev.yes + 1 }));
    else setPollVotes(prev => ({ ...prev, no: prev.no + 1 }));
    setUserVoted(true);
    Alert.alert('Vote Recorded', 'Thank you for participating in the live interactive broadcast poll!');
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
    setChatMessages([...chatMessages, { id: Date.now().toString(), user: 'You (Borris)', text: chatInput }]);
    setChatInput('');
  };

  const handleAcceptCaller = (caller) => {
    setLiveCaller(caller);
    setGreenRoomQueue(prev => prev.filter(c => c.id !== caller.id));
    Alert.alert('Green Room', `Brought ${caller.name} live onto the multi-guest panel stage.`);
  };

  const handleEndCaller = () => {
    if (liveCaller) {
      setGreenRoomQueue(prev => [...prev, { id: 'call_' + Date.now(), name: liveCaller.name, topic: 'Returned from Stage' }]);
      setLiveCaller(null);
      Alert.alert('Green Room', 'Caller returned to waiting room.');
    }
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

  const handleSendLocalMeshChat = () => {
    if (!localChatMessage.trim()) return;
    setLocalChatLog([...localChatLog, { id: Date.now().toString(), sender: 'You (Borris)', text: localChatMessage }]);
    setLocalChatMessage('');
    Alert.alert('Mesh Relay 🛰️', 'Packet broadcasted across local multi-hop mesh nodes without internet connection.');
  };

  // Helper to toggle laptop/web webcam stream
  const toggleDeviceCamera = async () => {
    if (!useDeviceCamera) {
      if (Platform.OS === 'web') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const videoElement = document.getElementById('webcam-video-preview');
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
          }
          setUseDeviceCamera(true);
          Alert.alert('Camera Live 🔴', 'Laptop webcam successfully connected!');
        } catch (err) {
          Alert.alert('Camera Error', 'Could not access webcam. Check browser permissions.');
        }
      } else {
        setUseDeviceCamera(true);
        Alert.alert('Camera Live 🔴', 'Device camera opened successfully!');
      }
    } else {
      if (Platform.OS === 'web') {
        const videoElement = document.getElementById('webcam-video-preview');
        if (videoElement && videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          videoElement.srcObject = null;
        }
      }
      setUseDeviceCamera(false);
      Alert.alert('Camera Closed ⏹️', 'Switched back to standard channel broadcast.');
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 140, padding: 12 }}>
      
      {/* HEADER & EARNINGS BANNER */}
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>📺 ChatUp Virtual TV & Broadcast Hub</Text>
          <Text style={styles.subtitle}>Linear Channels, Pro Editing, Safety Suites & Monetization</Text>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsLabel}>Creator Earnings 💵</Text>
          <Text style={styles.earningsAmount}>${creatorEarningsUSD.toFixed(2)}</Text>
        </View>
      </View>

      {/* TOP NAVIGATION TABS FOR VIRTUAL TV SUITE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navRow}>
        {[
          { key: 'Guide', label: '📺 TV Guide & EPG' },
          { key: 'Live', label: '🔴 Live & Camera Feed' },
          { key: 'CatchUp', label: '⏪ Catch-Up TV & DVR' },
          { key: 'WatchParty', label: '👥 Watch Party' },
          { key: 'Studio', label: '🎛️ Presenter & Safety Studio' },
          { key: 'ProEditing', label: '🎞️ Pro Editing & AI Suite' },
          { key: 'Monetization', label: '🪙 Earnings & Payouts' },
          { key: 'Mesh', label: '🛰️ Zero-Net & Ghost Vault' },
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
                <Text style={styles.epgTimeText}>🕒 {ch.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.watchChannelBtn} 
                onPress={() => { setCurrentChannel({ ...ch, videoUrl: currentChannel.videoUrl }); setActiveTab('Live'); }}
              >
                <Text style={styles.watchChannelText}>Tune In 📺</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Program to Schedule Suite */}
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

      {/* ================= TAB 2: LIVE STREAMING, BUILT-IN CAMERA & VARIETY FILTERS ================= */}
      {activeTab === 'Live' && (
        <View style={styles.sectionContainer}>
          <View style={styles.videoViewport}>
            {useDeviceCamera ? (
              Platform.OS === 'web' ? (
                <video
                  id="webcam-video-preview"
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                  <Text style={{ fontSize: 36, marginBottom: 4 }}>🔴📹</Text>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>[Live Mobile Camera Active]</Text>
                  <Text style={{ color: '#63b3ed', fontSize: 11, marginTop: 4 }}>✨ Active Filter: {activeCameraFilter}</Text>
                </View>
              )
            ) : (
              <Image source={{ uri: currentChannel.videoUrl }} style={styles.videoScreen} />
            )}

            <View style={styles.liveBadgeOverlay}>
              <Text style={styles.liveBadgeText}>🔴 LIVE SYNC • {currentChannel.viewers}</Text>
            </View>
            {currentChannel.isOfficial && !useDeviceCamera && (
              <View style={styles.verifiedBadgeOverlay}>
                <Text style={styles.verifiedBadgeText}>🛡️ Official Broadcaster Partner</Text>
              </View>
            )}
            <View style={styles.videoInfoOverlay}>
              <Text style={styles.videoTitleText}>{currentChannel.title}</Text>
              <Text style={styles.videoSubText}>
                {useDeviceCamera ? `Broadcasting Live via Webcam/Camera (${activeCameraFilter})` : `Broadcasting via RTMP Relay • Angle: ${activeCameraAngle}`}
              </Text>
            </View>
          </View>

          {/* Built-in Camera & Variety Filter Selector Card */}
          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: useDeviceCamera ? '#e53e3e' : '#e2e8f0', borderWidth: useDeviceCamera ? 2 : 1 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📷 Built-in Camera & Beauty Filters</Text>
              <TouchableOpacity 
                style={[styles.actionBtnBlue, { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: useDeviceCamera ? '#e53e3e' : '#3182ce' }]} 
                onPress={toggleDeviceCamera}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                  {useDeviceCamera ? 'Stop Camera ⏹️' : 'Start Camera Feed 🔴'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>Select professional look & variety filters for your camera broadcast:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                'Normal (HD Clear)', 
                'Smooth & Glow ✨', 
                'Cinematic Warm 🎬', 
                'Vivid Nature 🌿', 
                'Studio Noir 🖤', 
                'Golden Hour 🌅'
              ].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.angleChip, activeCameraFilter === filter && styles.activeAngleChip]}
                  onPress={() => {
                    setActiveCameraFilter(filter);
                    Alert.alert('Filter Applied', `Switched camera look to: ${filter}`);
                  }}
                >
                  <Text style={[styles.angleChipText, activeCameraFilter === filter && { color: '#fff' }]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Camera Angle Selector (Only when not using direct device camera) */}
          {!useDeviceCamera && (
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎥 Interactive Multi-Camera Angle Selector</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                {['Camera 1 (Host Wide)', 'Camera 2 (Stage Close-up)', 'Camera 3 (Drone / Nature)', 'Camera 4 (Green Room Side)'].map(angle => (
                  <TouchableOpacity
                    key={angle}
                    style={[styles.angleChip, activeCameraAngle === angle && styles.activeAngleChip]}
                    onPress={() => { setActiveCameraAngle(angle); Alert.alert('Camera Switched', `Switched live feed to ${angle}`); }}
                  >
                    <Text style={[styles.angleChipText, activeCameraAngle === angle && { color: '#fff' }]}>{angle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Live Fundraising Goal Bar & Super Gifts */}
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

          {/* Interactive Polls */}
          {pollActive && (
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📊 Live Interactive Viewer Poll</Text>
              <Text style={[styles.pollQuestionText, isDarkMode && styles.darkText]}>{pollQuestion}</Text>
              
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <TouchableOpacity style={[styles.pollOptionBtn, { backgroundColor: '#3182ce', flex: 1, marginRight: 6 }]} onPress={() => handleVote('yes')}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>👍 Yes ({pollVotes.yes})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pollOptionBtn, { backgroundColor: '#e53e3e', flex: 1, marginLeft: 6 }]} onPress={() => handleVote('no')}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>👎 No ({pollVotes.no})</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#718096', textAlign: 'center' }}>Live animated percentage results rendering on broadcast feed.</Text>
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
          ].map(item => (
            <View key={item.id} style={[styles.dvrCard, isDarkMode && styles.darkCard]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dvrTitle, isDarkMode && styles.darkText]}>{item.show}</Text>
                <Text style={{ fontSize: 11, color: '#3182ce' }}>{item.channel} • {item.date}</Text>
                <Text style={{ fontSize: 10, color: '#718096' }}>Duration: {item.duration} • 7-Day EPG Archive</Text>
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
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Watch linear TV channels simultaneously with friends, synchronized playback, and live group chat.</Text>

          <View style={styles.watchPartyScreen}>
            <Image source={{ uri: currentChannel.videoUrl }} style={{ width: '100%', height: 180, borderRadius: 8 }} />
            <View style={styles.syncBadge}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🟢 Playback Synced with 4 Friends</Text>
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

          {/* External Hardware Signal Testing Suite */}
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

          {/* Master Kill Switch & Privacy Filters */}
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

          {/* AI-Powered Local Language Dubbing */}
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

          {/* Multi-Guest Panels & Green Room Call-In */}
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>👥 Multi-Guest Stage & Green Room Call-Ins</Text>
            {liveCaller ? (
              <View style={{ backgroundColor: '#ebf8ff', padding: 8, borderRadius: 6, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#2b6cb0', fontSize: 12, fontWeight: 'bold' }}>🔴 Live on Stage: {liveCaller.name} ({liveCaller.topic})</Text>
                <TouchableOpacity style={{ backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }} onPress={handleEndCaller}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>End Call</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Waiting in Virtual Green Room:</Text>
            {greenRoomQueue.map(caller => (
              <View key={caller.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[{ fontSize: 12 }, isDarkMode && styles.darkText]}>{caller.name} - {caller.topic}</Text>
                <TouchableOpacity style={{ backgroundColor: '#38a169', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }} onPress={() => handleAcceptCaller(caller)}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Bring Live 🎙️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ================= TAB 6: PRO VIDEO EDITING & AI SUITE ================= */}
      {activeTab === 'ProEditing' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🎞️ Pro Video Editing & AI Subtitle Suite</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Multi-clip timeline stitching, AI smart trim, closed captions, and one-tap publishing.</Text>

          {/* Multi-Clip Timeline */}
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎞️ Multi-Clip Timeline & Video Stitcher</Text>
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
              placeholder="New clip name / scene..."
              placeholderTextColor="#a0aec0"
              value={newClipName}
              onChangeText={setNewClipName}
            />
            <TouchableOpacity style={styles.actionBtnBlue} onPress={handleAddTimelineClip}>
              <Text style={styles.actionBtnText}>Add Clip to Timeline ➕</Text>
            </TouchableOpacity>
          </View>

          {/* AI Smart Trim & Highlights */}
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

          {/* Closed Captioning & AI Subtitles */}
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

          {/* Zero-Friction One-Tap Publish */}
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
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🪙 Virtual TV Channel Monetization & Earnings</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>How you earn revenue from running an official Virtual TV channel on ChatUp:</Text>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💰 Revenue Streams Breakdown</Text>
            
            <View style={styles.earnRow}>
              <Text style={[styles.earnTitle, isDarkMode && styles.darkText]}>1. Targeted Dynamic Ad Insertion (DAI)</Text>
              <Text style={styles.earnVal}>${adRevenueShare.toFixed(2)}</Text>
            </View>
            <Text style={styles.earnDesc}>Programmatic ad server framework integrated into the HLS pipeline serving local commercials.</Text>

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

      {/* ================= TAB 8: ZERO-NET MESH & GHOST VAULT ================= */}
      {activeTab === 'Mesh' && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🛰️ Zero-Internet P2P Mesh & Encrypted Ghost Vaults</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Local multi-hop packet forwarding, offline peer-to-peer file/chat sharing, and secure local storage.</Text>

          {/* Mesh Node & Multi-Hop Status Card */}
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

          {/* Local Zero-Internet P2P Chat & File Share */}
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

          {/* Encrypted Local Ghost Vaults */}
          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#e53e3e', borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Encrypted Local Ghost Vaults</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Lock sensitive files, media, and private documents behind zero-knowledge local encryption.</Text>
            <TextInput
              style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
              placeholder="Enter ghost vault master key / password..."
              placeholderTextColor="#a0aec0"
              secureTextEntry
              value={vaultPassword}
              onChangeText={setVaultPassword}
            />
            <TouchableOpacity 
              style={styles.actionBtnRed} 
              onPress={() => {
                if (!vaultPassword.trim()) return Alert.alert('Error', 'Enter a vault key first.');
                Alert.alert('Ghost Vault 🛡️', 'Vault sealed and encrypted locally with zero cloud footprint!');
                setVaultPassword('');
              }}
            >
              <Text style={styles.actionBtnText}>Lock & Seal Ghost Vault 🛡️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  videoViewport: { height: 210, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 10 },
  videoScreen: { width: '100%', height: '100%', opacity: 0.85 },
  liveBadgeOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  verifiedBadgeOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  verifiedBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  videoInfoOverlay: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  videoTitleText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  videoSubText: { color: '#cbd5e0', fontSize: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  angleChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  activeAngleChip: { backgroundColor: '#3182ce' },
  angleChipText: { fontSize: 11, color: '#4a5568', fontWeight: 'bold' },
  progressBarContainer: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#48bb78' },
  giftBtnBlue: { backgroundColor: '#3182ce', padding: 8, borderRadius: 6, flex: 1, marginRight: 4, alignItems: 'center' },
  giftBtnGold: { backgroundColor: '#d69e2e', padding: 8, borderRadius: 6, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  giftBtnRed: { backgroundColor: '#e53e3e', padding: 8, borderRadius: 6, flex: 1, marginLeft: 4, alignItems: 'center' },
  giftBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  pollQuestionText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  pollOptionBtn: { padding: 8, borderRadius: 6, alignItems: 'center' },
  dvrCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  dvrTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
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
});