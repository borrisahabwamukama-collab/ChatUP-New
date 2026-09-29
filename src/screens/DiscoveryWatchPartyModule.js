import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function DiscoveryWatchPartyModule({
  isDarkMode,
  watchPartyActive,
  watchPartyPeers,
  setWatchPartyPeers,
  isPlayingWatchParty,
  setIsPlayingWatchParty,
  watchPartyPlaylist,
  currentWatchPartyIndex,
  setCurrentWatchPartyIndex,
  watchPartyChat,
  newWatchChatText,
  setNewWatchChatText,
  handleSendWatchChat,
}) {
  const [liveStreamReactions, setLiveStreamReactions] = useState([]);
  const [syncStatus, setSyncStatus] = useState('Fully Synchronized 🟢 (0.12ms Latency)');

  // Autonomous simulation: periodically inject peer activity and simulated reactions to keep the room lively
  useEffect(() => {
    if (!watchPartyActive) return;
    
    const interval = setInterval(() => {
      // Randomly simulate a peer joining or leaving slightly
      const randomShift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      if (randomShift !== 0) {
        setWatchPartyPeers(prev => Math.max(3, prev + randomShift));
      }

      // Randomly trigger floating reaction from peers
      const peerEmojis = ['🔥', '🐘', '👏', '🌿', '💎', '🚀'];
      const randomEmoji = peerEmojis[Math.floor(Math.random() * peerEmojis.length)];
      if (Math.random() > 0.6) {
        triggerWatchReaction(randomEmoji);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [watchPartyActive]);

  const triggerWatchReaction = (emoji) => {
    const rx = { id: Date.now().toString() + Math.random(), emoji };
    setLiveStreamReactions(prev => [...prev, rx]);
    setTimeout(() => {
      setLiveStreamReactions(prev => prev.filter(item => item.id !== rx.id));
    }, 1800);
  };

  const activeVideoSource = watchPartyPlaylist[currentWatchPartyIndex] || watchPartyPlaylist[0];

  return (
    <View style={styles.container}>
      
      {/* Watch Party Header Banner */}
      <View style={[styles.partyHeaderBanner, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.livePulseDot} />
            <Text style={[styles.partyHeaderTitle, isDarkMode && styles.darkText]}>📺 Live Virtual TV Watch Party</Text>
          </View>
          <View style={styles.peersBadge}>
            <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>👥 {watchPartyPeers} Peers Active</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontSize: 11, color: '#718096' }}>
            Host: <Text style={{ fontWeight: 'bold', color: '#3182ce' }}>{activeVideoSource.host}</Text>
          </Text>
          <Text style={{ fontSize: 9, color: '#38a169', fontWeight: 'bold' }}>{syncStatus}</Text>
        </View>
      </View>

      {/* Main Video Theater Player */}
      <View style={styles.theaterContainer}>
        {Platform.OS === 'web' ? (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video
              src={activeVideoSource.url}
              controls
              autoPlay={isPlayingWatchParty}
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <Video
            source={{ uri: activeVideoSource.url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={ResizeMode.COVER}
            isLooping
            useNativeControls
            shouldPlay={isPlayingWatchParty}
          />
        )}

        {/* Floating Live Reactions Layer */}
        {liveStreamReactions.map(rx => (
          <View key={rx.id} style={styles.floatingReactionBubble}>
            <Text style={{ fontSize: 36 }}>{rx.emoji}</Text>
          </View>
        ))}

        {/* Stream Overlay Title Badge */}
        <View style={styles.streamTitleOverlay}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🔴 Broadcast Room: {activeVideoSource.title}</Text>
        </View>

        {/* Quick Reaction Bar Over Theater */}
        <View style={styles.theaterReactionOverlay}>
          {['🔥', '🐘', '👏', '💎', '🎉'].map(emoji => (
            <TouchableOpacity key={emoji} style={styles.theaterEmojiBtn} onPress={() => triggerWatchReaction(emoji)}>
              <Text style={{ fontSize: 18 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Playlist Selector Bar */}
      <View style={[styles.playlistCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.subSectionTitle, isDarkMode && styles.darkText]}>📂 Room Stream Playlist & Queue</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {watchPartyPlaylist.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.playlistItemPill, currentWatchPartyIndex === idx && styles.activePlaylistPill]}
              onPress={() => setCurrentWatchPartyIndex(idx)}
            >
              <Text style={[styles.playlistItemText, currentWatchPartyIndex === idx && { color: '#fff' }]} numberOfLines={1}>
                {idx + 1}. {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Live Peer Chat Room Section */}
      <View style={[styles.chatCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.subSectionTitle, isDarkMode && styles.darkText]}>💬 Synchronized Room Discussion</Text>
        
        <ScrollView style={styles.chatScrollContainer} showsVerticalScrollIndicator={false}>
          {watchPartyChat.map(msg => (
            <View key={msg.id} style={styles.chatMessageBubble}>
              <Text style={styles.chatAuthor}>{msg.user}:</Text>
              <Text style={[styles.chatText, isDarkMode && styles.darkText]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Quick Conversation Starter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          {['Stunning view 🐘', 'Brilliant conservation angle 🌿', 'Schedule next expedition here 🗺️', 'Incredible audio quality 🎵'].map((phrase, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.quickPhrasePill}
              onPress={() => setNewWatchChatText(phrase)}
            >
              <Text style={{ fontSize: 10, color: '#3182ce', fontWeight: 'bold' }}>{phrase}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat Input Bar */}
        <View style={styles.chatInputRow}>
          <TextInput
            style={[styles.chatTextInput, isDarkMode && { backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }]}
            placeholder="Send message to watch party..."
            placeholderTextColor="#a0aec0"
            value={newWatchChatText}
            onChangeText={setNewWatchChatText}
            onSubmitEditing={handleSendWatchChat}
          />
          <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendWatchChat}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  partyHeaderBanner: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  darkText: { color: '#fff' },
  livePulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e53e3e', marginRight: 8 },
  partyHeaderTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  peersBadge: { backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  
  theaterContainer: { height: 380, width: '100%', backgroundColor: '#000', borderRadius: 14, overflow: 'hidden', position: 'relative', marginBottom: 14, justifyContent: 'center', alignItems: 'center' },
  streamTitleOverlay: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  theaterReactionOverlay: { position: 'absolute', right: 12, bottom: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 6, gap: 8, alignItems: 'center', zIndex: 10 },
  theaterEmojiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  floatingReactionBubble: { position: 'absolute', bottom: 100, alignSelf: 'center', zIndex: 20 },

  playlistCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  subSectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 8 },
  playlistItemPill: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e0', maxWidth: 200 },
  activePlaylistPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  playlistItemText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },

  chatCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  chatScrollContainer: { maxHeight: 160, backgroundColor: '#f7fafc', borderRadius: 8, padding: 8, marginBottom: 8 },
  chatMessageBubble: { flexDirection: 'row', marginBottom: 6, flexWrap: 'wrap' },
  chatAuthor: { fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginRight: 6 },
  chatText: { fontSize: 11, color: '#2d3748' },
  quickPhrasePill: { backgroundColor: '#ebf8ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, borderWidth: 1, borderColor: '#bee3f8' },
  chatInputRow: { flexDirection: 'row', gap: 8 },
  chatTextInput: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 36, fontSize: 11 },
  sendChatBtn: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, borderRadius: 8, height: 36 },
});