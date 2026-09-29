import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ isDarkMode, coins, setCoins, currentUser, navigation }) {
  // Active operational sphere state
  const [activeSphere, setActiveSphere] = useState('COMMAND');

  // Status toggle for privacy
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 100 }}>
      
      {/* 1. MASTER ENTERPRISE STATUS HEADER */}
      <View style={[styles.statusCard, isDarkMode && styles.darkCard]}>
        <View style={styles.statusTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={16} color="#38a169" />
            <Text style={[styles.statusLabel, isDarkMode && styles.darkText]}> ChatUp Enterprise Command</Text>
          </View>
          <TouchableOpacity onPress={() => setBalanceHidden(!balanceHidden)}>
            <Ionicons name={balanceHidden ? "eye-off-outline" : "eye-outline"} size={18} color="#718096" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.balanceAmount, isDarkMode && styles.darkText]}>
          {balanceHidden ? '••••••••' : `🪙 ${coins.toLocaleString()} Reward Coins`}
        </Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 14 }}>
          Workspace ID: {currentUser?.id ? currentUser.id.slice(0, 10) : 'borris_admin'} • Global AI Active 🟢
        </Text>

        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => navigation.navigate('AdminControl')}
          >
            <Ionicons name="settings-outline" size={16} color="#3182ce" />
            <Text style={[styles.quickActionText, isDarkMode && styles.darkText]}>Super-Admin</Text>
          </TouchableOpacity>

          <View style={[styles.actionDivider, isDarkMode && { backgroundColor: '#4a5568' }]} />

          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => navigation.navigate('GlobalAISupervisor')}
          >
            <Ionicons name="hardware-chip-outline" size={16} color="#38a169" />
            <Text style={[styles.quickActionText, isDarkMode && styles.darkText]}>AI Ops SOC</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. UNIQUE 4-SPHERE SEGMENTED NAVIGATION */}
      <View style={[styles.segmentedBar, isDarkMode && styles.darkSegmentedBar]}>
        {['COMMAND', 'CONNECT', 'CREATE', 'SECURE'].map((sphere) => {
          const isActive = activeSphere === sphere;
          return (
            <TouchableOpacity 
              key={sphere} 
              style={[styles.segmentButton, isActive && styles.activeSegmentButton, isDarkMode && isActive && { backgroundColor: '#4a5568' }]}
              onPress={() => setActiveSphere(sphere)}
            >
              <Text style={[styles.segmentText, isActive && styles.activeSegmentText, isDarkMode && styles.darkText]} numberOfLines={1}>
                {sphere}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. DYNAMIC SPHERE GRID CONTENT */}
      <View style={styles.gridContainer}>
        
        {activeSphere === 'COMMAND' && (
          <View style={styles.rowGrid}>
            <GridTile icon="speedometer-outline" title="Admin Panel" color="#3182ce" onPress={() => navigation.navigate('AdminControl')} isDarkMode={isDarkMode} />
            <GridTile icon="hardware-chip-outline" title="AI Supervisor" color="#38a169" onPress={() => navigation.navigate('GlobalAISupervisor')} isDarkMode={isDarkMode} />
            <GridTile icon="wallet-outline" title="Treasury Escrow" color="#16a34a" onPress={() => navigation.navigate('MonetizationTreasury')} isDarkMode={isDarkMode} />
            <GridTile icon="stats-chart-outline" title="Analytics Hub" color="#d97706" onPress={() => navigation.navigate('Analytics')} isDarkMode={isDarkMode} />
            <GridTile icon="notifications-outline" title="Notifications" color="#805ad5" onPress={() => navigation.navigate('Notifications')} isDarkMode={isDarkMode} />
            <GridTile icon="compass-outline" title="Discovery Feed" color="#007AFF" onPress={() => navigation.navigate('Discovery')} isDarkMode={isDarkMode} />
            <GridTile icon="person-outline" title="My Profile" color="#319795" onPress={() => navigation.navigate('Profile')} isDarkMode={isDarkMode} />
            <GridTile icon="settings-outline" title="App Settings" color="#4a5568" onPress={() => navigation.navigate('Settings')} isDarkMode={isDarkMode} />
          </View>
        )}

        {activeSphere === 'CONNECT' && (
          <View style={styles.rowGrid}>
            <GridTile icon="chatbubbles-outline" title="Direct Chats" color="#007AFF" onPress={() => navigation.navigate('ChatRoom')} isDarkMode={isDarkMode} />
            <GridTile icon="people-outline" title="Communities" color="#2563eb" onPress={() => navigation.navigate('GroupList')} isDarkMode={isDarkMode} />
            <GridTile icon="tv-outline" title="Church Fellowship" color="#16a34a" onPress={() => navigation.navigate('ChurchLiveScreen')} isDarkMode={isDarkMode} />
            <GridTile icon="sparkles-outline" title="Testimonies & Praise" color="#9333ea" onPress={() => navigation.navigate('ChurchTestimonies')} isDarkMode={isDarkMode} />
            <GridTile icon="business-outline" title="Church Request" color="#ca8a04" onPress={() => navigation.navigate('ChurchRegistration')} isDarkMode={isDarkMode} />
            <GridTile icon="videocam-outline" title="Live Streams" color="#e53e3e" onPress={() => navigation.navigate('LiveStream')} isDarkMode={isDarkMode} />
          </View>
        )}

        {activeSphere === 'CREATE' && (
          <View style={styles.rowGrid}>
            <GridTile icon="film-outline" title="Short Reels" color="#d97706" onPress={() => navigation.navigate('Reels')} isDarkMode={isDarkMode} />
            <GridTile icon="aperture-outline" title="Multi-Camera Hub" color="#dc2626" onPress={() => navigation.navigate('CameraHub')} isDarkMode={isDarkMode} />
            <GridTile icon="desktop-outline" title="Virtual TV" color="#3182ce" onPress={() => navigation.navigate('VirtualTVScreen')} isDarkMode={isDarkMode} />
            <GridTile icon="mic-outline" title="Audio Studio" color="#805ad5" onPress={() => navigation.navigate('Studio')} isDarkMode={isDarkMode} />
            <GridTile icon="film-outline" title="Virtual Cinema" color="#e53e3e" onPress={() => navigation.navigate('Cinema')} isDarkMode={isDarkMode} />
            <GridTile icon="game-controller-outline" title="In-Chat Games" color="#9333ea" onPress={() => navigation.navigate('InteractiveGames')} isDarkMode={isDarkMode} />
            <GridTile icon="trophy-outline" title="Game Arena" color="#d97706" onPress={() => navigation.navigate('GameArena')} isDarkMode={isDarkMode} />
          </View>
        )}

        {activeSphere === 'SECURE' && (
          <View style={styles.rowGrid}>
            <GridTile icon="radio-outline" title="Zero-Net Mesh" color="#319795" onPress={() => navigation.navigate('MeshHub')} isDarkMode={isDarkMode} />
            <GridTile icon="globe-outline" title="AI Interpreter" color="#805ad5" onPress={() => navigation.navigate('Interpreter')} isDarkMode={isDarkMode} />
            <GridTile icon="shield-outline" title="DRM Protection" color="#2b6cb0" onPress={() => navigation.navigate('DRMHub')} isDarkMode={isDarkMode} />
            <GridTile icon="gift-outline" title="QR & Referrals" color="#d69e2e" onPress={() => navigation.navigate('Referrals')} isDarkMode={isDarkMode} />
            <GridTile icon="shield-checkmark-outline" title="Security Hub" color="#38a169" onPress={() => navigation.navigate('SecurityHub')} isDarkMode={isDarkMode} />
            <GridTile icon="wallet-outline" title="Coin Wallet" color="#16a34a" onPress={() => navigation.navigate('Wallet')} isDarkMode={isDarkMode} />
          </View>
        )}

      </View>

    </ScrollView>
  );
}

function GridTile({ icon, title, color, onPress, isDarkMode }) {
  return (
    <TouchableOpacity style={[styles.tileBox, isDarkMode && styles.darkCard]} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.tileTitle, isDarkMode && styles.darkText]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', padding: 12 },
  darkContainer: { backgroundColor: '#1a202c' },
  statusCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  statusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusLabel: { fontSize: 12, fontWeight: 'bold', color: '#4a5568' },
  balanceAmount: { fontSize: 20, fontWeight: 'bold', color: '#1a202c', marginVertical: 4 },
  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, marginTop: 4 },
  quickActionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  quickActionText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  actionDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0' },
  segmentedBar: { flexDirection: 'row', backgroundColor: '#edf2f7', borderRadius: 10, padding: 4, marginBottom: 15 },
  darkSegmentedBar: { backgroundColor: '#2d3748' },
  segmentButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeSegmentButton: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 10, fontWeight: 'bold', color: '#718096' },
  activeSegmentText: { color: '#007AFF' },
  gridContainer: { marginBottom: 20 },
  rowGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  tileBox: { width: '31%', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  tileTitle: { fontSize: 11, fontWeight: '600', color: '#2d3748', textAlign: 'center' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  darkText: { color: '#fff' },
});