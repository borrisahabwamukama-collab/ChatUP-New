import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function LiveBroadcastGrid({
  selectedGame,
  spectatorCount,
  hostWebcamRef,
  playerOneWebcamRef,
  playerTwoWebcamRef,
  cameraStatus,
  hostCheers,
  playerOneCheers,
  playerTwoCheers,
  playerOneScore,
  playerTwoScore,
  handleSendCheerFor,
  openTipModalFor,
  isDarkMode,
  styles
}) {
  const [facing, setFacing] = useState('front');
  const [permission, requestPermission] = useCameraPermissions();
  // Track which box gets the active hardware camera ('host' | 'borris' | 'challenger' | null)
  const [activeCameraBox, setActiveCameraBox] = useState('host');

  useEffect(() => {
    if (Platform.OS !== 'web' && !permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleToggleCam = (boxName) => {
    if (!permission?.granted) {
      requestPermission();
      Alert.alert('Permission Required', 'Camera permission is required to stream live.');
      return;
    }
    // Toggle active box (if already active, turn it off)
    setActiveCameraBox(prev => prev === boxName ? null : boxName);
  };

  return (
    <View style={[styles.boardCard, isDarkMode && styles.darkCard]}>
      <View style={styles.liveHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.liveBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>🔴 LIVE BROADCAST</Text></View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#dc2626' }}>Table ({selectedGame}): Arena</Text>
        </View>
        <Text style={[styles.spectatorText, isDarkMode && styles.darkText]}>👀 {spectatorCount.toLocaleString()} Watching</Text>
      </View>

      {/* Helper instruction for mobile camera streaming */}
      {Platform.OS !== 'web' && (
        <View style={{ backgroundColor: '#eff6ff', padding: 6, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#bfdbfe' }}>
          <Text style={{ fontSize: 10, color: '#1e40af', textAlign: 'center', fontWeight: 'bold' }}>
            📱 Tap any video box below to stream your live mobile camera into that slot!
          </Text>
        </View>
      )}

      <View style={styles.broadcastMasterContainer}>
        {/* Host Webcam Booth Stream */}
        <View style={styles.hostSquareWrapper}>
          <TouchableOpacity 
            style={[styles.hostSquareStreamBox, activeCameraBox === 'host' && { borderColor: '#22c55e', borderWidth: 3 }]} 
            onPress={() => {
              if (Platform.OS !== 'web') handleToggleCam('host');
              else openTipModalFor('Table Host (Caster)');
            }}
          >
            {Platform.OS === 'web' ? (
              <video 
                ref={hostWebcamRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: 8, backgroundColor: '#0f172a' }} 
              />
            ) : activeCameraBox === 'host' && permission?.granted ? (
              <CameraView style={{ width: '100%', height: '100%', position: 'absolute' }} facing={facing} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' }}>
                <Text style={{ fontSize: 24 }}>🎙️🎥</Text>
                <Text style={{ color: '#94a3b8', fontSize: 9, marginTop: 4 }}>Tap to Stream Here</Text>
              </View>
            )}
            <View style={styles.hostLabelOverlay}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                🎙️ Host Caster Booth {activeCameraBox === 'host' ? '🟢 (LIVE)' : ''}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.cheerSectionBar}>
            <Text style={{ fontSize: 9, color: '#fef08a', fontWeight: 'bold' }}>🔥 Host Fans: {hostCheers}</Text>
            <TouchableOpacity style={styles.cheerBoostBtn} onPress={() => handleSendCheerFor('host')}>
              <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>👏 Cheer Host</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dual Player Feeds */}
        <View style={styles.squarePlayersGrid}>
          {/* Player 1 (Borris) */}
          <View style={styles.competitorSquareColumn}>
            <TouchableOpacity 
              style={[styles.squareCompetitorStreamBox, activeCameraBox === 'borris' && { borderColor: '#22c55e', borderWidth: 3 }]} 
              onPress={() => {
                if (Platform.OS !== 'web') handleToggleCam('borris');
                else openTipModalFor('Player A (Borris)');
              }}
            >
              {Platform.OS === 'web' ? (
                <video 
                  ref={playerOneWebcamRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: 8, backgroundColor: '#0f172a' }} 
                />
              ) : activeCameraBox === 'borris' && permission?.granted ? (
                <CameraView style={{ width: '100%', height: '100%', position: 'absolute' }} facing={facing} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#064e3b' }}>
                  <Text style={{ fontSize: 20 }}>👤🏆</Text>
                  <Text style={{ color: '#6ee7b7', fontSize: 9, marginTop: 2 }}>Tap to Stream Here</Text>
                </View>
              )}
              <View style={styles.playerLabelOverlay}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  Borris: {playerOneScore} pts {activeCameraBox === 'borris' ? '🟢' : ''}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.cheerSectionBar}>
              <Text style={{ fontSize: 9, color: '#6ee7b7', fontWeight: 'bold' }}>🎉 Fans: {playerOneCheers}</Text>
              <TouchableOpacity style={styles.cheerBoostBtn} onPress={() => handleSendCheerFor('p1')}>
                <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>👏 Cheer P1</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Player 2 (Challenger) */}
          <View style={styles.competitorSquareColumn}>
            <TouchableOpacity 
              style={[styles.squareCompetitorStreamBox, activeCameraBox === 'challenger' && { borderColor: '#22c55e', borderWidth: 3 }]} 
              onPress={() => {
                if (Platform.OS !== 'web') handleToggleCam('challenger');
                else openTipModalFor('Player B (Challenger_99)');
              }}
            >
              {Platform.OS === 'web' ? (
                <video 
                  ref={playerTwoWebcamRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: 8, backgroundColor: '#0f172a' }} 
                />
              ) : activeCameraBox === 'challenger' && permission?.granted ? (
                <CameraView style={{ width: '100%', height: '100%', position: 'absolute' }} facing={facing} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7f1d1d' }}>
                  <Text style={{ fontSize: 20 }}>🤺⚡</Text>
                  <Text style={{ color: '#fca5a5', fontSize: 9, marginTop: 2 }}>Tap to Stream Here</Text>
                </View>
              )}
              <View style={[styles.playerLabelOverlay, { backgroundColor: 'rgba(197, 48, 48, 0.85)' }]}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  Challenger: {playerTwoScore} pts {activeCameraBox === 'challenger' ? '🟢' : ''}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.cheerSectionBar}>
              <Text style={{ fontSize: 9, color: '#fca5a5', fontWeight: 'bold' }}>🎉 Fans: {playerTwoCheers}</Text>
              <TouchableOpacity style={[styles.cheerBoostBtn, { backgroundColor: '#dc2626' }]} onPress={() => handleSendCheerFor('p2')}>
                <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>👏 Cheer P2</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}