import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Audio, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LiveStudioModule({
  isDarkMode,
  onClose,
  onPublishMedia,
}) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState('front');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedUri, setCapturedUri] = useState(null);

  // 🌟 Studio Glamour Filter States
  const [selectedFilter, setSelectedFilter] = useState('Super Diamond Glow 💎');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [beautyMode, setBeautyMode] = useState(true); 
  const [studioLightBoost, setStudioLightBoost] = useState(true); 

  // 🌟 International Broadcast Additions
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownCount, setCountdownCount] = useState(3);

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Tours');

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
      
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (e) {
        console.log('Audio mode init warning:', e);
      }
    })();
  }, []);

  // Recording Timer Effect
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Countdown Handler
  useEffect(() => {
    let countTimer;
    if (countdownActive && countdownCount > 0) {
      countTimer = setTimeout(() => {
        setCountdownCount(prev => prev - 1);
      }, 1000);
    } else if (countdownActive && countdownCount === 0) {
      setCountdownActive(false);
      setCountdownCount(3);
      executeStartRecording();
    }
    return () => clearTimeout(countTimer);
  }, [countdownActive, countdownCount]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedUri(result.assets[0].uri);
        if (result.assets[0].duration) {
          setRecordingSeconds(Math.floor(result.assets[0].duration / 1000));
        } else {
          setRecordingSeconds(15);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open device library.');
    }
  };

  const triggerRecordingSequence = () => {
    if (!isCameraReady) {
      Alert.alert('Camera Initializing', 'Please wait a second for the camera hardware to stabilize.');
      return;
    }
    setCountdownActive(true);
  };

  const executeStartRecording = async () => {
    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'Camera reference not ready. Opening gallery instead.');
      handlePickFromGallery();
      return;
    }
    try {
      setIsRecording(true);
      // 🌟 Pass explicit options to prevent Android native codec unknown error crashes
      const data = await cameraRef.current.recordAsync({
        maxDuration: 180,
        quality: '4:3',
        mute: false,
      });
      if (data && data.uri) {
        setCapturedUri(data.uri);
      }
    } catch (error) {
      console.log('Recording error details:', error);
      setIsRecording(false);
      Alert.alert(
        'Recording Error', 
        'Native video recording failed on this device hardware. Would you like to select a pre-recorded tour video from your gallery instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Gallery 📁', onPress: handlePickFromGallery }
        ]
      );
    } finally {
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const getGlamourTintStyle = (filterName) => {
    switch (filterName) {
      case 'Super Diamond Glow 💎': 
        return { backgroundColor: 'rgba(220, 240, 255, 0.40)' };
      case 'Porcelain Radiance ✨': 
        return { backgroundColor: 'rgba(255, 210, 230, 0.40)' };
      case 'TikTok Ultra Flawless 🌸': 
        return { backgroundColor: 'rgba(255, 230, 190, 0.40)' };
      case 'Hollywood Ring Light 💡': 
        return { backgroundColor: 'rgba(255, 255, 255, 0.48)' };
      case 'Golden Hour Luxury 🌅': 
        return { backgroundColor: 'rgba(255, 150, 50, 0.35)' };
      case 'B&W Cinematic 🖤': 
        return { backgroundColor: 'rgba(20, 20, 20, 0.70)' };
      default: 
        return { backgroundColor: 'rgba(255,255,255,0.25)' };
    }
  };

  if (!cameraPermission || !micPermission || !cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.permissionBox}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>Camera & Microphone Access</Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubText]}>
            Hardware permissions are required for the live studio glamour suite.
          </Text>
          <TouchableOpacity 
            style={styles.grantBtn} 
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Text style={styles.grantBtnText}>Grant Hardware Permissions 🔓</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.grantBtn, { backgroundColor: '#38a169', marginTop: 8 }]} onPress={handlePickFromGallery}>
            <Text style={styles.grantBtnText}>📁 Pick Video from Gallery Instead</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {!capturedUri ? (
        <View style={styles.cameraWrapper}>
          <CameraView 
            style={styles.absoluteCamera} 
            facing={facing} 
            ref={cameraRef} 
            mode="video"
            onCameraReady={() => setIsCameraReady(true)}
          >
            <View />
          </CameraView>

          <View 
            style={[
              styles.forcedGlowOverlay, 
              getGlamourTintStyle(selectedFilter),
              beautyMode && { opacity: 0.95 },
              Platform.OS === 'web' && { backdropFilter: 'brightness(1.5) contrast(1.2) saturate(1.1)' }
            ]} 
            pointerEvents="none" 
          />

          {studioLightBoost && (
            <View style={styles.ringLightBorderFrame} pointerEvents="none" />
          )}

          {countdownActive && (
            <View style={styles.countdownOverlay} pointerEvents="none">
              <Text style={styles.countdownNumber}>{countdownCount}</Text>
            </View>
          )}

          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>

            {isRecording && (
              <View style={styles.timerBadge}>
                <View style={styles.redDot} />
                <Text style={styles.timerText}>
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.utilityIconBtn} onPress={handlePickFromGallery}>
                <Text style={{ fontSize: 16 }}>📁</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityIconBtn} onPress={() => setShowFiltersDrawer(!showFiltersDrawer)}>
                <Text style={{ fontSize: 16 }}>✨</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityIconBtn} onPress={toggleCameraFacing}>
                <Text style={{ fontSize: 16 }}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activeFilterPillBadge}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>✨ {selectedFilter} Active</Text>
          </View>

          {showFiltersDrawer && (
            <View style={styles.filterDrawer}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>💎 SELECT STUDIO GLAMOUR FILTER:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {['Super Diamond Glow 💎', 'Porcelain Radiance ✨', 'TikTok Ultra Flawless 🌸', 'Hollywood Ring Light 💡', 'Golden Hour Luxury 🌅', 'B&W Cinematic 🖤'].map(flt => (
                  <TouchableOpacity
                    key={flt}
                    style={[styles.filterChip, selectedFilter === flt && styles.activeFilterChip]}
                    onPress={() => setSelectedFilter(flt)}
                  >
                    <Text style={[styles.filterChipText, selectedFilter === flt && { color: '#fff' }]}>{flt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                <TouchableOpacity 
                  style={[styles.beautyToggleBtn, beautyMode && { backgroundColor: '#ed64a6', flex: 1 }]}
                  onPress={() => setBeautyMode(!beautyMode)}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                    💖 Blemish Blur: {beautyMode ? 'ON 🚀' : 'OFF'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.beautyToggleBtn, studioLightBoost && { backgroundColor: '#3182ce', flex: 1 }]}
                  onPress={() => setStudioLightBoost(!studioLightBoost)}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                    💡 Ring Light: {studioLightBoost ? 'ON 🚀' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bottomControls}>
            {!isRecording ? (
              <TouchableOpacity style={styles.shutterOuter} onPress={triggerRecordingSequence}>
                <View style={styles.shutterInnerRecord} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.shutterOuter} onPress={handleStopRecording}>
                <View style={styles.shutterInnerStop} />
              </TouchableOpacity>
            )}
            <Text style={styles.shutterLabel}>
              {isCameraReady ? 'Tap to Record Glamour Stream' : 'Initializing Camera... ⏳'}
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.studioContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.studioTitle, isDarkMode && styles.darkText]}>🎥 Studio Publishing Suite</Text>
          <Text style={[styles.studioSub, isDarkMode && styles.darkSubText]}>Configure your flawless tour before broadcasting.</Text>

          <View style={styles.videoPreviewWrapper}>
            <Video
              source={{ uri: capturedUri }}
              style={styles.previewVideoPlayer}
              useNativeControls
              resizeMode="cover"
              isLooping
              shouldPlay
            />
            <View style={styles.filterAppliedBadge}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>✨ {selectedFilter}</Text>
            </View>
          </View>

          <Text style={[styles.label, isDarkMode && styles.darkText, { marginTop: 15 }]}>Video Caption / Title</Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="e.g. 🐘 Bwindi Mountain Gorilla Expedition..."
            placeholderTextColor="#a0aec0"
            value={caption}
            onChangeText={setCaption}
            multiline
          />

          <Text style={[styles.label, isDarkMode && styles.darkText]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {['Tours', 'Wildlife', 'Football', 'Music', 'Tech'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.activeCatChip]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.publishBtn}
            onPress={() => {
              onPublishMedia({
                uri: capturedUri,
                caption,
                category,
                filter: selectedFilter,
                duration: `${Math.floor(recordingSeconds / 60)}:${recordingSeconds % 60 < 10 ? '0' : ''}${recordingSeconds % 60} Min Tour`,
              });
            }}
          >
            <Text style={styles.publishBtnText}>🚀 Publish to Discovery Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retakeBtn} onPress={() => setCapturedUri(null)}>
            <Text style={styles.retakeBtnText}>🔄 Choose Different Media</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkContainer: { backgroundColor: '#1a202c' },
  cameraWrapper: { flex: 1, width: '100%', height: '100%', position: 'relative' },
  absoluteCamera: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  forcedGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  ringLightBorderFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 18,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 11,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeFilterPillBadge: {
    position: 'absolute',
    top: 105,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 20 },
  darkText: { color: '#fff' },
  darkSubText: { color: '#a0aec0' },
  grantBtn: { backgroundColor: '#3182ce', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginBottom: 12, width: '100%', alignItems: 'center' },
  grantBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { padding: 8, marginTop: 10 },
  cancelBtnText: { color: '#e53e3e', fontWeight: 'bold' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, zIndex: 40 },
  closeBtn: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  closeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(229, 62, 62, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  timerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  utilityIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  filterDrawer: { position: 'absolute', top: 145, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.92)', padding: 12, borderRadius: 12, width: SCREEN_WIDTH * 0.92, zIndex: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  filterChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  activeFilterChip: { backgroundColor: '#3182ce' },
  filterChipText: { color: '#cbd5e0', fontSize: 11, fontWeight: 'bold' },
  beautyToggleBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 8, alignItems: 'center' },
  bottomControls: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center', zIndex: 40 },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  shutterInnerRecord: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e53e3e' },
  shutterInnerStop: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#e53e3e' },
  shutterLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  studioContainer: { padding: 20, paddingTop: 60, maxWidth: 600, width: '100%', alignSelf: 'center' },
  studioTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  studioSub: { fontSize: 13, color: '#718096', marginBottom: 20 },
  videoPreviewWrapper: { width: '100%', height: 260, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#cbd5e0' },
  previewVideoPlayer: { width: '100%', height: '100%' },
  filterAppliedBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, zIndex: 10 },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#4a5568' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 16, height: 80, textAlignVertical: 'top' },
  darkInput: { backgroundColor: '#2d3748', borderColor: '#4a5568', color: '#fff' },
  catChip: { backgroundColor: '#edf2f7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, height: 36 },
  activeCatChip: { backgroundColor: '#3182ce' },
  catText: { fontSize: 12, fontWeight: 'bold', color: '#4a5568' },
  activeCatText: { color: '#fff' },
  publishBtn: { backgroundColor: '#38a169', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 12 },
  publishBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  retakeBtn: { padding: 12, alignItems: 'center' },
  retakeBtnText: { color: '#e53e3e', fontWeight: 'bold', fontSize: 13 },
});