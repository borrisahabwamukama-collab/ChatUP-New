import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';

export default function CinemaScreen({ isDarkMode, coins, setCoins, userRole }) {
  const [activeTierSubscription, setActiveTierSubscription] = useState(null);
  const [customTipAmount, setCustomTipAmount] = useState('20');
  const [unlockedCinemaIds, setUnlockedCinemaIds] = useState([]);
  const TICKET_PRICE_COINS = 50;

  // YouTube & Local Flash Disk Screenings States
  const [videos, setVideos] = useState([
    { id: '1', title: 'Ugandan Wildlife & Nature Special', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Exploring breathtaking scenery across National Parks.', host: 'Talk With Nature', boxOfficeRevenue: 1250, ticketSalesCount: 25 }
  ]);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [localFileBanner, setLocalFileBanner] = useState('');

  // Blueprint Feature: Live Movie Commentary Mode
  const [commentaryActive, setCommentaryActive] = useState(false);
  const [commentaryFeed, setCommentaryFeed] = useState([
    { id: 1, author: 'Borris (Host)', text: 'Look at that cinematic transition on the horizon! 🎥' },
    { id: '2', author: 'Nimusiima Asifa', text: 'Incredible wildlife shot!' }
  ]);
  const [commentaryInput, setCommentaryInput] = useState('');

  // Blueprint Feature: Intermission & Live Stage Q&A Mode
  const [intermissionActive, setIntermissionActive] = useState(false);
  const [qaQuestions, setQaQuestions] = useState([
    { id: 'q1', user: 'Stella', question: 'Will there be a sequel covering Bwindi gorillas?', votes: 14 }
  ]);
  const [newQaQuestion, setNewQaQuestion] = useState('');

  // Blueprint Feature: Closed Captioning & Multilingual Subtitles
  const [cinemaCcActive, setCinemaCcActive] = useState(true);
  const [cinemaSubLanguage] = useState('Luganda (Auto-Translate)');
  const [cinemaSubtitlePreview] = useState('Ensi yaffe erimu ebisolo n’ebimera eby’enjawulo...');

  // Blueprint Feature: Dynamic Ad Insertion (DAI) State
  const [cinemaAdPlaying, setCinemaAdPlaying] = useState(false);
  const [cinemaSponsor] = useState('Talk With Nature Eco-Tourism Partners');

  const handleSubscribeTier = (tierName, tierPrice) => {
    if (coins < tierPrice) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${tierPrice} coins to subscribe to "${tierName}".`);
    }
    setCoins(c => c - tierPrice);
    setActiveTierSubscription(tierName);
    Alert.alert('Subscription Active! ⭐', `You are now subscribed to "${tierName}"!`);
  };

  const handleSendTip = () => {
    const amount = parseInt(customTipAmount) || 0;
    if (amount <= 0) return Alert.alert('Error', 'Please enter a valid tip amount.');
    if (coins < amount) {
      return Alert.alert('Insufficient Coins', `You need 🪙 ${amount} coins to send this tip.`);
    }
    setCoins(c => c - amount);
    Alert.alert('Tip Sent! 💛🎁', `Successfully sent 🪙 ${amount} coins as a Super Chat tip!`);
    setCustomTipAmount('20');
  };

  const handleBuyCinemaTicket = (movieId, movieTitle) => {
    if (coins < TICKET_PRICE_COINS) {
      return Alert.alert('Insufficient Coins', `You need at least ${TICKET_PRICE_COINS} coins to buy a ticket for "${movieTitle}".`);
    }
    setCoins(c => c - TICKET_PRICE_COINS);
    setUnlockedCinemaIds(prev => [...prev, movieId]);
    
    setVideos(prev => prev.map(v => v.id === movieId ? { ...v, boxOfficeRevenue: v.boxOfficeRevenue + TICKET_PRICE_COINS, ticketSalesCount: v.ticketSalesCount + 1 } : v));
    
    Alert.alert('Ticket Unlocked! 🎟️', `You have successfully purchased a ticket for "${movieTitle}". Enjoy the screening!`);
  };

  // Handler for Local Flash Disk / Laptop Video Files
  const handleSelectLocalVideo = (event) => {
    const file = event.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setNewVideoUrl(localUrl);
      setNewVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      setLocalFileBanner(file.name);
      Alert.alert('File Loaded 💾', `Successfully loaded "${file.name}" from local storage/flash disk!`);
    }
  };

  const handleCreateVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      return Alert.alert('Error', 'Please enter a title and select a video file or enter a YouTube URL.');
    }
    const newVid = {
      id: Date.now().toString(),
      title: newVideoTitle,
      video_url: newVideoUrl,
      description: newVideoDesc,
      host: 'Borris',
      boxOfficeRevenue: 0,
      ticketSalesCount: 0,
    };
    setVideos(prev => [newVid, ...prev]);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDesc('');
    setLocalFileBanner('');
    Alert.alert('Screening Published 🎟️', 'Your new video screening has been broadcasted with box office tracking!');
  };

  const handleSendCommentary = () => {
    if (!commentaryInput.trim()) return;
    setCommentaryFeed(prev => [...prev, { id: Date.now(), author: 'Borris (Host)', text: commentaryInput }]);
    setCommentaryInput('');
  };

  const handleAddQaQuestion = () => {
    if (!newQaQuestion.trim()) return;
    setQaQuestions(prev => [...prev, { id: Date.now().toString(), user: 'Borris', question: newQaQuestion, votes: 1 }]);
    setNewQaQuestion('');
    Alert.alert('Q&A Submitted 🎤', 'Your question has been sent to the live stage queue.');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
      
      {/* 1. CHANNEL OWNER BOX OFFICE DASHBOARD */}
      {(userRole === 'creator' || userRole === 'admin') && (
        <View style={[styles.postCard, isDarkMode && styles.darkHeader, { borderColor: '#3182ce', borderWidth: 2 }]}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>📊 Channel Owner Box Office Dashboard</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Track your cinema ticket revenues, screening analytics, and gatekeeper stats:</Text>
          
          {videos.map(vid => (
            <View key={vid.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', color: '#3182ce', fontSize: 13 }}>🎬 {vid.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: '#718096' }}>Tickets Sold: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{vid.ticketSalesCount || 0}</Text></Text>
                <Text style={{ fontSize: 11, color: '#718096' }}>Box Office Revenue: <Text style={{ fontWeight: 'bold', color: '#48bb78' }}>🪙 {vid.boxOfficeRevenue || 0} Coins</Text></Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 2. CREATOR MEMBERSHIPS & TIPPING SUITE */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText]}>⭐ Creator Memberships & Tipping</Text>
          <View style={{ backgroundColor: activeTierSubscription ? '#feebc8' : '#edf2f7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: activeTierSubscription ? '#744210' : '#4a5568', fontSize: 11, fontWeight: 'bold' }}>
              {activeTierSubscription ? `Tier: ${activeTierSubscription}` : 'Free Viewer'}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>Support your favorite channel broadcasts with monthly tiers or instant tips:</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' }}
            onPress={() => handleSubscribeTier('Eco Supporter 🌿', 100)}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginBottom: 2 }}>Eco Supporter 🌿</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>🪙 100 Coins / mo</Text>
            <Text style={{ fontSize: 10, color: '#48bb78', fontWeight: 'bold' }}>Badge & Emotes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8, marginLeft: 6, borderWidth: 1, borderColor: '#cbd5e0' }}
            onPress={() => handleSubscribeTier('Wilderness VIP 🦁', 250)}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d69e2e', marginBottom: 2 }}>Wilderness VIP 🦁</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>🪙 250 Coins / mo</Text>
            <Text style={{ fontSize: 10, color: '#d69e2e', fontWeight: 'bold' }}>All Access + VOD</Text>
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
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send Tip 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. BROADCAST NEW SCREENING FORM (YouTube or Local Flash Disk) */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>📺 Broadcast a New Screening (YouTube or Local Flash Disk)</Text>
        
        <TextInput
          style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkChatInput]}
          placeholder="Movie / Stream Title..."
          placeholderTextColor="#a0aec0"
          value={newVideoTitle}
          onChangeText={setNewVideoTitle}
        />

        {/* Local Flash Disk File Picker for Laptop/Web */}
        <div style={{ marginBottom: '10px', backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#3182ce', marginBottom: '4px' }}>
            📁 Select Video from Laptop / Flash Disk:
          </label>
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleSelectLocalVideo}
            style={{ fontSize: '12px', color: isDarkMode ? '#fff' : '#2d3748' }}
          />
          {localFileBanner ? (
            <Text style={{ fontSize: 10, color: '#48bb78', marginTop: 4, fontWeight: 'bold' }}>Loaded: {localFileBanner}</Text>
          ) : null}
        </div>

        <TextInput
          style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkChatInput]}
          placeholder="Or YouTube URL (https://youtu.be/...)"
          placeholderTextColor="#a0aec0"
          value={newVideoUrl}
          onChangeText={setNewVideoUrl}
        />

        <TextInput
          style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkChatInput]}
          placeholder="Brief Description..."
          placeholderTextColor="#a0aec0"
          value={newVideoDesc}
          onChangeText={setNewVideoDesc}
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleCreateVideo}>
          <Text style={styles.sendButtonText}>Publish Screening 🎟️</Text>
        </TouchableOpacity>
      </View>

      {/* 4. DYNAMIC CINEMA SCREENINGS & GATEKEEPER LIST */}
      {videos.map((item) => {
        const isUnlocked = unlockedCinemaIds.includes(item.id) || userRole === 'admin';
        const embedUrl = getYouTubeEmbedUrl(item.video_url);
        const isLocalFile = item.video_url && item.video_url.startsWith('blob:');

        return (
          <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkHeader, { maxWidth: 600, alignSelf: 'center', width: '100%' }]}>
            <Text style={styles.postAuthor}>Screening Host: {item.host || 'Borris'}</Text>
            <Text style={[styles.headerTitle, isDarkMode && styles.darkText, { fontSize: 16, marginBottom: 4 }]}>{item.title}</Text>
            {item.description ? <Text style={[styles.messageText, isDarkMode && styles.darkText, { marginBottom: 8, color: '#718096' }]}>{item.description}</Text> : null}
            
            {isUnlocked ? (
              <View>
                <View style={[styles.videoPlayerContainer, { position: 'relative' }]}>
                  <View style={{ backgroundColor: '#ebf8ff', padding: 6, borderRadius: 6, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#2b6cb0', fontSize: 11, fontWeight: 'bold' }}>🎟️ Ticket Verified | 🔒 Secure Stream</Text>
                    
                    <TouchableOpacity onPress={() => setCinemaAdPlaying(!cinemaAdPlaying)}>
                      <Text style={{ color: '#3182ce', fontSize: 11, fontWeight: 'bold' }}>{cinemaAdPlaying ? '📢 Ad Playing (Click to Skip)' : '💡 Insert Sponsor Ad'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dynamic Ad Overlay Banner */}
                  {cinemaAdPlaying && (
                    <View style={{ backgroundColor: '#feb2b2', padding: 8, borderRadius: 6, marginBottom: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#9b2c2c', fontWeight: 'bold', fontSize: 11 }}>Sponsored Spot: {cinemaSponsor}</Text>
                    </View>
                  )}

                  {/* Anti-Piracy Watermark */}
                  <View style={{ position: 'absolute', top: 40, left: 20, zIndex: 10, opacity: 0.35, pointerEvents: 'none' }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 3 }}>
                      SECURE CINEMA | Host: Borris
                    </Text>
                  </View>

                  {embedUrl ? (
                    <iframe
                      width="100%"
                      height="220"
                      src={embedUrl}
                      title={item.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 8 }}
                    />
                  ) : isLocalFile ? (
                    <video
                      width="100%"
                      height="220"
                      src={item.video_url}
                      controls
                      style={{ borderRadius: 8, backgroundColor: '#000' }}
                    />
                  ) : (
                    <TouchableOpacity style={styles.tvWatchButton} onPress={() => Linking.openURL(item.video_url)}>
                      <Text style={styles.sendButtonText}>▶️ Open & Watch Stream</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 5. MULTILINGUAL SUBTITLES & CC */}
                <View style={{ marginTop: 12, padding: 10, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', borderRadius: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>💬 Multilingual Subtitles & CC</Text>
                    <TouchableOpacity onPress={() => setCinemaCcActive(!cinemaCcActive)}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: cinemaCcActive ? '#38a169' : '#e53e3e' }}>{cinemaCcActive ? 'CC: ON 🟢' : 'CC: OFF 🔴'}</Text>
                    </TouchableOpacity>
                  </View>
                  {cinemaCcActive && (
                    <Text style={[{ fontSize: 11, fontStyle: 'italic' }, isDarkMode && styles.darkText]}>"{cinemaSubtitlePreview}" ({cinemaSubLanguage})</Text>
                  )}
                </View>

                {/* 6. LIVE MOVIE COMMENTARY MODE */}
                <View style={{ marginTop: 12, padding: 12, backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7', borderRadius: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 13 }]}>🎙️ Live Movie Commentary Room</Text>
                    <TouchableOpacity onPress={() => setCommentaryActive(!commentaryActive)}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{commentaryActive ? 'Hide Commentary' : 'Open Commentary 💬'}</Text>
                    </TouchableOpacity>
                  </View>

                  {commentaryActive && (
                    <View>
                      <View style={{ maxHeight: 100, marginBottom: 8 }}>
                        {commentaryFeed.map(comm => (
                          <View key={comm.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#fff', padding: 6, borderRadius: 6, marginBottom: 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3182ce' }}>{comm.author}</Text>
                            <Text style={[{ fontSize: 12 }, isDarkMode && styles.darkText]}>{comm.text}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <TextInput
                          style={[styles.chatInput, { flex: 1, height: 35, marginRight: 6 }, isDarkMode && styles.darkChatInput]}
                          placeholder="Type director or viewer commentary..."
                          placeholderTextColor="#a0aec0"
                          value={commentaryInput}
                          onChangeText={setCommentaryInput}
                        />
                        <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 6 }} onPress={handleSendCommentary}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Post</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* 7. INTERMISSION & LIVE STAGE Q&A MODE */}
                <View style={{ marginTop: 12, padding: 12, backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7', borderRadius: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 13 }]}>⏳ Intermission & Live Stage Q&A</Text>
                    <TouchableOpacity onPress={() => setIntermissionActive(!intermissionActive)}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#d69e2e' }}>{intermissionActive ? 'Resume Screening' : 'Start Intermission 🍿'}</Text>
                    </TouchableOpacity>
                  </View>

                  {intermissionActive && (
                    <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#fff', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#d69e2e', marginBottom: 4 }}>☕ Intermission Break</Text>
                      <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 8 }}>Stretch your legs, grab snacks, and submit questions for the live stage Q&A session!</Text>
                    </View>
                  )}

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Audience Stage Questions:</Text>
                  {qaQuestions.map(q => (
                    <View key={q.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#fff', padding: 6, borderRadius: 6, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[{ fontSize: 12 }, isDarkMode && styles.darkText]}>❓ {q.question} <Text style={{ fontSize: 10, color: '#718096' }}>({q.user})</Text></Text>
                      <TouchableOpacity onPress={() => setQaQuestions(prev => prev.map(item => item.id === q.id ? { ...item, votes: item.votes + 1 } : item))}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>👍 {q.votes}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <TextInput
                      style={[styles.chatInput, { flex: 1, height: 35, marginRight: 6 }, isDarkMode && styles.darkChatInput]}
                      placeholder="Ask the host a question..."
                      placeholderTextColor="#a0aec0"
                      value={newQaQuestion}
                      onChangeText={setNewQaQuestion}
                    />
                    <TouchableOpacity style={{ backgroundColor: '#48bb78', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 6 }} onPress={handleAddQaQuestion}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Ask 🎤</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            ) : (
              <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#edf2f7', padding: 20, borderRadius: 10, alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ fontSize: 28, marginBottom: 5 }}>🔒</Text>
                <Text style={[{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }, isDarkMode && styles.darkText]}>Exclusive Cinema Screening</Text>
                <Text style={{ color: '#718096', textAlign: 'center', marginBottom: 15, fontSize: 13 }}>
                  This screening requires a digital access ticket. Pay {TICKET_PRICE_COINS} coins to unlock instantly.
                </Text>
                <TouchableOpacity style={{ backgroundColor: '#3182ce', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }} onPress={() => handleBuyCinemaTicket(item.id, item.title)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buy Ticket (🪙 {TICKET_PRICE_COINS} Coins)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  darkText: { color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  messageText: { fontSize: 15 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 40, backgroundColor: '#f7fafc', color: '#2d3748' },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  postAuthor: { fontWeight: 'bold', color: '#3182ce', marginBottom: 6 },
  commentsHeader: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
  tvWatchButton: { backgroundColor: '#e53e3e', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  videoPlayerContainer: { width: '100%', height: 220, borderRadius: 8, marginTop: 8, overflow: 'hidden' },
});