import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

export default function QrModal({
  visible,
  onClose,
  isDarkMode,
  profileQrValue,
  username,
  handle,
  country,
  dateOfBirth,
  hideDob,
  phoneNumber,
  hidePhoneNumber
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, isDarkMode && styles.darkCard, { alignItems: 'center' }]}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📇 My Profile & Contact QR</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 16 }}>
            Let friends scan this code to connect with your profile instantly!
          </Text>

          <View style={styles.qrContainerModal}>
            <QRCode
              value={profileQrValue}
              size={170}
              color="#1a202c"
              backgroundColor="#ffffff"
            />
          </View>

          <Text style={[styles.itemTitle, { marginTop: 12 }, isDarkMode && styles.darkText]}>{username || 'New Creator'} ({handle || '@user'})</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
            📍 {country || 'Country not set'} {hideDob || !dateOfBirth ? '' : `• DOB: ${dateOfBirth}`}
          </Text>
          <Text style={{ fontSize: 12, color: '#3182ce', marginTop: 2, marginBottom: 16 }}>
            {hidePhoneNumber || !phoneNumber ? '🔒 Phone number private' : phoneNumber}
          </Text>

          <TouchableOpacity 
            style={[styles.saveBtn, { width: '100%' }]} 
            onPress={async () => {
              await Clipboard.setStringAsync(handle);
              Alert.alert('Handle Copied 📋', `Copied ${handle} to clipboard.`);
            }}
          >
            <Text style={styles.saveBtnText}>Copy Handle 📋</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  qrContainerModal: { padding: 12, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', alignItems: 'center' },
  saveBtn: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});