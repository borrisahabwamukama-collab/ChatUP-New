import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

const MOCK_GROUPS = [
  { id: '1', name: 'Kampala Sunday Prayer Cell', avatar: '🙏', lastMessage: 'Let us remember to pray for the upcoming outreach.', time: '10:45 AM', unread: 3, isPining: true },
  { id: '2', name: 'ChatUp Dev Team', avatar: '💻', lastMessage: 'Supabase table policies updated successfully.', time: '9:12 AM', unread: 0, isPining: false },
  { id: '3', name: 'Worship & Media Hub', avatar: '🎥', lastMessage: 'Camera angles for Sunday service are set.', time: 'Yesterday', unread: 1, isPining: false },
];

export default function GroupListScreen({ navigation, coins, setCoins, isDarkMode }) {
  const [chats, setChats] = useState(MOCK_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');

  // TOGGLE CONTROLS
  const [pinFilterActive, setPinFilterActive] = useState(false);
  const [meshStatusIndicatorActive, setMeshStatusIndicatorActive] = useState(true);
  const [showArchivedFolder, setShowArchivedFolder] = useState(false);
  const [archivedCount] = useState(4);
  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState(false);
  const [biometricEnclaveLocked, setBiometricEnclaveLocked] = useState(false);

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  // Initialize AdMob Rewarded Ad
  useEffect(() => {
    initRewardedAd();
  }, []);

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
          setCoins(prev => prev + 50);
        }
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +50 Coins chat sponsor bonus!');
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
        setCoins(prev => prev + 50);
      }
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +50 coins added to your ChatUp wallet balance.');
    }
  };

  // SEARCH & FILTER LOGIC
  const filteredChats = chats.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (pinFilterActive && !item.isPining) return false;
    if (unreadOnlyFilter && item.unread === 0) return false;
    return matchesSearch;
  });

  const handleOpenChat = (item) => {
    if (biometricEnclaveLocked) {
      return Alert.alert('Enclave Locked 🔒', 'Please authenticate with biometrics to open this secure chat room.');
    }
    
    // ✅ FIXED: Safely navigate to ChatRoomScreen and pass group details
    try {
      navigation.navigate('ChatRoomScreen', {
        groupId: item.id,
        groupName: item.name,
        groupAvatar: item.avatar,
      });
    } catch (error) {
      // Fallback if named differently in App.js Stack Navigator
      try {
        navigation.navigate('ChatRoom', {
          groupId: item.id,
          groupName: item.name,
        });
      } catch (e) {
        Alert.alert('Navigation Error 🚫', 'ChatRoomScreen is not registered in your Stack Navigator.');
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chatItem, isDarkMode && styles.darkChatItem]}
      onPress={() => handleOpenChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
        {item.isPining && (
          <View style={styles.pinBadge}>
            <Text style={{ fontSize: 9 }}>📌</Text>
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.topRow}>
          <Text style={[styles.name, isDarkMode && styles.darkText]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.time, isDarkMode && { color: '#a0aec0' }]}>{item.time}</Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={[styles.lastMsg, isDarkMode && { color: '#94a3b8' }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
      <View style={styles.monetizationAdCard}>
        <Text style={styles.adTagLabel}>Sponsored Chat Banner 📢 • AdMob Banner</Text>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob GroupList Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob GroupList Banner load error: ', error)}
          />
        </View>
      </View>

      {/* ================= REWARDED AD CHAT REWARD WIDGET ================= */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Chat Reward Boost</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a sponsor clip to earn +50 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+50 🪙) 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar & Tools Header */}
      <View style={[styles.headerContainer, isDarkMode && styles.darkHeader]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Search Kampala chats, groups, or messages..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* TOGGLE CONTROLS BAR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollRow}>
          <TouchableOpacity 
            style={[styles.filterChip, pinFilterActive && styles.activeFilterChip, isDarkMode && styles.darkFilterChip]}
            onPress={() => setPinFilterActive(!pinFilterActive)}
          >
            <Text style={[styles.filterChipText, pinFilterActive && { color: '#fff' }, isDarkMode && !pinFilterActive && { color: '#cbd5e0' }]}>📌 Pinned</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, unreadOnlyFilter && styles.activeFilterChip, isDarkMode && styles.darkFilterChip]}
            onPress={() => setUnreadOnlyFilter(!unreadOnlyFilter)}
          >
            <Text style={[styles.filterChipText, unreadOnlyFilter && { color: '#fff' }, isDarkMode && !unreadOnlyFilter && { color: '#cbd5e0' }]}>💬 Unread</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, showArchivedFolder && styles.activeFilterChip, isDarkMode && styles.darkFilterChip]}
            onPress={() => setShowArchivedFolder(!showArchivedFolder)}
          >
            <Text style={[styles.filterChipText, showArchivedFolder && { color: '#fff' }, isDarkMode && !showArchivedFolder && { color: '#cbd5e0' }]}>📁 Archived ({archivedCount})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, biometricEnclaveLocked && { backgroundColor: '#e53e3e', borderColor: '#e53e3e' }, isDarkMode && !biometricEnclaveLocked && styles.darkFilterChip]}
            onPress={() => {
              setBiometricEnclaveLocked(!biometricEnclaveLocked);
              Alert.alert('Enclave Lock', !biometricEnclaveLocked ? '🔒 Biometric chat enclave locked.' : 'Enclave unlocked.');
            }}
          >
            <Text style={[styles.filterChipText, biometricEnclaveLocked && { color: '#fff' }, isDarkMode && !biometricEnclaveLocked && { color: '#cbd5e0' }]}>
              {biometricEnclaveLocked ? '🔒 Enclave Locked' : '🔓 Enclave Open'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* OFFLINE MESH BANNER */}
        {meshStatusIndicatorActive && (
          <View style={[styles.meshBanner, isDarkMode && { backgroundColor: '#064e3b', borderColor: '#065f46' }]}>
            <Text style={[styles.meshBannerText, isDarkMode && { color: '#6ee7b7' }]}>🛰️ Mesh Node Active: 3 offline peers connected in Kampala</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={[styles.separator, isDarkMode && styles.darkSeparator]} />}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          try {
            navigation.navigate('CreateGroupScreen');
          } catch (error) {
            Alert.alert('Navigation Error', 'Target screen "CreateGroupScreen" is not registered in your Stack Navigator.');
          }
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerContainer: { padding: 12, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  searchInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 38, fontSize: 12, color: '#0f172a', marginBottom: 8 },
  darkSearchInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  filterScrollRow: { flexDirection: 'row', marginBottom: 4 },
  filterChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  darkFilterChip: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  activeFilterChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  meshBanner: { backgroundColor: '#f0fdf4', padding: 6, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center' },
  meshBannerText: { fontSize: 10, fontWeight: 'bold', color: '#15803d' },
  chatItem: { flexDirection: 'row', padding: 12, alignItems: 'center', backgroundColor: '#ffffff' },
  darkChatItem: { backgroundColor: '#1a202c' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  pinBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  avatarText: { fontSize: 22 },
  chatInfo: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '600', color: '#0f172a', flex: 1, marginRight: 8 },
  darkText: { color: '#ffffff' },
  time: { fontSize: 12, color: 'gray' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { fontSize: 14, color: 'gray', flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: '#2563eb', borderRadius: 12, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 76 },
  darkSeparator: { backgroundColor: '#2d3748' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  fabText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: -2 },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});