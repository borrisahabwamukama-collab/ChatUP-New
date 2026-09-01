import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

export default function ChurchLiveScreen() {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'prayers' | 'giving'
  const [prayerInput, setPrayerInput] = useState('');
  const [titheAmount, setTitheAmount] = useState('');
  const [prayers, setPrayers] = useState([
    { id: '1', name: 'Brother David', text: 'Praying for healing and strength for my family this week.', count: 12 },
    { id: '2', name: 'Sister Grace', text: 'Praise God for provision! Praying for our upcoming community outreach.', count: 8 },
  ]);

  const handleSendPrayer = () => {
    if (!prayerInput.trim()) return;
    const newPrayer = {
      id: Date.now().toString(),
      name: 'You (Fellowship Member)',
      text: prayerInput.trim(),
      count: 1,
    };
    setPrayers([newPrayer, ...prayers]);
    setPrayerInput('');
    Alert.alert('Prayer Shared 🙏', 'Your prayer request has been lifted up to the community prayer wall.');
  };

  const handleGiveOffering = () => {
    if (!titheAmount || isNaN(titheAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount for tithes or offerings.');
      return;
    }
    Alert.alert(
      'Secure Giving Initiated 🌟',
      `Processing UGX ${titheAmount} securely via mobile money treasury gateway. Thank you for supporting the ministry!`,
      [{ text: 'Proceed', onPress: () => setTitheAmount('') }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Tabs */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'stream' && styles.activeTabButton]}
          onPress={() => setActiveTab('stream')}
        >
          <Text style={[styles.tabText, activeTab === 'stream' && styles.activeTabText]}>Live Service 🎥</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'prayers' && styles.activeTabButton]}
          onPress={() => setActiveTab('prayers')}
        >
          <Text style={[styles.tabText, activeTab === 'prayers' && styles.activeTabText]}>Prayer Wall 🙏</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'giving' && styles.activeTabButton]}
          onPress={() => setActiveTab('giving')}
        >
          <Text style={[styles.tabText, activeTab === 'giving' && styles.activeTabText]}>Tithes & Giving ✨</Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: LIVE STREAM & SERMON NOTES */}
      {activeTab === 'stream' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Simulated Video Player */}
          <View style={styles.videoContainer}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>● LIVE NOW</Text>
            </View>
            <Text style={styles.videoTitle}>Sunday Worship & Word Fellowship</Text>
            <Text style={styles.videoSub}>Ministering: Pastor John • Kampala Sanctuary</Text>
          </View>

          {/* Real-Time Scripture & Notes Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📖 Live Scripture Focus</Text>
            <Text style={styles.scriptureText}>"The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures..."</Text>
            <Text style={styles.scriptureRef}>— Psalm 23:1-2</Text>
          </View>

          {/* Quick Fellowship Encouragement */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💬 Sanctuary Encouragement</Text>
            <Text style={styles.chatNote}>Use the group chat tab to share amens and interact live with fellow believers during the broadcast.</Text>
          </View>
        </ScrollView>
      )}

      {/* TAB 2: PRAYER WALL */}
      {activeTab === 'prayers' && (
        <View style={styles.tabContainer}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.prayerInput}
              placeholder="Share a prayer request or praise report..."
              placeholderTextColor="#94a3b8"
              value={prayerInput}
              onChangeText={setPrayerInput}
              multiline
            />
            <TouchableOpacity style={styles.sendPrayerBtn} onPress={handleSendPrayer}>
              <Text style={styles.sendPrayerBtnText}>Post to Prayer Wall</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.prayerList}>
            {prayers.map((item) => (
              <View key={item.id} style={styles.prayerCard}>
                <Text style={styles.prayerAuthor}>{item.name}</Text>
                <Text style={styles.prayerText}>{item.text}</Text>
                <View style={styles.prayerFooter}>
                  <Text style={styles.prayerCountText}>🙏 {item.count} believers praying</Text>
                  <TouchableOpacity
                    style={styles.prayButton}
                    onPress={() => {
                      setprayers(
                        prayers.map((p) => p.id === item.id ? { ...p, count: p.count + 1 } : p)
                      );
                    }}
                  >
                    <Text style={styles.prayButtonText}>I prayed for this</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* TAB 3: TITHES & GIVING */}
      {activeTab === 'giving' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.givingCard}>
            <Text style={styles.givingHeader}>Support the Ministry 🌟</Text>
            <Text style={styles.givingSub}>
              "Bring all the tithes into the storehouse... and try Me now in this" — Malachi 3:10
            </Text>

            <Text style={styles.label}>Contribution Amount (UGX)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={titheAmount}
              onChangeText={setTitheAmount}
            />

            <TouchableOpacity style={styles.giveBtn} onPress={handleGiveOffering}>
              <Text style={styles.giveBtnText}>Secure Mobile Money Give 💳</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  videoContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    height: 180,
    justifyContent: 'flex-end',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  videoSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  scriptureText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 20,
    marginBottom: 6,
  },
  scriptureRef: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'right',
  },
  chatNote: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  tabContainer: {
    flex: 1,
    padding: 16,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  prayerInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    height: 70,
    fontSize: 13,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendPrayerBtn: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendPrayerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  prayerList: {
    flex: 1,
  },
  prayerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  prayerAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  prayerText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 10,
    lineHeight: 18,
  },
  prayerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  prayerCountText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  prayButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  prayButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
  },
  givingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  givingHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  givingSub: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 13,
    marginBottom: 16,
  },
  giveBtn: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  giveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});