import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';

export default function DiscoveryQuickActionsModal({
  isDarkMode,
  // 1. Post Settings Modal
  postSettingsVisible,
  setPostSettingsVisible,
  selectedPost,
  handleRepostVideo,
  handleOpenBoostModal,
  handleSaveToVault,
  handleDeletePost,
  // 2. Boost Modal
  boostModalVisible,
  setBoostModalVisible,
  handleExecuteBoostPost,
  // 3. AI Caption Modal
  aiCaptionModalVisible,
  setAiCaptionModalVisible,
  rawCreatorInput,
  setRawCreatorInput,
  handleGenerateAiCaption,
  generatedAiCaption,
  // 4. Tip Modal
  tipModalVisible,
  setTipModalVisible,
  creatorWalletBalance,
  selectedTipAmount,
  setSelectedTipAmount,
  handleExecuteTip,
  // 5. Long Press Modal
  longPressModalVisible,
  setLongPressModalVisible,
  handleDownloadMedia,
  handleWindVideo,
  handleCopyLink,
  // 6. Forward Modal
  forwardModalVisible,
  setForwardModalVisible,
  handleExecuteForward,
}) {
  return (
    <>
      {/* 1. POST SETTINGS MODAL */}
      <Modal visible={postSettingsVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setPostSettingsVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>⚙️ Post Settings & Creator Actions</Text>
              <TouchableOpacity onPress={() => setPostSettingsVisible(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.optionRow} onPress={() => handleRepostVideo(selectedPost)}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>🔄 Repost Video to Timeline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => handleOpenBoostModal()}>
              <Text style={[styles.optionText, { color: '#3182ce' }]}>🚀 Boost / Promote Post</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => { setPostSettingsVisible(false); handleSaveToVault(selectedPost); }}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>⭐ Save to Offline Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0 }]} onPress={() => handleDeletePost(selectedPost?.id)}>
              <Text style={[styles.optionText, { color: '#e53e3e' }]}>🗑️ Delete Post Permanently</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* 2. BOOST PAYMENT MODAL */}
      <Modal visible={boostModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setBoostModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 360, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🚀 Boost Post Promotion</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 14 }}>
              Promote "{selectedPost?.author}'s video" across local Kampala mesh relay stations and global feeds.
            </Text>
            <View style={{ backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2d3748' }}>📦 Boost Tier: Regional Mesh (24 Hours)</Text>
              <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold', marginTop: 4 }}>Price: UGX 10,000 (~$2.70)</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleExecuteBoostPost}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Confirm & Pay Boost Fee 💳</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* 3. AI CAPTION ASSISTANT MODAL */}
      <Modal visible={aiCaptionModalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setAiCaptionModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>✨ AI Caption & Smart Hashtag Generator</Text>
            <TextInput
              style={[styles.inputBox, isDarkMode && styles.darkText, { height: 60, marginBottom: 10, width: '100%' }]}
              placeholder="What is your video about? (e.g. Arsenal game highlight or Bwindi gorillas)"
              placeholderTextColor="#a0aec0"
              value={rawCreatorInput}
              onChangeText={setRawCreatorInput}
              multiline={true}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateAiCaption}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>Generate AI Caption 🚀</Text>
            </TouchableOpacity>
            {generatedAiCaption ? (
              <View style={{ marginTop: 12, backgroundColor: '#ebf8ff', padding: 8, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' }}>Result:</Text>
                <Text style={{ fontSize: 11, color: '#2d3748', marginTop: 2 }}>{generatedAiCaption}</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Modal>

      {/* 4. CREATOR WALLET TIP MODAL */}
      <Modal visible={tipModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setTipModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 360, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 4 }]}>🎁 Support Creator ({selectedPost?.author})</Text>
            <Text style={{ fontSize: 10, color: '#3182ce', fontWeight: 'bold', marginBottom: 12 }}>
              Your Creator Wallet Balance: UGX {creatorWalletBalance.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>
              Select a tip amount to deduct from your wallet and deposit directly into the creator's earnings account via escrow:
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              {[1000, 5000, 10000, 20000].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.tipPill, selectedTipAmount === amt && styles.activeTipPill]}
                  onPress={() => setSelectedTipAmount(amt)}
                >
                  <Text style={[styles.tipPillText, selectedTipAmount === amt && { color: '#fff' }]}>UGX {amt.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleExecuteTip}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Send UGX {selectedTipAmount.toLocaleString()} Tip ☕</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* 5. LONG PRESS QUICK ACTIONS MODAL */}
      <Modal visible={longPressModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setLongPressModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 350, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>⚙️ Media Quick Actions</Text>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { setLongPressModalVisible(false); handleDownloadMedia(); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedPost?.allowDownloads === false ? '#a0aec0' : '#3182ce' }}>
                {selectedPost?.allowDownloads === false ? '🛡️ Download Disabled by Creator' : '📥 Download Media to Device'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => { setLongPressModalVisible(false); handleSaveToVault(selectedPost); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>⭐ Save to Offline Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => { setLongPressModalVisible(false); handleWindVideo('forward'); }}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>⏩ Wind Video Forward (+10s)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => { setLongPressModalVisible(false); handleWindVideo('backward'); }}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>⏪ Wind Video Backward (-10s)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => { setLongPressModalVisible(false); handleCopyLink(); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>📋 Copy Secure Media Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0 }]} onPress={() => { setLongPressModalVisible(false); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e53e3e' }}>⚠️ Report Content</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* 6. FORWARD / SHARE MODAL */}
      <Modal visible={forwardModalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setForwardModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🌐 International Forward & Share</Text>
              <TouchableOpacity onPress={() => setForwardModalVisible(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.optionRow} onPress={() => handleExecuteForward('Global Chat Inbox')}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>💬 Forward to Active Chat Inbox</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow} onPress={() => handleExecuteForward('International Mesh Relay')}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>🛰️ Broadcast to International Mesh Network</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow} onPress={() => handleExecuteForward('Virtual TV Watch Party')}>
              <Text style={[styles.optionText, isDarkMode && styles.darkText]}>📺 Stream in Virtual TV Watch Party</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0 }]} onPress={() => handleExecuteForward('Secure External Clipboard Link')}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>📋 Copy International Secure Link</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, width: '100%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 },
  modalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  optionRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  optionText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  primaryBtn: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  inputBox: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, fontSize: 11, paddingTop: 8 },
  tipPill: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', flex: 1, marginHorizontal: 2, alignItems: 'center' },
  activeTipPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  tipPillText: { fontSize: 10, fontWeight: 'bold', color: '#4a5568' },
});