import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function NotificationsScreen({ isDarkMode }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [walletAlerts, setWalletAlerts] = useState(true);

  const [notificationsList, setNotificationsList] = useState([
    { id: '1', title: 'Live Broadcast Started', desc: 'Borris Ranger Hub went live on Virtual TV: Talk with Nature HD', time: '10m ago', unread: true },
    { id: '2', title: 'Super-Gift Received! 🎉', desc: 'Nimusiima Asifa sent you 250 coins (Leopard Gift)', time: '1h ago', unread: true },
    { id: '3', title: 'New Message', desc: 'Stella sent a message in ChatRoom', time: '3h ago', unread: false },
    { id: '4', title: 'Security Hub Alert', desc: 'Device pairing verified successfully via mesh network', time: 'Yesterday', unread: false },
  ]);

  // NEW LAYER 1: QUIET HOURS & DND SCHEDULER
  const [dndModeActive, setDndModeActive] = useState(false);
  const [dndScheduleTime, setDndScheduleTime] = useState('10:00 PM - 06:00 AM');

  // NEW LAYER 2: PRIORITY CONTACT FILTERING (VIP ALERTS)
  const [vipOnlyAlerts, setVipOnlyAlerts] = useState(false);
  const [selectedVipGroup, setSelectedVipGroup] = useState('Nimusiima Asifa & Core Team 🌿');

  // NEW LAYER 3: HAPTIC VIBRATION INTENSITY CONFIGURATION
  const [hapticIntensity, setHapticIntensity] = useState('Medium (Balanced 📳)');

  // NEW LAYER 4: NOTIFICATION AUTO-CLEANUP & RETENTION POLICY
  const [autoClearOldAlerts, setAutoClearOldAlerts] = useState(true);
  const [retentionPeriod, setRetentionPeriod] = useState('Keep 7 Days');

  const handleMarkAllAsRead = () => {
    setNotificationsList(prev => prev.map(item => ({ ...item, unread: false })));
    Alert.alert('Inbox Updated 📬', 'All notifications marked as read.');
  };

  const handleClearAllHistory = () => {
    setNotificationsList([]);
    Alert.alert('History Cleared 🗑️', 'All notification logs have been successfully scrubbed.');
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 40, padding: 12 }}>
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🔔 Notifications & Alerts Hub</Text>
        <Text style={styles.subtitle}>Manage your push alerts, live stream pings, and activity history.</Text>
      </View>

      {/* NEW LAYER 1: QUIET HOURS & DND SCHEDULER */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🌙 Quiet Hours & DND Scheduler</Text>
            <Text style={{ fontSize: 11, color: '#718096' }}>Automatically suppress non-urgent notification pings during night hours ({dndScheduleTime}).</Text>
          </View>
          <Switch 
            value={dndModeActive} 
            onValueChange={(val) => {
              setDndModeActive(val);
              Alert.alert('Quiet Hours', val ? '🌙 DND mode active. Alerts will be batched.' : 'DND mode disabled.');
            }} 
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>
      </View>

      {/* NEW LAYER 2: PRIORITY CONTACT FILTERING (VIP ALERTS) */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>⭐ Priority Contact & VIP Filtering</Text>
            <Text style={{ fontSize: 11, color: '#718096' }}>Only vibrate or sound alerts when messages arrive from: <Text style={{ fontWeight: 'bold', color: '#d69e2e' }}>{selectedVipGroup}</Text></Text>
          </View>
          <Switch 
            value={vipOnlyAlerts} 
            onValueChange={(val) => {
              setVipOnlyAlerts(val);
              Alert.alert('VIP Filter', val ? '⭐ Filtering enabled for core team.' : 'All contacts can trigger alerts.');
            }} 
            trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
          />
        </View>
      </View>

      {/* NEW LAYER 3: HAPTIC VIBRATION INTENSITY CONFIGURATION */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 1.5 }]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📳 Haptic Vibration Intensity ({hapticIntensity})</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Choose tactile feedback profile for incoming Super-Gifts and live stream pings:</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {['Light (Subtle 📳)', 'Medium (Balanced 📳)', 'Heavy (Strong Pulse ⚡)', 'Silent (No Vibration 🔇)'].map((profile) => (
            <TouchableOpacity
              key={profile}
              style={[styles.chip, hapticIntensity === profile && styles.activeChip]}
              onPress={() => {
                setHapticIntensity(profile);
                Alert.alert('Haptic Profile', `Tactile feedback updated to: ${profile}`);
              }}
            >
              <Text style={[styles.chipText, hapticIntensity === profile && { color: '#fff' }]}>{profile}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* NEW LAYER 4: NOTIFICATION AUTO-CLEANUP & RETENTION POLICY */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🧹 Auto-Cleanup & Retention ({retentionPeriod})</Text>
            <Text style={{ fontSize: 11, color: '#718096' }}>Automatically delete old notification logs to preserve local device storage.</Text>
          </View>
          <Switch 
            value={autoClearOldAlerts} 
            onValueChange={(val) => {
              setAutoClearOldAlerts(val);
              Alert.alert('Auto-Cleanup', val ? '🧹 7-day alert retention purge active.' : 'Manual cleanup mode active.');
            }} 
            trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
          />
        </View>
      </View>

      {/* Alert Toggles */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚙️ Standard Notification Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Virtual TV Live Stream Alerts</Text>
          <Switch value={liveAlerts} onValueChange={setLiveAlerts} />
        </View>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Wallet & Super-Gift Pings</Text>
          <Switch value={walletAlerts} onValueChange={setWalletAlerts} />
        </View>
      </View>

      {/* Recent Activity Stream */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 0 }]}>📋 Recent Activity Log ({notificationsList.length})</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold' }}>Mark Read ✓</Text>
            </TouchableOpacity>
            <Text style={{ color: '#cbd5e0' }}>•</Text>
            <TouchableOpacity onPress={handleClearAllHistory}>
              <Text style={{ fontSize: 11, color: '#e53e3e', fontWeight: 'bold' }}>Clear All 🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {notificationsList.length > 0 ? (
          notificationsList.map(item => (
            <View key={item.id} style={[styles.notifItem, item.unread && styles.unreadItem, isDarkMode && styles.darkNotifItem]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.notifTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={[styles.notifDesc, isDarkMode && { color: '#cbd5e0' }]}>{item.desc}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', padding: 20, fontStyle: 'italic' }}>No active notifications in your history log.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkCard: { backgroundColor: '#2d3748' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  settingText: { fontSize: 12, color: '#2d3748' },
  chip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  activeChip: { backgroundColor: '#3182ce' },
  chipText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  notifItem: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  darkNotifItem: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  unreadItem: { borderLeftWidth: 4, borderLeftColor: '#3182ce' },
  notifTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  notifTime: { fontSize: 10, color: '#718096' },
  notifDesc: { fontSize: 11, color: '#4a5568', marginTop: 2 },
});