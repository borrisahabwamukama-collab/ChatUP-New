import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useMeshNetwork } from '../../App';

export default function MeshHubScreen({ isDarkMode }) {
  const {
    meshNodeActive,
    setMeshNodeActive,
    meshPeerCount,
    localChatLog,
    sendMeshPacket,
    lockGhostVault,
  } = useMeshNetwork();

  const [chatInput, setChatInput] = useState('');
  const [vaultKey, setVaultKey] = useState('');
  const [vaultData, setVaultData] = useState('');

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendMeshPacket('You (Borris)', chatInput);
    setChatInput('');
  };

  const handleLockVault = () => {
    if (!vaultKey.trim() || !vaultData.trim()) {
      return Alert.alert('Error', 'Please enter both a vault key and secret data/files to encrypt.');
    }
    const success = lockGhostVault(vaultKey, vaultData);
    if (success) {
      setVaultKey('');
      setVaultData('');
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* Header Banner */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🛰️ Zero-Internet P2P Mesh & Ghost Vaults</Text>
        <Text style={styles.subtitle}>Secure local multi-hop packet forwarding, offline messaging, and encrypted local storage without cell or internet towers.</Text>
      </View>

      {/* Mesh Node Status Card */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: meshNodeActive ? '#38a169' : '#e53e3e', borderWidth: 2 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Multi-Hop Packet Forwarder</Text>
          <TouchableOpacity 
            style={{ backgroundColor: meshNodeActive ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            onPress={() => setMeshNodeActive(!meshNodeActive)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{meshNodeActive ? 'Node ACTIVE 🟢' : 'Node PAUSED 🔴'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: '#38a169', fontWeight: 'bold' }}>Connected Mesh Peers: {meshPeerCount} nearby devices</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>Relaying encrypted packets locally via Bluetooth and Wi-Fi Direct mesh.</Text>
      </View>

      {/* Zero-Internet P2P Local Chat */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💬 Offline Local Mesh Chat & File Share</Text>
        <ScrollView style={{ height: 160, marginBottom: 10, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 8 }}>
          {localChatLog.map(msg => (
            <View key={msg.id} style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{msg.sender}: <Text style={{ fontWeight: 'normal', color: isDarkMode ? '#fff' : '#2d3748' }}>{msg.text}</Text></Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={[styles.chatInput, { flex: 1 }, isDarkMode && styles.darkInput]}
            placeholder="Broadcast to local mesh peers..."
            placeholderTextColor="#a0aec0"
            value={chatInput}
            onChangeText={setChatInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Encrypted Local Ghost Vaults */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#e53e3e', borderWidth: 1 }]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Encrypted Local Ghost Vault</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Lock sensitive text, notes, or media behind zero-knowledge local storage encryption.</Text>
        
        <TextInput
          style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
          placeholder="Vault Key / Master Password..."
          placeholderTextColor="#a0aec0"
          secureTextEntry
          value={vaultKey}
          onChangeText={setVaultKey}
        />
        <TextInput
          style={[styles.chatInput, { height: 70, textAlignVertical: 'top', marginBottom: 8 }, isDarkMode && styles.darkInput]}
          placeholder="Secret data or text payload to lock locally..."
          placeholderTextColor="#a0aec0"
          multiline
          value={vaultData}
          onChangeText={setVaultData}
        />
        <TouchableOpacity style={styles.vaultBtn} onPress={handleLockVault}>
          <Text style={styles.actionBtnText}>Lock & Seal Ghost Vault 🛡️</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendBtn: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, borderRadius: 8, marginLeft: 6 },
  vaultBtn: { backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});