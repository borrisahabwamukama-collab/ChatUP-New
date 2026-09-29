import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function DiscoveryCreatorStudioModal({
  visible,
  onClose,
  isDarkMode,
  mediaSourceType,
  setMediaSourceType,
  handleOpenRecorder,
  handlePickFileFromDevice,
  capturedMediaUri,
  selectedFilter,
  setSelectedFilter,
  audioTrack,
  setAudioTrack,
  newPostCategory,
  setNewPostCategory,
  newPostCaption,
  setNewPostCaption,
  handlePublishCreatorVideo,
}) {
  // Advanced Studio State enhancements
  const [aspectRatio, setAspectRatio] = useState('9:16 Vertical');
  const [brightnessLevel, setBrightnessLevel] = useState(50);
  const [saturationLevel, setSaturationLevel] = useState(75);
  const [allowDownloadsToggle, setAllowDownloadsToggle] = useState(true);
  const [aiAutoTagActive, setAiAutoTagActive] = useState(true);

  // New Standard Studio Professional Features
  const [selectedThumbnail, setSelectedThumbnail] = useState('Frame 1 (Start 0:00)');
  const [locationTag, setLocationTag] = useState('Kampala, Uganda');
  const [privacyAudience, setPrivacyAudience] = useState('Public (Mesh Relay) 🌍');
  const [schedulePublish, setSchedulePublish] = useState('Publish Immediately ⚡');
  const [liveCameraPreset, setLiveCameraPreset] = useState('Cinematic Pro 🎬');

  const handleGenerateAiCaptionInStudio = () => {
    const smartTags = newPostCategory === 'Wildlife' ? ' 🐘 #BwindiGorillas #UgandaWildlife' : ' 🦁 #PearlOfAfrica #ExploreUganda';
    setNewPostCaption(prev => prev ? prev + smartTags : `🔥 [AI Optimized Tour]: Exploring regional heritage & biodiversity!${smartTags}`);
  };

  const applyAiSmartTags = (tagType) => {
    const tags = {
      Wildlife: ' 🐘 #BwindiGorillas #UgandaWildlife #Conservation',
      Tours: ' 🦁 #PearlOfAfrica #ExploreUganda #Safaris',
      Football: ' ⚽ #PremierLeague #Arsenal #ManCity',
      Tech: ' 💻 #ChatUpTech #Supabase #ReactNative',
    };
    if (aiAutoTagActive) {
      setNewPostCaption(prev => prev + (tags[tagType] || ' #ChatUpCreator'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={[styles.modalContent, isDarkMode && styles.darkCard, { height: '94%' }]} onPress={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🎬 Professional Creator Studio & Grading Suite</Text>
                <Text style={{ fontSize: 9, color: '#718096' }}>H.264 Multimodal Adaptive Encoding & Secure Mesh Publishing</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
              
              {/* Source Selector & Quick Camera Opener */}
              <View style={{ flexDirection: 'row', marginBottom: 12, gap: 6 }}>
                <TouchableOpacity 
                  style={[styles.sourceTabBtn, mediaSourceType === 'camera' && styles.activeSourceTab]}
                  onPress={() => {
                    setMediaSourceType('camera');
                    handleOpenRecorder();
                  }}
                >
                  <Text style={[styles.sourceTabText, mediaSourceType === 'camera' && { color: '#fff' }]}>🔴 Record Live Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sourceTabBtn, mediaSourceType === 'upload' && styles.activeSourceTab]}
                  onPress={() => {
                    setMediaSourceType('upload');
                    handlePickFileFromDevice();
                  }}
                >
                  <Text style={[styles.sourceTabText, mediaSourceType === 'upload' && { color: '#fff' }]}>📁 Upload File</Text>
                </TouchableOpacity>
              </View>

              {/* Aspect Ratio Selector Bar */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#4a5568' }}>📐 Output Aspect Ratio:</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {['9:16 Vertical', '16:9 Cinematic', '1:1 Square'].map(ratio => (
                    <TouchableOpacity
                      key={ratio}
                      style={[styles.ratioPill, aspectRatio === ratio && styles.activeRatioPill]}
                      onPress={() => setAspectRatio(ratio)}
                    >
                      <Text style={[styles.ratioPillText, aspectRatio === ratio && { color: '#fff' }]}>{ratio.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Studio Viewfinder Preview + Quick Retake Button */}
              <View style={styles.studioViewfinder}>
                {Platform.OS === 'web' ? (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <video src={capturedMediaUri || 'https://www.w3schools.com/html/mov_bbb.mp4'} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <Video
                    source={{ uri: capturedMediaUri || 'https://www.w3schools.com/html/mov_bbb.mp4' }}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay={false}
                  />
                )}
                <TouchableOpacity 
                  style={styles.viewfinderRetakeBtn}
                  onPress={handleOpenRecorder}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🔄 Retake Video</Text>
                </TouchableOpacity>
              </View>

              {/* Live Camera Filter Presets Selection */}
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 4 }]}>🌟 Super-Advanced Live Recording Preset</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {['Cinematic Pro 🎬', 'Safari Wildlife 🦁', 'Warm Sunset 🌅', 'HDR Ultra 🌟', 'Matrix Mono 🎞️'].map(preset => (
                  <TouchableOpacity 
                    key={preset}
                    style={[styles.editPill, liveCameraPreset === preset && styles.activeEditPill]}
                    onPress={() => setLiveCameraPreset(preset)}
                  >
                    <Text style={[styles.editPillText, liveCameraPreset === preset && { color: '#fff' }]}>{preset}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Thumbnail / Cover Frame Selector */}
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 4 }]}>🖼️ Select Cover Thumbnail Frame</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {['Frame 1 (Start 0:00)', 'Frame 2 (Quarter)', 'Frame 3 (Midpoint)', 'Custom Image'].map(thumb => (
                  <TouchableOpacity 
                    key={thumb}
                    style={[styles.editPill, selectedThumbnail === thumb && styles.activeEditPill]}
                    onPress={() => setSelectedThumbnail(thumb)}
                  >
                    <Text style={[styles.editPillText, selectedThumbnail === thumb && { color: '#fff' }]}>{thumb}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color Grading Matrix Adjustments */}
              <View style={styles.gradingCard}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 4 }]}>🎛️ Pro Color Matrix & Exposure</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, color: '#718096' }}>Brightness Exposure: +{brightnessLevel}%</Text>
                  <Text style={{ fontSize: 10, color: '#718096' }}>Color Saturation: {saturationLevel}%</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => setBrightnessLevel(prev => Math.min(100, prev + 10))}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2b6cb0' }}>☀️ Increase Exposure</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => setSaturationLevel(prev => Math.min(100, prev + 10))}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2b6cb0' }}>🎨 Boost Saturation</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filters & Presets */}
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>🎨 Cinematic Filters & Presets</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {['Cinematic 🎬', 'Wildlife Nature 🌿', 'Vibrant Sunset 🌅', 'High Contrast 🔥', 'B&W Vintage 🎞️', 'HDR Pro 🌟'].map(filter => (
                  <TouchableOpacity 
                    key={filter}
                    style={[styles.editPill, selectedFilter === filter && styles.activeEditPill]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[styles.editPillText, selectedFilter === filter && { color: '#fff' }]}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Audio Sound FX Mixer */}
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>🎵 Studio Sound FX & Audio Track Mixer</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['Original Field Audio 🎵', 'Ambient Forest Sound 🌳', 'Acoustic Guitar Jam 🎸', 'Kampala Beats 🥁', 'Cinematic Drone Pad 🎶'].map(audio => (
                  <TouchableOpacity 
                    key={audio}
                    style={[styles.editPill, audioTrack === audio && styles.activeEditPill]}
                    onPress={() => setAudioTrack(audio)}
                  >
                    <Text style={[styles.editPillText, audioTrack === audio && { color: '#fff' }]}>{audio}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category Selector */}
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 }}>Select Target Feed Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['Tours', 'Wildlife', 'Football', 'Music', 'Tech'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterPill, newPostCategory === cat && styles.activeFilterPill]}
                    onPress={() => {
                      setNewPostCategory(cat);
                      applyAiSmartTags(cat);
                    }}
                  >
                    <Text style={[styles.filterPillText, newPostCategory === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Location Tagging */}
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 }}>📍 Geofence & Location Tag:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {['Kampala, Uganda', 'Bwindi Impenetrable Park', 'Source of the Nile, Jinja', 'Queen Elizabeth Park'].map(loc => (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.editPill, locationTag === loc && styles.activeEditPill]}
                    onPress={() => setLocationTag(loc)}
                  >
                    <Text style={[styles.editPillText, locationTag === loc && { color: '#fff' }]}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Caption Box + AI Optimizer */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4a5568' }}>📝 Description & Telemetry:</Text>
                <TouchableOpacity style={styles.aiCaptionHelperBtn} onPress={handleGenerateAiCaptionInStudio}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#805ad5' }}>✨ AI Auto-Optimize Caption</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.commentInputBox, isDarkMode && styles.darkText, { height: 75, marginBottom: 10, width: '100%', paddingTop: 8 }]}
                placeholder="Write professional description & add tags..."
                placeholderTextColor="#a0aec0"
                value={newPostCaption}
                onChangeText={setNewPostCaption}
                multiline={true}
              />

              {/* Privacy & Audience Visibility */}
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 }}>👥 Audience & Privacy Setting:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['Public (Mesh Relay) 🌍', 'Followers Only 👥', 'Private Draft 🔒'].map(aud => (
                  <TouchableOpacity
                    key={aud}
                    style={[styles.editPill, privacyAudience === aud && styles.activeEditPill]}
                    onPress={() => setPrivacyAudience(aud)}
                  >
                    <Text style={[styles.editPillText, privacyAudience === aud && { color: '#fff' }]}>{aud}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Scheduled Publishing */}
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 }}>⏰ Publishing Schedule:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['Publish Immediately ⚡', 'Schedule for Peak Hours (18:00)', 'Save as Draft'].map(sch => (
                  <TouchableOpacity
                    key={sch}
                    style={[styles.editPill, schedulePublish === sch && styles.activeEditPill]}
                    onPress={() => setSchedulePublish(sch)}
                  >
                    <Text style={[styles.editPillText, schedulePublish === sch && { color: '#fff' }]}>{sch}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Privacy & Download Security Toggles */}
              <View style={styles.toggleRowCard}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>🛡️ Allow Peer Downloads & Offline Vaults</Text>
                  <Text style={{ fontSize: 9, color: '#718096' }}>Permit other regional peers to save this video for offline viewing.</Text>
                </View>
                <Switch 
                  value={allowDownloadsToggle} 
                  onValueChange={setAllowDownloadsToggle} 
                  trackColor={{ false: '#cbd5e0', true: '#3182ce' }} 
                />
              </View>

              <View style={styles.toggleRowCard}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>✨ AI Smart Hashtag Optimizer</Text>
                  <Text style={{ fontSize: 9, color: '#718096' }}>Automatically attach regional trending telemetry.</Text>
                </View>
                <Switch 
                  value={aiAutoTagActive} 
                  onValueChange={setAiAutoTagActive} 
                  trackColor={{ false: '#cbd5e0', true: '#805ad5' }} 
                />
              </View>

              {/* Publish Button */}
              <TouchableOpacity style={[styles.connectRadarBtn, { padding: 14, marginTop: 10, marginBottom: 20 }]} onPress={handlePublishCreatorVideo}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>🚀 Publish Verified Media Tour to Supabase Feed</Text>
              </TouchableOpacity>

            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, width: '100%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 },
  modalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  sourceTabBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#edf2f7', alignItems: 'center', borderRadius: 6, marginRight: 6 },
  activeSourceTab: { backgroundColor: '#3182ce' },
  sourceTabText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  ratioPill: { backgroundColor: '#edf2f7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  activeRatioPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  ratioPillText: { fontSize: 9, fontWeight: 'bold', color: '#4a5568' },
  studioViewfinder: { height: 180, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden', position: 'relative' },
  viewfinderRetakeBtn: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  gradingCard: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  adjustBtn: { backgroundColor: '#ebf8ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#bee3f8', flex: 1, alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 8 },
  editPill: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  activeEditPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  editPillText: { fontSize: 10, fontWeight: 'bold', color: '#4a5568' },
  filterPill: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginRight: 6 },
  activeFilterPill: { backgroundColor: '#3182ce' },
  filterPillText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  aiCaptionHelperBtn: { backgroundColor: '#faf5ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#e9d8fd' },
  commentInputBox: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, minHeight: 34, maxHeight: 90, fontSize: 11, paddingTop: 8 },
  toggleRowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f7fafc', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  connectRadarBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 4, alignItems: 'center' },
});