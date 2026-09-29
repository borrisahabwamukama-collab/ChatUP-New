import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';

export default function SecurityModal({
  showSecurityModal,
  setShowSecurityModal,
  showSeedPhraseModal,
  setShowSeedPhraseModal,
  showForgotModal,
  setShowForgotModal,
  isDarkMode,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordUpdate,
  recoverySeedPhrase,
  copySeedPhrase,
  recoveryInputKey,
  setRecoveryInputKey,
  handleRestoreAccountWithSeed
}) {
  return (
    <>
      {/* Change Password Modal */}
      <Modal visible={showSecurityModal} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSecurityModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔐 Update Master Passcode</Text>
              <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Passcode</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              secureTextEntry
              placeholder="Enter current password..."
              placeholderTextColor="#a0aec0"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.inputLabel}>New Passcode</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              secureTextEntry
              placeholder="Enter new password..."
              placeholderTextColor="#a0aec0"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.inputLabel}>Confirm New Passcode</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              secureTextEntry
              placeholder="Confirm new password..."
              placeholderTextColor="#a0aec0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handlePasswordUpdate}>
              <Text style={styles.saveBtnText}>Update Passcode 🛡️</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Seed Phrase Backup Modal */}
      <Modal visible={showSeedPhraseModal} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSeedPhraseModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { alignItems: 'center' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Recovery Seed Phrase</Text>
              <TouchableOpacity onPress={() => setShowSeedPhraseModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#c53030', textAlign: 'center', marginBottom: 14, fontWeight: 'bold', lineHeight: 16 }}>
              ⚠️ Keep this 12-word seed phrase secret and stored offline!
            </Text>

            <View style={styles.seedPhraseContainer}>
              <Text style={[styles.seedText, isDarkMode && styles.darkText]}>{recoverySeedPhrase}</Text>
            </View>

            <TouchableOpacity style={[styles.saveBtn, { width: '100%', marginTop: 16 }]} onPress={copySeedPhrase}>
              <Text style={styles.saveBtnText}>Copy Seed Phrase 📋</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Account Recovery Modal */}
      <Modal visible={showForgotModal} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowForgotModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔄 Lost Phone Account Recovery</Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12, lineHeight: 16 }}>
              Enter your 12-word zero-knowledge recovery seed phrase below to restore your account.
            </Text>

            <Text style={styles.inputLabel}>12-Word Recovery Seed Phrase</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }, isDarkMode && styles.darkInput]}
              placeholder="Enter your 12-word phrase..."
              placeholderTextColor="#a0aec0"
              value={recoveryInputKey}
              onChangeText={setRecoveryInputKey}
              multiline
            />

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#e53e3e' }]} onPress={handleRestoreAccountWithSeed}>
              <Text style={styles.saveBtnText}>Restore Account Now 🔓</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12, marginBottom: 4 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  saveBtn: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  seedPhraseContainer: { padding: 12, backgroundColor: '#edf2f7', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', alignItems: 'center', marginBottom: 10 },
  seedText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', textAlign: 'center', letterSpacing: 1, lineHeight: 20 },
});