import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = ['Uploads', 'Vaults', 'Copyright', 'Settings'];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity 
          key={tab}
          style={[styles.tabButton, activeTab === tab && styles.activeTabButton]} 
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === 'Uploads' ? '🎬 Uploads' : tab === 'Vaults' ? '🛡️ Vaults' : tab === 'Copyright' ? '📜 DRM' : '⚙️ Settings'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, padding: 3, marginBottom: 12 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTabButton: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 10, fontWeight: 'bold', color: '#718096' },
  activeTabText: { color: '#3182ce' }
});