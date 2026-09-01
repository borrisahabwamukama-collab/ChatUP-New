import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch } from 'react-native';

export default function NotificationsScreen({ isDarkMode }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [walletAlerts, setWalletAlerts] = useState(true);

  const [notificationsList] = useState([
    { id: '1', title: 'Live Broadcast Started', desc: 'Borris Ranger Hub went live on Virtual TV: Talk with Nature HD', time: '10m ago', unread: true },
    { id: '2', title: 'Super-Gift Received! 🎉', desc: 'Nimusiima Asifa sent you 250 coins (Leopard Gift)', time: '1h ago', unread: true },
    { id: '3', title: 'New Message', desc: 'Stella sent a message in ChatRoom', time: '3h ago', unread: false },
    { id: '4', title: 'Security Hub Alert', desc: 'Device pairing verified successfully via mesh network', time: 'Yesterday', unread: false },
  ]);

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 40, padding: 12 }}>
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🔔 Notifications & Alerts Hub</Text>
        <Text style={styles.subtitle}>Manage your push alerts, live stream pings, and activity history.</Text>
      </View>

      {/* Alert Toggles */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚙️ Notification Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Virtual TV Live Stream Alerts</Text>
          <Switch value={liveAlerts} onValueChange={setLiveAlerts} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Wallet & Super-Gift Pings</Text>
          <Switch value={walletAlerts} onValueChange={setWalletAlerts} />
        </View>
      </View>

      {/* Recent Activity Stream */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📋 Recent Activity Log</Text>
        {notificationsList.map(item => (
          <View key={item.id} style={[styles.notifItem, item.unread && styles.unreadItem, isDarkMode && styles.darkNotifItem]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.notifTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              <Text style={[styles.notifDesc, isDarkMode && { color: '#cbd5e0' }]}>{item.desc}</Text>
            </View>
          </View>
        ))}
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
  notifItem: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  darkNotifItem: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  unreadItem: { borderLeftWidth: 4, borderLeftColor: '#3182ce' },
  notifTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  notifTime: { fontSize: 10, color: '#718096' },
  notifDesc: { fontSize: 11, color: '#4a5568', marginTop: 2 },
});