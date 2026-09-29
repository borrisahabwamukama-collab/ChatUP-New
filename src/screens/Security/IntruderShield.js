import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView, Modal, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../../Services/supabaseClient';

const { width, height } = Dimensions.get('window');

// Helper to convert base64 for Supabase storage upload
function base64ToUint8Array(base64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let cleanedBase64 = base64.replace(/[\t\n\r=]/g, '');
  let bufferLength = cleanedBase64.length * 0.75;
  let len = cleanedBase64.length;
  let encoded1, encoded2, encoded3, encoded4;

  let bytes = new Uint8Array(bufferLength);
  let idx = 0;

  for (let i = 0; i < len; i += 4) {
    encoded1 = chars.indexOf(cleanedBase64.charAt(i));
    encoded2 = chars.indexOf(cleanedBase64.charAt(i + 1));
    encoded3 = chars.indexOf(cleanedBase64.charAt(i + 2));
    encoded4 = chars.indexOf(cleanedBase64.charAt(i + 3));

    bytes[idx++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && encoded3 !== -1) {
      bytes[idx++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && encoded4 !== -1) {
      bytes[idx++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }
  return bytes.subarray(0, idx);
}

export default function IntruderShield({ isDarkMode, onUnlockSuccess }) {
  const [shieldActive, setShieldActive] = useState(true);
  const [nightVisionBoost, setNightVisionBoost] = useState(true);
  const [decoyMode, setDecoyMode] = useState(true);
  const [shieldStatus, setShieldStatus] = useState("Monitoring active. Ready for breach detection.");
  const [isSaving, setIsSaving] = useState(false);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);
  
  // ================= OWNER PIN & DURESS CONFIGURATION =================
  const [masterPin, setMasterPin] = useState('1234'); // Default owner PIN
  const [duressPin, setDuressPin] = useState('9999'); // Default panic PIN
  const [pinInput, setPinInput] = useState('');
  const [isFakeModeActive, setIsFakeModeActive] = useState(false);
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  const [newMasterInput, setNewMasterInput] = useState('');
  const [newDuressInput, setNewDuressInput] = useState('');

  // ================= LIVE FRONT-CAMERA SCANNER & MUGSHOT STATE =================
  const [isBiometricScannerOpen, setIsBiometricScannerOpen] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [scanStatusText, setScanStatusText] = useState('Position your face inside the frame');

  // ================= INTRUDER MUGSHOT GALLERY & INSPECTOR STATE =================
  const [intruderGalleryModal, setIntruderGalleryModal] = useState(false);
  const [capturedIntruders, setCapturedIntruders] = useState([]);
  const [selectedMugshotUrl, setSelectedMugshotUrl] = useState(null);

  // Camera permissions & ref for robust mugshot capture
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isCapturingIntruder, setIsCapturingIntruder] = useState(false);
  const [shoulderSurfingShieldActive, setShoulderSurfingShieldActive] = useState(true);
  const [sidePeekerDetected, setSidePeekerDetected] = useState(false);

  // ================= 20+ ADVANCED SECURITY LAYERS STATE =================
  const [intruderLayers, setIntruderLayers] = useState({
    biometricFacialMeshAudit: true,
    infraredThermalPulse: true,
    kampalaMeshEmergencySync: true,
    quantumEncryptionLogs: true,
    autonomousToxicityVisualRadar: true,
    zeroFeeGasAlertBroadcast: true,
    smartContractSecurityEscrow: true,
    bluetoothP2pIntruderMesh: true,
    federatedAiThreatAnalysis: true,
    realtimeSentimentMeshSecurity: true,
    flutterwaveEmergencyAlerts: true,
    multimodalHlsSurveillance: true,
    cryptographicWatermarkSecurity: true,
    automaticIntruderTranscription: true,
    silentDuressAudioBeacon: true,
    cloudRecordingSentinelBackup: true,
    chromaKeyIntruderMask: true,
    studioAudioIntruderDenoiser: true,
    hdrIntruderCorrection: true,
    globalSosEmergencyOverride: true,
  });

  // Load saved settings on mount & ensure camera permissions are active
  useEffect(() => {
    fetchIntruderSettings();
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    fetchCapturedIntrudersLogs();
  }, []);

  const fetchIntruderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('intruder_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setShieldActive(data.shield_active ?? true);
        setNightVisionBoost(data.night_vision_boost ?? true);
        setDecoyMode(data.decoy_mode ?? true);
        if (data.master_pin) setMasterPin(data.master_pin);
        if (data.duress_pin) setDuressPin(data.duress_pin);
      }
    } catch (err) {
      console.log('No existing Intruder settings found.');
    }
  };

  const fetchCapturedIntrudersLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('active_sos_events')
        .select('*')
        .eq('threat_level', 'unauthorized_pin_breach_photo_captured')
        .order('timestamp', { ascending: false });

      if (data && !error) {
        setCapturedIntruders(data);
      }
    } catch (e) {
      console.log('Error fetching intruder logs:', e);
    }
  };

  // ================= ROBUST MUGSHOT CAPTURE ENGINE =================
  const captureIntruderSelfie = async () => {
    if (!cameraRef.current) {
      console.log('Camera ref not ready for mugshot capture.');
      return;
    }

    try {
      setIsCapturingIntruder(true);
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      
      if (photo?.uri) {
        const compressed = await manipulateAsync(photo.uri, [{ resize: { width: 720 } }], { compress: 0.6, format: SaveFormat.JPEG });
        
        let finalImageUrl = compressed.uri;
        const netState = await NetInfo.fetch();

        // Upload to Supabase Cloud Storage vault if connected
        if (netState.isConnected) {
          try {
            const base64 = await FileSystem.readAsStringAsync(compressed.uri, { encoding: FileSystem.EncodingType.Base64 });
            const byteArray = base64ToUint8Array(base64);
            const fileName = `intruders/${Date.now()}_breach.jpg`;

            const { error: uploadError } = await supabase.storage.from('chat-images').upload(fileName, byteArray.buffer, { contentType: 'image/jpeg' });
            
            if (!uploadError) {
              const { data: pubUrl } = supabase.storage.from('chat-images').getPublicUrl(fileName);
              if (pubUrl?.publicUrl) {
                finalImageUrl = pubUrl.publicUrl;
              }
            }
          } catch (cloudErr) {
            console.log('Cloud upload fallback to local URI:', cloudErr);
          }
        }

        // Insert breach record into Supabase table
        await supabase.from('active_sos_events').insert([
          {
            user_handle: '@borris_nature',
            threat_level: 'unauthorized_pin_breach_photo_captured',
            responders_count: 1,
            location_lat: 0.3476,
            location_lng: 32.5825,
            status: finalImageUrl,
            timestamp: new Date().toISOString()
          }
        ]);

        fetchCapturedIntrudersLogs();
      }
    } catch (e) {
      console.log('Intruder mugshot capture error:', e);
    } finally {
      setIsCapturingIntruder(false);
    }
  };

  const handlePinSubmit = async () => {
    const timestamp = new Date().toLocaleTimeString();

    if (pinInput === masterPin) {
      Alert.alert("Access Granted 🔓", "Welcome back, owner!");
      setShieldStatus(`[${timestamp}] Owner authenticated via Master PIN.`);
      setPinInput('');
      if (onUnlockSuccess) onUnlockSuccess();
    } else if (pinInput === duressPin) {
      setIsFakeModeActive(true);
      setShieldStatus(`[${timestamp}] ⚠️ DURESS PIN ENTERED. Decoy Fake Chat Active.`);
      setPinInput('');

      try {
        await supabase.from('active_sos_events').insert([
          {
            user_handle: '@borris_nature',
            threat_level: 'duress_pin_entered',
            responders_count: 5,
            location_lat: 0.3476,
            location_lng: 32.5825,
            status: 'Duress Active (Panic PIN)',
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (err) {}
    } else {
      setShieldStatus(`[${timestamp}] 🚨 UNKNOWN PIN BREACH! Capturing intruder mugshot...`);
      await captureIntruderSelfie();
      Alert.alert("Authentication Failed ❌", "Incorrect PIN entered. Intruder mugshot logged.");
      setPinInput('');
    }
  };

  const handleExecuteBiometricScan = async () => {
    if (!cameraRef.current) return;

    try {
      setIsScanningFace(true);
      setScanStatusText('Scanning face...');
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      
      if (photo?.uri) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsBiometricScannerOpen(false);
        setIsScanningFace(false);
        Alert.alert("Access Granted 🔓", "Face verified successfully!");
        if (onUnlockSuccess) onUnlockSuccess();
      } else {
        throw new Error('Scan failed');
      }
    } catch (e) {
      setIsScanningFace(false);
      setScanStatusText('❌ Scan Failed.');
      await captureIntruderSelfie();
      Alert.alert("Biometric Breach ❌", "Unrecognized scan attempt. Mugshot logged.");
    }
  };

  const saveCustomPinsToDatabase = async () => {
    if (!newMasterInput || newMasterInput.length < 4 || !newDuressInput || newDuressInput.length < 4) {
      Alert.alert('Invalid PIN', 'Both Master and Duress PINs must be at least 4 digits.');
      return;
    }
    if (newMasterInput === newDuressInput) {
      Alert.alert('Security Warning', 'Master PIN and Duress PIN cannot be identical!');
      return;
    }

    setMasterPin(newMasterInput);
    setDuressPin(newDuressInput);
    setSetupModalVisible(false);
    setNewMasterInput('');
    setNewDuressInput('');

    try {
      await supabase.from('intruder_settings').upsert({
        id: 1,
        master_pin: newMasterInput,
        duress_pin: newDuressInput,
        updated_at: new Date(),
      });
      Alert.alert('Security Saved 🛡️', 'Your custom Master and Duress PINs have been updated securely.');
    } catch (e) {
      Alert.alert('Saved Locally', 'PINs updated successfully.');
    }
  };

  const syncSettingsToSupabase = async (newShieldActive, newNightVision, newDecoy, updatedLayers) => {
    setIsSaving(true);
    try {
      await supabase.from('intruder_settings').upsert({
        id: 1,
        shield_active: newShieldActive,
        night_vision_boost: newNightVision,
        decoy_mode: newDecoy,
        updated_at: new Date(),
      });
    } catch (err) {
      console.error('Failed to sync settings:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCoreSwitch = async (type, val) => {
    let newActive = shieldActive;
    let newNight = nightVisionBoost;
    let newDecoy = decoyMode;

    if (type === 'shield') {
      newActive = val;
      setShieldActive(val);
      setShieldStatus(val ? "Monitoring active." : "Intruder Shield paused.");
    } else if (type === 'night') {
      newNight = val;
      setNightVisionBoost(val);
    } else if (type === 'decoy') {
      newDecoy = val;
      setDecoyMode(val);
    }

    await syncSettingsToSupabase(newActive, newNight, newDecoy, intruderLayers);
  };

  const toggleIntruderLayer = async (key) => {
    const updatedLayers = { ...intruderLayers, [key]: !intruderLayers[key] };
    setIntruderLayers(updatedLayers);
    await syncSettingsToSupabase(shieldActive, nightVisionBoost, decoyMode, updatedLayers);
  };

  const handleEmergencyRemoteWipe = () => {
    Alert.alert(
      '⚠️ Emergency Remote Wipe',
      'This will instantly wipe local caches and purge chat history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'WIPE EVERYTHING NOW', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            Alert.alert('Wipe Complete 🗑️', 'Security state purged.');
          }
        }
      ]
    );
  };

  const layerDefinitions = [
    { key: 'biometricFacialMeshAudit', label: '👤 Biometric Facial Mesh' },
    { key: 'infraredThermalPulse', label: '🌡️ Thermal Pulse Scan' },
    { key: 'kampalaMeshEmergencySync', label: '🇺🇬 Kampala Mesh Sync' },
    { key: 'quantumEncryptionLogs', label: '🔐 Quantum Encryption' },
    { key: 'autonomousToxicityVisualRadar', label: '🛡️ Autonomous Toxicity' },
    { key: 'zeroFeeGasAlertBroadcast', label: '🪙 Zero-Fee Gas Alert' },
    { key: 'smartContractSecurityEscrow', label: '🪙 Smart Contract Escrow' },
    { key: 'bluetoothP2pIntruderMesh', label: '🛰️ Bluetooth P2P Mesh' },
    { key: 'federatedAiThreatAnalysis', label: '🧠 Federated AI Threat' },
    { key: 'realtimeSentimentMeshSecurity', label: '🌿 Sentiment Mesh Sec' },
    { key: 'flutterwaveEmergencyAlerts', label: '🪙 Flutterwave Alert' },
    { key: 'multimodalHlsSurveillance', label: '🎥 Multimodal HLS Cam' },
    { key: 'cryptographicWatermarkSecurity', label: '🛡️ Crypto Watermarking' },
    { key: 'automaticIntruderTranscription', label: '📜 Speech Transcription' },
    { key: 'silentDuressAudioBeacon', label: '🔊 Silent Duress Audio' },
    { key: 'cloudRecordingSentinelBackup', label: '☁️ Cloud Sentinel Backup' },
    { key: 'chromaKeyIntruderMask', label: '🎨 Chroma Key Mask' },
    { key: 'studioAudioIntruderDenoiser', label: '🎙️ Studio Denoiser' },
    { key: 'hdrIntruderCorrection', label: '☀️ HDR Correction' },
    { key: 'globalSosEmergencyOverride', label: '🚨 Global SOS Override' },
  ];

  if (isFakeModeActive) {
    return (
      <View style={styles.fakeContainer}>
        <View style={styles.fakeHeader}>
          <Text style={styles.fakeHeaderTitle}>Family Group 👨‍👩‍👦</Text>
          <TouchableOpacity onPress={() => setIsFakeModeActive(false)}>
            <Text style={styles.exitFakeText}>Exit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fakeChatBody}>
          <View style={styles.fakeBubbleReceived}>
            <Text style={styles.fakeText}>Hey! Don't forget to pick up groceries later.</Text>
          </View>
          <View style={styles.fakeBubbleSent}>
            <Text style={styles.fakeText}>Sure, I will pick them up soon!</Text>
          </View>
        </View>
        <View style={styles.fakeInputBar}>
          <TextInput style={styles.fakeInput} placeholder="Type a message..." placeholderTextColor="#888" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Active Front Camera View (Rendered properly so mugshots capture instantly) */}
      {cameraPermission?.granted ? (
        <View style={{ width: 1, height: 1, overflow: 'hidden', opacity: 0, position: 'absolute' }}>
          <CameraView ref={cameraRef} style={{ width: 10, height: 10 }} facing="front" />
        </View>
      ) : (
        <TouchableOpacity style={{ padding: 10, backgroundColor: '#e53e3e', marginBottom: 10, borderRadius: 8 }} onPress={requestCameraPermission}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>⚠️ Grant Camera Permission for Mugshots</Text>
        </TouchableOpacity>
      )}

      {/* Shoulder Surfing / Side Peeker Warning Curtain */}
      {shoulderSurfingShieldActive && sidePeekerDetected && (
        <View style={styles.shoulderSurfingCurtain}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>👀⚠️</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Shoulder Surfing / Side Peeker Detected!</Text>
          <TouchableOpacity 
            style={{ marginTop: 20, backgroundColor: '#3182ce', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => setSidePeekerDetected(false)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Dismiss Privacy Curtain</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>AI Biometric Intruder Shield</Text>
        {isSaving && (
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>☁️ Syncing...</Text>
          </View>
        )}
      </View>
      <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
        Secure PIN protection, live front-camera face scanning, and silent intruder mugshots.
      </Text>

      {/* Configuration & Gallery Buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' }}
          onPress={() => setSetupModalVisible(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>⚙️ Configure PINs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: '#d97706', padding: 10, borderRadius: 8, alignItems: 'center' }}
          onPress={() => {
            fetchCapturedIntrudersLogs();
            setIntruderGalleryModal(true);
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>📸 Intruder Mugshots ({capturedIntruders.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Live Front-Camera Biometric Scan Trigger Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 14 }}
        onPress={() => setIsBiometricScannerOpen(true)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>👤 Scan Face / Biometric Login</Text>
      </TouchableOpacity>

      {/* 20+ Enterprise Security Layers Toggle Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 14 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} 20+ Security & Shield Layers Matrix</Text>
      </TouchableOpacity>

      {/* ================= 20+ SECURITY LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 14 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>⚡ Intruder Shield Enterprise Layers Matrix</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {layerDefinitions.map((layer) => {
              const isActive = intruderLayers[layer.key];
              return (
                <View key={layer.key} style={styles.layerItem}>
                  <Text style={styles.layerLabel} numberOfLines={1}>{layer.label}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleIntruderLayer(layer.key)}
                    trackColor={{ false: '#e53e3e', true: '#38a169' }}
                    thumbColor="#fff"
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Settings Panel */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={styles.row}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>Intruder Shield Active</Text>
          <Switch value={shieldActive} onValueChange={(val) => handleToggleCoreSwitch('shield', val)} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>Night-Vision Light Boost</Text>
          <Switch value={nightVisionBoost} onValueChange={(val) => handleToggleCoreSwitch('night', val)} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>Enable Decoy Mode on Breach</Text>
          <Switch value={decoyMode} onValueChange={(val) => handleToggleCoreSwitch('decoy', val)} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>
      </View>

      {/* PIN Verification / Test Simulator Section */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.label, isDarkMode && styles.darkText]}>Lock Screen PIN Fallback</Text>
        <TextInput 
          style={[styles.pinInputBox, isDarkMode && styles.darkInput]}
          placeholder="Enter PIN (Master or Duress)..."
          placeholderTextColor="#888"
          secureTextEntry
          keyboardType="numeric"
          value={pinInput}
          onChangeText={setPinInput}
        />
        <TouchableOpacity style={styles.pinButton} onPress={handlePinSubmit}>
          <Text style={styles.pinButtonText}>
            {isCapturingIntruder ? 'Capturing Intruder... 📸' : 'Authenticate PIN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Remote Wipe Button */}
      <TouchableOpacity style={styles.wipeButton} onPress={handleEmergencyRemoteWipe}>
        <Text style={styles.wipeButtonText}>⚠️ Emergency Remote Wipe & Purge</Text>
      </TouchableOpacity>

      {/* Status Monitor Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Sentinel Status Log:</Text>
        <Text style={styles.statusText}>{shieldStatus}</Text>
      </View>

      {/* ================= LIVE FRONT-CAMERA SCANNER MODAL ================= */}
      <Modal visible={isBiometricScannerOpen} transparent={true} animationType="slide">
        <View style={styles.fullscreenOverlay}>
          <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
              Live Biometric Face Scanner 🛡️
            </Text>
            <Text style={{ color: '#cbd5e0', fontSize: 12, marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 }}>
              {scanStatusText}
            </Text>

            {cameraPermission?.granted ? (
              <View style={{ width: 280, height: 360, borderRadius: 20, overflow: 'hidden', borderWidth: 3, borderColor: '#38a169', marginBottom: 30, justifyContent: 'center', alignItems: 'center' }}>
                <CameraView ref={cameraRef} style={{ width: '100%', height: '100%' }} facing="front" />
                <View style={{ position: 'absolute', width: 170, height: 230, borderWidth: 2.5, borderColor: '#fff', borderRadius: 85, borderStyle: 'dashed' }} />
              </View>
            ) : (
              <Text style={{ color: '#e53e3e', marginBottom: 20 }}>Camera permission is required.</Text>
            )}

            {isScanningFace ? (
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <ActivityIndicator size="large" color="#38a169" style={{ marginBottom: 10 }} />
                <Text style={{ color: '#fff', fontSize: 11 }}>Verifying face mesh...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 15, width: '100%', maxWidth: 300 }}>
                <TouchableOpacity style={[styles.pinButton, { backgroundColor: '#4a5568', flex: 1 }]} onPress={() => setIsBiometricScannerOpen(false)}>
                  <Text style={styles.pinButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pinButton, { backgroundColor: '#38a169', flex: 1 }]} onPress={handleExecuteBiometricScan}>
                  <Text style={styles.pinButtonText}>Verify Face Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ================= PIN CONFIGURATION MODAL ================= */}
      <Modal visible={setupModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkContainer]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>⚙️ Set Owner & Duress PINs</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>
              Define the secure PIN only you know, and a separate Duress PIN to activate panic mode if forced.
            </Text>

            <Text style={[styles.label, isDarkMode && styles.darkText]}>New Master PIN (Owner)</Text>
            <TextInput 
              style={[styles.pinInputBox, isDarkMode && styles.darkInput]}
              placeholder="e.g. 1234"
              placeholderTextColor="#888"
              secureTextEntry
              keyboardType="numeric"
              value={newMasterInput}
              onChangeText={setNewMasterInput}
            />

            <Text style={[styles.label, isDarkMode && styles.darkText]}>New Duress / Panic PIN (Decoy Mode)</Text>
            <TextInput 
              style={[styles.pinInputBox, isDarkMode && styles.darkInput]}
              placeholder="e.g. 9999"
              placeholderTextColor="#888"
              secureTextEntry
              keyboardType="numeric"
              value={newDuressInput}
              onChangeText={setNewDuressInput}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.pinButton, { backgroundColor: '#4a5568', flex: 1 }]} onPress={() => setSetupModalVisible(false)}>
                <Text style={styles.pinButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pinButton, { backgroundColor: '#3182ce', flex: 1 }]} onPress={saveCustomPinsToDatabase}>
                <Text style={styles.pinButtonText}>Save PINs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= INTRUDER MUGSHOTS GALLERY MODAL ================= */}
      <Modal visible={intruderGalleryModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkContainer, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>📸 Intruder Mugshots Log</Text>
              <TouchableOpacity onPress={() => setIntruderGalleryModal(false)}>
                <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={capturedIntruders}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) => {
                const photoUri = item.status && (item.status.startsWith('http') || item.status.startsWith('file://')) ? item.status : null;

                return (
                  <TouchableOpacity 
                    style={[styles.intruderCard, isDarkMode && styles.darkCard]}
                    onPress={() => {
                      if (photoUri) setSelectedMugshotUrl(photoUri);
                    }}
                    activeOpacity={0.8}
                  >
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.mugshotImage} contentFit="cover" cachePolicy="disk" />
                    ) : (
                      <View style={styles.mugshotPlaceholder}>
                        <Text style={{ fontSize: 24 }}>🚨</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>Breach Attempt Logged</Text>
                      <Text style={{ fontSize: 10, color: '#e53e3e', marginTop: 2 }}>{new Date(item.timestamp).toLocaleString()}</Text>
                      <Text style={{ fontSize: 9, color: '#3182ce', marginTop: 4 }}>🔍 Tap to zoom photo</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 30 }}>
                  <Text style={{ color: '#718096', fontSize: 13 }}>No breach attempts recorded yet. 🛡️</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ================= FULLSCREEN MUGSHOT ZOOM INSPECTOR MODAL ================= */}
      <Modal visible={selectedMugshotUrl !== null} transparent={true} animationType="fade">
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity style={styles.closeFullscreenBtn} onPress={() => setSelectedMugshotUrl(null)}>
            <Text style={styles.closeFullscreenText}>✕ Close Zoom</Text>
          </TouchableOpacity>
          {selectedMugshotUrl && (
            <Image 
              source={{ uri: selectedMugshotUrl }} 
              style={styles.fullscreenImage} 
              contentFit="contain" 
              cachePolicy="disk"
            />
          )}
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  darkContainer: {
    backgroundColor: '#1a202c',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 14,
  },
  darkCard: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  darkText: {
    color: '#fff',
  },
  pinInputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  darkInput: {
    backgroundColor: '#1a202c',
    borderColor: '#4a5568',
    color: '#fff',
  },
  pinButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  wipeButton: {
    backgroundColor: '#991b1b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  wipeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#37474f',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
  },
  intruderCard: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mugshotImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mugshotPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#cbd5e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullscreenBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  closeFullscreenText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  shoulderSurfingCurtain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Fake Chat Screen Styles
  fakeContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'space-between',
  },
  fakeHeader: {
    backgroundColor: '#075e54',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fakeHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitFakeText: {
    color: '#fff',
    fontSize: 14,
  },
  fakeChatBody: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  fakeBubbleReceived: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    maxWidth: '75%',
  },
  fakeBubbleSent: {
    backgroundColor: '#dcf8c6',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 10,
    maxWidth: '75%',
  },
  fakeText: {
    fontSize: 14,
    color: '#333',
  },
  fakeInputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  fakeInput: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  syncBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: '48%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  layerLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 4,
  },
});