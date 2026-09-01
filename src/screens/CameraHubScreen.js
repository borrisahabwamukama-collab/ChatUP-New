import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraHubScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [activeSource, setActiveSource] = useState('Device Primary');

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container}><Text style={styles.text}>Loading camera permissions...</Text></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera for live streaming and fellowship recording.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleSelectExternalCamera = (sourceName) => {
    setActiveSource(sourceName);
    Alert.alert('Camera Source Switched 🎥', `Now routing feed from: ${sourceName}`);
  };

  return (
    <View style={styles.container}>
      {/* Live Camera Feed Container */}
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlayTop}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>🔴 ACTIVE: {activeSource}</Text>
          </View>
        </View>

        <View style={styles.overlayBottom}>
          {/* Switch Device Camera (Front/Back) */}
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Text style={styles.controlText}>🔄 Flip Camera</Text>
          </TouchableOpacity>

          {/* External / Multi-Camera Switcher Options */}
          <View style={styles.multiCamRow}>
            <TouchableOpacity 
              style={[styles.miniCamBtn, activeSource === 'Device Primary' && styles.activeMiniBtn]}
              onPress={() => handleSelectExternalCamera('Device Primary')}
            >
              <Text style={styles.miniCamText}>Phone Cam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.miniCamBtn, activeSource === 'Sanctuary Main HD' && styles.activeMiniBtn]}
              onPress={() => handleSelectExternalCamera('Sanctuary Main HD')}
            >
              <Text style={styles.miniCamText}>Alt Feed 1</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.miniCamBtn, activeSource === 'Choir Stage Cam' && styles.activeMiniBtn]}
              onPress={() => handleSelectExternalCamera('Choir Stage Cam')}
            >
              <Text style={styles.miniCamText}>Alt Feed 2</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 16,
    color: '#ffffff',
    fontSize: 14,
  },
  btn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  text: {
    color: '#ffffff',
  },
  overlayTop: {
    padding: 20,
    alignItems: 'flex-start',
  },
  sourceBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sourceBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  overlayBottom: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  controlText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  multiCamRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  miniCamBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeMiniBtn: {
    backgroundColor: '#16a34a',
  },
  miniCamText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});