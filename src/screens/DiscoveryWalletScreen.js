import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';

export default function DiscoveryWalletScreen({ isDarkMode }) {
  const [discoveryTab, setDiscoveryTab] = useState('Feed'); // 'Feed', 'Tours', 'Radar', 'Channels', 'LiveMap'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [activeMediaItem, setActiveMediaItem] = useState(null);
  const [longPressModalVisible, setLongPressModalVisible] = useState(false);

  // Stories
  const [stories] = useState([
    { id: '1', name: 'Nimusiima', location: 'Queen Elizabeth Park', mediaType: 'Elephant Herd Clip' },
    { id: '2', name: 'Stella', location: 'Kampala Central', mediaType: 'Acoustic Studio Jam' },
    { id: '3', name: 'Borris', location: 'Bwindi Impenetrable', mediaType: 'Gorilla Trekking Tour' },
  ]);

  // Feed Items (Tours & Media)
  const [feedItems, setFeedItems] = useState([
    {
      id: '1',
      author: 'Borris (Talk With Nature)',
      caption: '🐘 Bwindi Mountain Gorilla Expedition & Guided Forest Walk. Experience the raw beauty of Uganda conservation zones!',
      likes: 840,
      commentsCount: 52,
      shares: 31,
      vibe: 'Wildlife Tour 🌿',
      category: 'Tours',
      videoUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop',
      location: 'Bwindi Impenetrable National Park, Uganda',
      duration: '4:20 Min Tour'
    },
    {
      id: '2',
      author: 'Pearl Safaris UG',
      caption: '🌅 Source of the Nile Sunset Boat Cruise in Jinja. Audio tour guide active on mesh network.',
      likes: 610,
      commentsCount: 29,
      shares: 18,
      vibe: 'Water Expedition 🌊',
      category: 'Tours',
      videoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      location: 'Jinja, Uganda',
      duration: '2:45 Min Tour'
    },
    {
      id: '3',
      author: 'Studio UG Music',
      caption: '🎸 Live acoustic sunset session in Kampala cultural center. Real-time audio stems applied.',
      likes: 490,
      commentsCount: 41,
      shares: 15,
      vibe: 'Music Showcase 🎵',
      category: 'Music',
      videoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
      location: 'Kampala, Uganda',
      duration: 'Live Reel'
    },
  ]);

  const [officialChannels] = useState([
    { id: 'ch_1', name: 'Talk with Nature HD', owner: 'Borris Ranger Hub', category: 'Wildlife', followers: '14.2K', badge: 'Official Broadcaster 🛡️' },
    { id: 'ch_2', name: 'Kampala Sports TV', owner: 'Sports Hub UG', category: 'Sports', followers: '22.5K', badge: 'Official Broadcaster 🛡️' },
    { id: 'ch_3', name: 'Pearl Safaris Tour Channel', owner: 'Uganda Tourism Board', category: 'Tours', followers: '35.1K', badge: 'Verified Tour Partner 🌟' },
  ]);

  const [radarNodes] = useState([
    { id: 'node_1', name: 'Ranger Brian', distance: '1.2 km away', status: 'Broadcasting Field Tour', signal: 'Strong (Mesh Node)' },
    { id: 'node_2', name: 'Kampala Mesh Relay 04', distance: '3.1 km away', status: 'Active RTMP Relay Station', signal: 'High Bandwidth 🟢' },
  ]);

  // Handlers
  const handleLikePost = (id) => {
    setFeedItems(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
  };

  const handleOpenForwardModal = (item) => {
    setSelectedPost(item);
    setForwardModalVisible(true);
  };

  const handleExecuteForward = (destination) => {
    setForwardModalVisible(false);
    Alert.alert('International Share 🚀', `Successfully broadcasted post to ${destination} across global & local mesh nodes.`);
    setFeedItems(prev => prev.map(item => item.id === selectedPost.id ? { ...item, shares: item.shares + 1 } : item));
  };

  const handleLongPressMedia = (item) => {
    setSelectedPost(item);
    setLongPressModalVisible(true);
  };

  const handleDownloadMedia = () => {
    setLongPressModalVisible(false);
    Alert.alert('Download Started 📥', `Securely downloading "${selectedPost?.author}'s media" to your local offline device storage.`);
  };

  const handleOpenFullScreen = (item) => {
    setActiveMediaItem(item);
    setFullScreenModalVisible(true);
  };

  const categories = ['All', 'Tours', 'Wildlife', 'Music', 'Tech'];

  const filteredFeed = feedItems.filter(item => {
    const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.vibe.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Header & Navigation Bar */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerInner}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🌍 Discovery, Tours & Creator Feed</Text>
          <View style={[styles.searchBox, isDarkMode && styles.darkSearchBox]}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkText]}
              placeholder="Search tours, wildlife (#Gorillas), creators..."
              placeholderTextColor="#a0aec0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: '#718096', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sub Navigation Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
          {[
            { key: 'Feed', label: '🔥 Trending Feed' },
            { key: 'Tours', label: '🦁 African Tours' },
            { key: 'Radar', label: '📡 Vibe Radar' },
            { key: 'Channels', label: '🛡️ Official Channels' },
            { key: 'LiveMap', label: '🗺️ Geofenced Map' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTabBtn, discoveryTab === tab.key && styles.activeSubTabBtn]}
              onPress={() => setDiscoveryTab(tab.key)}
            >
              <Text style={[styles.subTabBtnText, discoveryTab === tab.key && styles.activeSubTabBtnText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= 3-COLUMN DESKTOP LAYOUT ================= */}
      <ScrollView contentContainerStyle={styles.mainLayout} showsVerticalScrollIndicator={false}>
        
        {/* LEFT SIDEBAR: Shortcuts & Trending Tags */}
        <View style={[styles.leftSidebar, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sidebarHeading, isDarkMode && styles.darkText]}>⚡ Quick Shortcuts</Text>
          <TouchableOpacity style={styles.sidebarLink} onPress={() => { setDiscoveryTab('Tours'); setSelectedCategory('Tours'); }}>
            <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>🦁 African Wildlife Tours</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarLink} onPress={() => setDiscoveryTab('Radar')}>
            <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>📡 Nearby Vibe Radar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarLink} onPress={() => setDiscoveryTab('Channels')}>
            <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>🛡️ Official Broadcasters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarLink} onPress={() => setDiscoveryTab('LiveMap')}>
            <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>🗺️ National GPS Map</Text>
          </TouchableOpacity>
          
          <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 }}>
            <Text style={[styles.sidebarHeading, isDarkMode && styles.darkText]}>🏷️ Trending Tags</Text>
            <Text style={{ fontSize: 11, color: '#718096', lineHeight: 18 }}>#BwindiGorillas{'\n'}#QueenElizabethPark{'\n'}#KampalaTech{'\n'}#SourceOfTheNile</Text>
          </View>
        </View>

        {/* CENTER COLUMN: Main Feed & Stories */}
        <View style={styles.centerFeed}>
          {(discoveryTab === 'Feed' || discoveryTab === 'Tours') && (
            <View>
              {/* Ephemeral Stories */}
              <View style={[styles.storyCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⚡ Geofenced Story Rings & Expeditions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyScroll}>
                  {stories.map(story => (
                    <TouchableOpacity 
                      key={story.id} 
                      style={styles.storyRingContainer}
                      onPress={() => Alert.alert('Story Ring', `Viewing live tour clip: ${story.mediaType} at ${story.location}`)}
                    >
                      <View style={styles.storyRing}>
                        <View style={styles.storyAvatar}>
                          <Text style={styles.storyAvatarText}>{story.name[0]}</Text>
                        </View>
                      </View>
                      <Text style={[styles.storyName, isDarkMode && styles.darkText]} numberOfLines={1}>{story.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Category Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterPill, selectedCategory === cat && styles.activeFilterPill]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.filterPillText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                {discoveryTab === 'Tours' ? '🦁 Featured African Wildlife & Cultural Tours' : '🔥 Trending Timeline Feed'}
              </Text>

              {filteredFeed.length > 0 ? (
                filteredFeed.map(item => (
                  <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                    <View style={styles.postHeaderRow}>
                      <View>
                        <Text style={styles.postAuthor}>{item.author}</Text>
                        <Text style={{ fontSize: 9, color: '#a0aec0' }}>📍 {item.location}</Text>
                      </View>
                      <Text style={styles.vibeBadge}>[{item.vibe}]</Text>
                    </View>

                    {/* Centered Media Box with Long Press & Theater Mode */}
                    <Pressable 
                      style={styles.mediaContainerCenter}
                      onLongPress={() => handleLongPressMedia(item)}
                    >
                      <Image source={{ uri: item.videoUrl }} style={styles.postImageMedia} resizeMode="cover" />
                      
                      <View style={styles.mediaOverlayTop}>
                        <View style={styles.badgePill}>
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>▶ {item.duration}</Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={styles.expandButton} 
                        onPress={() => handleOpenFullScreen(item)}
                      >
                        <Text style={{ fontSize: 11, color: '#fff' }}>🔍 Full Screen</Text>
                      </TouchableOpacity>
                    </Pressable>

                    <Text style={[styles.postCaption, isDarkMode && styles.darkText]}>{item.caption}</Text>

                    <View style={styles.postFooter}>
                      <TouchableOpacity style={styles.footerAction} onPress={() => handleLikePost(item.id)}>
                        <Text style={{ fontSize: 12 }}>❤️ {item.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.footerAction} onPress={() => Alert.alert('Comments', 'Opening secure comment thread...')}>
                        <Text style={{ fontSize: 12 }}>💬 {item.commentsCount}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.footerAction} onPress={() => handleOpenForwardModal(item)}>
                        <Text style={{ fontSize: 12 }}>🔄 {item.shares}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 30 }}>No tours or posts found.</Text>
              )}
            </View>
          )}

          {discoveryTab === 'Radar' && (
            <View>
              <TouchableOpacity style={styles.radarCardActive} onPress={() => Alert.alert('Vibe Radar', 'Scanning 3km radius...')}>
                <Text style={styles.radarTitle}>📡 Discovery Vibe Radar Active (3km Radius)</Text>
                <Text style={styles.radarDesc}>Detecting nearby tour guides, wildlife rangers, and peer mesh nodes.</Text>
              </TouchableOpacity>
              {radarNodes.map(node => (
                <View key={node.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={[styles.postAuthor, { fontSize: 13 }]}>{node.name}</Text>
                      <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold' }}>{node.status}</Text>
                      <Text style={{ fontSize: 10, color: '#718096' }}>{node.distance} • {node.signal}</Text>
                    </View>
                    <TouchableOpacity style={styles.connectRadarBtn} onPress={() => Alert.alert('Radar', `Connected with ${node.name}`)}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Connect 🤝</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {discoveryTab === 'Channels' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛡️ Certified Broadcasters & Tour Partners</Text>
              {officialChannels.map(ch => (
                <View key={ch.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.postAuthor, { fontSize: 13 }]}>{ch.name}</Text>
                      <Text style={{ fontSize: 11, color: '#3182ce' }}>{ch.owner} • {ch.category}</Text>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#d69e2e', marginTop: 2 }}>{ch.badge} • {ch.followers} Followers</Text>
                    </View>
                    <TouchableOpacity style={styles.connectRadarBtn} onPress={() => Alert.alert('Channel', `Opening stream for ${ch.name}`)}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Tune In 📺</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {discoveryTab === 'LiveMap' && (
            <View style={[styles.postCard, isDarkMode && styles.darkCard, { alignItems: 'center', padding: 30 }]}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🗺️🛰️</Text>
              <Text style={[styles.postAuthor, { fontSize: 16, marginBottom: 6 }]}>Uganda National Tour & Geofenced Map</Text>
              <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 14 }}>
                Active conservation and tour tracking across Bwindi, Queen Elizabeth, and Kampala city nodes.
              </Text>
              <TouchableOpacity style={styles.connectRadarBtn} onPress={() => Alert.alert('Map', 'Refreshed node coordinates.')}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Refresh GPS Clusters 🔄</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* RIGHT SIDEBAR: Suggested Tour Channels & Mesh Status */}
        <View style={[styles.rightSidebar, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sidebarHeading, isDarkMode && styles.darkText]}>📺 Suggested Tour Channels</Text>
          {officialChannels.map(ch => (
            <View key={ch.id} style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>{ch.name}</Text>
              <Text style={{ fontSize: 10, color: '#3182ce' }}>{ch.followers} Followers</Text>
            </View>
          ))}
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.sidebarHeading, isDarkMode && styles.darkText]}>🟢 Mesh Network Status</Text>
            <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold' }}>Kampala Node: Online 🟢</Text>
            <Text style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>Zero-Net Sync: 99.1%</Text>
          </View>
        </View>

      </ScrollView>

      {/* ================= MODAL 1: INTERNATIONAL FORWARD / SHARE ================= */}
      <Modal visible={forwardModalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setForwardModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🌐 International Forward & Share</Text>
              <TouchableOpacity onPress={() => setForwardModalVisible(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleExecuteForward('Global Chat Inbox')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>💬 Forward to Active Chat Inbox</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleExecuteForward('International Mesh Relay')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>🛰️ Broadcast to International Mesh Network</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleExecuteForward('Virtual TV Watch Party')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>📺 Stream in Virtual TV Watch Party</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.forwardOptionRow, { borderBottomWidth: 0 }]} onPress={() => handleExecuteForward('Secure External Clipboard Link')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>📋 Copy International Secure Link</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ================= MODAL 2: FULL-SCREEN THEATER VIEWER ================= */}
      <Modal visible={fullScreenModalVisible} animationType="fade" transparent={true}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity style={styles.closeFullScreenBtn} onPress={() => setFullScreenModalVisible(false)}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕ Close Theater Mode</Text>
          </TouchableOpacity>
          {activeMediaItem && (
            <View style={styles.fullScreenContent}>
              <Image source={{ uri: activeMediaItem.videoUrl }} style={styles.fullScreenImage} resizeMode="contain" />
              <Text style={styles.fullScreenCaption}>{activeMediaItem.caption}</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* ================= MODAL 3: LONG-PRESS CONTEXT MENU (DOWNLOAD, ETC.) ================= */}
      <Modal visible={longPressModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setLongPressModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 350, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>⚙️ Media Quick Actions</Text>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={handleDownloadMedia}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>📥 Download Media to Device</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => { setLongPressModalVisible(false); Alert.alert('Saved', 'Media added to offline favorites.'); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>⭐ Save to Offline Vault</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.forwardOptionRow, { borderBottomWidth: 0 }]} onPress={() => { setLongPressModalVisible(false); Alert.alert('Report', 'Content flagged for safety review.'); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e53e3e' }}>⚠️ Report Content</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingTop: 8 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerInner: { maxWidth: 1200, width: '100%', alignSelf: 'center', paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 34, width: 280 },
  darkSearchBox: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  searchInput: { flex: 1, fontSize: 11 },
  subTabsRow: { maxWidth: 1200, width: '100%', alignSelf: 'center', paddingHorizontal: 16, maxHeight: 36, marginTop: 6, marginBottom: 6 },
  subTabBtn: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 6, height: 30, justifyContent: 'center' },
  activeSubTabBtn: { backgroundColor: '#3182ce' },
  subTabBtnText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  activeSubTabBtnText: { color: '#fff' },

  // 3-Column Desktop Grid Layout
  mainLayout: { flexDirection: 'row', justifyContent: 'center', padding: 16, maxWidth: 1250, width: '100%', alignSelf: 'center' },
  leftSidebar: { width: 240, backgroundColor: '#fff', borderRadius: 10, padding: 14, marginRight: 14, borderWidth: 1, borderColor: '#e2e8f0', height: 320 },
  rightSidebar: { width: 260, backgroundColor: '#fff', borderRadius: 10, padding: 14, marginLeft: 14, borderWidth: 1, borderColor: '#e2e8f0', height: 320 },
  centerFeed: { flex: 1, maxWidth: 600, width: '100%' },

  sidebarHeading: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  sidebarLink: { paddingVertical: 6 },

  storyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 8 },
  storyScroll: { flexDirection: 'row' },
  storyRingContainer: { alignItems: 'center', marginRight: 12, width: 55 },
  storyRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  storyAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center' },
  storyAvatarText: { fontWeight: 'bold', color: '#2b6cb0', fontSize: 14 },
  storyName: { fontSize: 9, color: '#4a5568', marginTop: 3, textAlign: 'center' },

  filterPill: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginRight: 6 },
  activeFilterPill: { backgroundColor: '#3182ce' },
  filterPillText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },

  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', width: '100%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  postHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  postAuthor: { fontSize: 12, fontWeight: 'bold', color: '#3182ce' },
  vibeBadge: { fontSize: 10, fontStyle: 'italic', color: '#a0aec0' },

  mediaContainerCenter: { height: 320, width: '100%', backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', position: 'relative', marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  postImageMedia: { width: '100%', height: '100%' },
  mediaOverlayTop: { position: 'absolute', top: 8, left: 8 },
  badgePill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  expandButton: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  postCaption: { fontSize: 11, color: '#2d3748', marginBottom: 8, lineHeight: 15 },
  darkText: { color: '#fff' },
  postFooter: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 6 },
  footerAction: { flexDirection: 'row', alignItems: 'center' },

  radarCardActive: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 10, padding: 12, marginBottom: 12 },
  radarTitle: { fontSize: 12, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 4 },
  radarDesc: { fontSize: 10, color: '#4a5568' },
  connectRadarBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 14, width: '100%', maxWidth: 360, alignSelf: 'center' },
  modalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  forwardOptionRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },

  fullScreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  closeFullScreenBtn: { position: 'absolute', top: 30, right: 30, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  fullScreenContent: { width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '85%' },
  fullScreenCaption: { color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 15 },
});