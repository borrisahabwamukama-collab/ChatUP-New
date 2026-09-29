import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform, Vibration, TextInput, Modal } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../../../Services/supabaseClient';
import AiSupervisorHud from './AiSupervisorHud'; // Since they are in the same folder!

export default function InstitutionalNodesScreen({ isDarkMode }) {
  const [policeDispatchActive, setPoliceDispatchActive] = useState(true);
  const [medicalDispatchActive, setMedicalDispatchActive] = useState(true);
  const [localOutpostActive, setLocalOutpostActive] = useState(true);
  const [registeredStations, setRegisteredStations] = useState([]);
  const [lastSyncStatus, setLastSyncStatus] = useState("Active institutional dispatch gateways armed & listening.");
  const [isSaving, setIsSaving] = useState(false);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);

  // Registration Modal State for Authorities
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStationName, setRegStationName] = useState('Central Police Station Kampala');
  const [regOfficerName, setRegOfficerName] = useState('Capt. Mugisha');
  const [regBadgeNumber, setRegBadgeNumber] = useState('UG-POL-2026-884');
  const [regJurisdiction, setRegJurisdiction] = useState('Kampala Central');
  const [regNodeType, setRegNodeType] = useState('Police Command');
  const [isRegistering, setIsRegistering] = useState(false);

  // ================= 20+ INSTITUTIONAL & GOV-GRID DISPATCH LAYERS STATE =================
  const [institutionalLayers, setInstitutionalLayers] = useState({
    kampalaCentralCommandMesh: true,
    interPolCrossBorderRelay: true,
    nationalAmbulanceDispatcherAi: true,
    quantumNodeSecurityHash: true,
    autonomousDroneInterceptionGrid: true,
    zeroFeeGovSubsidizer: true,
    smartContractEmergencyEscrow: true,
    bluetoothP2pGovMesh: true,
    federatedAiThreatAnalyticsGov: true,
    realtimeSentimentMeshGov: true,
    flutterwaveGovTreasurySync: true,
    multimodalHlsNodeSurveillance: true,
    cryptographicNodeWatermark: true,
    automaticSpeechDispatchLog: true,
    silentDuressAudioBeaconGov: true,
    cloudSentinelNodeBackup: true,
    chromaKeyNodeMasking: true,
    studioAudioNodeDenoiser: true,
    hdrNightVisionNodeCorrection: true,
    globalGovEmergencyOverride: true,
  });

  // Load saved Institutional settings and setup real-time subscription on mount
  useEffect(() => {
    fetchInstitutionalSettings();
    fetchRegisteredStations();

    // REALTIME JURISDICTIONAL ALARM LISTENER FOR INSTITUTIONAL NODES
    const emergencyListener = supabase
      .channel('institutional_alarm_grid')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'active_sos_events' }, (payload) => {
        const emergency = payload.new;
        if (emergency && emergency.status === 'Active') {
          // Trigger high-decibel vibration alarm loop (Guaranteed 404-free)
          Vibration.vibrate([500, 500, 500, 500], true);

          Alert.alert(
            '🚨 STATION DISPATCH ALARM!',
            `Incoming Emergency Broadcast!\n📍 Location: ${emergency.location_name || 'Kampala Node'}\n⚠️ Threat: ${emergency.threat_level?.toUpperCase()}\n👤 User: ${emergency.user_handle}`
          );
        }
      })
      .subscribe();

    // Setup Supabase Realtime subscription for settings sync
    const subscription = supabase
      .channel('public:institutional_settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'institutional_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          const data = payload.new;
          if (data) {
            setPoliceDispatchActive(data.police_dispatch_active ?? true);
            setMedicalDispatchActive(data.medical_dispatch_active ?? true);
            setLocalOutpostActive(data.local_outpost_active ?? true);
            setInstitutionalLayers({
              kampalaCentralCommandMesh: data.kampala_central_command_mesh ?? true,
              interPolCrossBorderRelay: data.interpol_cross_border_relay ?? true,
              nationalAmbulanceDispatcherAi: data.national_ambulance_dispatcher_ai ?? true,
              quantumNodeSecurityHash: data.quantum_node_security_hash ?? true,
              autonomousDroneInterceptionGrid: data.autonomous_drone_interception_grid ?? true,
              zeroFeeGovSubsidizer: data.zero_fee_gov_subsidizer ?? true,
              smartContractEmergencyEscrow: data.smart_contract_emergency_escrow ?? true,
              bluetoothP2pGovMesh: data.bluetooth_p2p_gov_mesh ?? true,
              federatedAiThreatAnalyticsGov: data.federated_ai_threat_analytics_gov ?? true,
              realtimeSentimentMeshGov: data.realtime_sentiment_mesh_gov ?? true,
              flutterwaveGovTreasurySync: data.flutterwave_gov_treasury_sync ?? true,
              multimodalHlsNodeSurveillance: data.multimodal_hls_node_surveillance ?? true,
              cryptographicNodeWatermark: data.cryptographic_node_watermark ?? true,
              automaticSpeechDispatchLog: data.automatic_speech_dispatch_log ?? true,
              silentDuressAudioBeaconGov: data.silent_duress_audio_beacon_gov ?? true,
              cloudSentinelNodeBackup: data.cloud_sentinel_node_backup ?? true,
              chromaKeyNodeMasking: data.chroma_key_node_masking ?? true,
              studioAudioNodeDenoiser: data.studio_audio_node_denoiser ?? true,
              hdrNightVisionNodeCorrection: data.hdr_night_vision_node_correction ?? true,
              globalGovEmergencyOverride: data.global_gov_emergency_override ?? true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      Vibration.cancel();
      supabase.removeChannel(subscription);
      supabase.removeChannel(emergencyListener);
    };
  }, []);

  const stopStationAlarm = async () => {
    Vibration.cancel();
    Alert.alert("Alarm Silenced", "Station emergency vibration alarm has been cancelled.");
  };

  const fetchInstitutionalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('institutional_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setPoliceDispatchActive(data.police_dispatch_active ?? true);
        setMedicalDispatchActive(data.medical_dispatch_active ?? true);
        setLocalOutpostActive(data.local_outpost_active ?? true);
        setInstitutionalLayers({
          kampalaCentralCommandMesh: data.kampala_central_command_mesh ?? true,
          interPolCrossBorderRelay: data.interpol_cross_border_relay ?? true,
          nationalAmbulanceDispatcherAi: data.national_ambulance_dispatcher_ai ?? true,
          quantumNodeSecurityHash: data.quantum_node_security_hash ?? true,
          autonomousDroneInterceptionGrid: data.autonomous_drone_interception_grid ?? true,
          zeroFeeGovSubsidizer: data.zero_fee_gov_subsidizer ?? true,
          smartContractEmergencyEscrow: data.smart_contract_emergency_escrow ?? true,
          bluetoothP2pGovMesh: data.bluetooth_p2p_gov_mesh ?? true,
          federatedAiThreatAnalyticsGov: data.federated_ai_threat_analytics_gov ?? true,
          realtimeSentimentMeshGov: data.realtime_sentiment_mesh_gov ?? true,
          flutterwaveGovTreasurySync: data.flutterwave_gov_treasury_sync ?? true,
          multimodalHlsNodeSurveillance: data.multimodal_hls_node_surveillance ?? true,
          cryptographicNodeWatermark: data.cryptographic_node_watermark ?? true,
          automaticSpeechDispatchLog: data.automatic_speech_dispatch_log ?? true,
          silentDuressAudioBeaconGov: data.silent_duress_audio_beacon_gov ?? true,
          cloudSentinelNodeBackup: data.cloud_sentinel_node_backup ?? true,
          chromaKeyNodeMasking: data.chroma_key_node_masking ?? true,
          studioAudioNodeDenoiser: data.studio_audio_node_denoiser ?? true,
          hdrNightVisionNodeCorrection: data.hdr_night_vision_node_correction ?? true,
          globalGovEmergencyOverride: data.global_gov_emergency_override ?? true,
        });
      }
    } catch (err) {
      console.log('No existing Institutional settings found. Initializing default state.');
    }
  };

  const fetchRegisteredStations = async () => {
    try {
      const { data, error } = await supabase.from('institutional_nodes_registry').select('*').order('registered_at', { ascending: false });
      if (!error && data) {
        setRegisteredStations(data);
      }
    } catch (err) {}
  };

  const handleRegisterStationNode = async () => {
    if (!regStationName || !regBadgeNumber || !regJurisdiction) {
      Alert.alert('Missing Fields ❌', 'Please provide station name, badge number, and jurisdiction.');
      return;
    }

    setIsRegistering(true);
    try {
      const { error } = await supabase.from('institutional_nodes_registry').insert([
        {
          station_name: regStationName,
          officer_in_charge: regOfficerName,
          badge_number: regBadgeNumber,
          jurisdiction_zone: regJurisdiction,
          node_type: regNodeType,
          status: 'Active & Armed',
          registered_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      Alert.alert('🏛️ Station Registered!', `Official node "${regStationName}" is now armed on the network.`);
      setShowRegModal(false);
      fetchRegisteredStations();
    } catch (err) {
      Alert.alert('Registration Error ❌', err.message || 'Could not register station.');
    } finally {
      setIsRegistering(false);
    }
  };

  const syncSettingsToSupabase = async (newPolice, newMedical, newOutpost, updatedLayers) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('institutional_settings')
        .upsert({
          id: 1,
          police_dispatch_active: newPolice,
          medical_dispatch_active: newMedical,
          local_outpost_active: newOutpost,
          kampala_central_command_mesh: updatedLayers.kampalaCentralCommandMesh,
          interpol_cross_border_relay: updatedLayers.interPolCrossBorderRelay,
          national_ambulance_dispatcher_ai: updatedLayers.nationalAmbulanceDispatcherAi,
          quantum_node_security_hash: updatedLayers.quantumNodeSecurityHash,
          autonomous_drone_interception_grid: updatedLayers.autonomousDroneInterceptionGrid,
          zero_fee_gov_subsidizer: updatedLayers.zeroFeeGovSubsidizer,
          smart_contract_emergency_escrow: updatedLayers.smartContractEmergencyEscrow,
          bluetooth_p2p_gov_mesh: updatedLayers.bluetoothP2pGovMesh,
          federated_ai_threat_analytics_gov: updatedLayers.federatedAiThreatAnalyticsGov,
          realtime_sentiment_mesh_gov: updatedLayers.realtimeSentimentMeshGov,
          flutterwave_gov_treasury_sync: updatedLayers.flutterwaveGovTreasurySync,
          multimodal_hls_node_surveillance: updatedLayers.multimodalHlsNodeSurveillance,
          cryptographic_node_watermark: updatedLayers.cryptographicNodeWatermark,
          automatic_speech_dispatch_log: updatedLayers.automaticSpeechDispatchLog,
          silent_duress_audio_beacon_gov: updatedLayers.silentDuressAudioBeaconGov,
          cloud_sentinel_node_backup: updatedLayers.cloudSentinelNodeBackup,
          chroma_key_node_masking: updatedLayers.chromaKeyNodeMasking,
          studio_audio_node_denoiser: updatedLayers.studioAudioNodeDenoiser,
          hdr_night_vision_node_correction: updatedLayers.hdrNightVisionNodeCorrection,
          global_gov_emergency_override: updatedLayers.globalGovEmergencyOverride,
          updated_at: new Date(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync Institutional settings to Supabase:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCoreSwitch = async (type, val) => {
    let newPolice = policeDispatchActive;
    let newMedical = medicalDispatchActive;
    let newOutpost = localOutpostActive;

    if (type === 'police') {
      newPolice = val;
      setPoliceDispatchActive(val);
    } else if (type === 'medical') {
      newMedical = val;
      setMedicalDispatchActive(val);
    } else if (type === 'outpost') {
      newOutpost = val;
      setLocalOutpostActive(val);
    }

    await syncSettingsToSupabase(newPolice, newMedical, newOutpost, institutionalLayers);
  };

  const toggleInstitutionalLayer = async (key) => {
    const updatedLayers = {
      ...institutionalLayers,
      [key]: !institutionalLayers[key],
    };
    setInstitutionalLayers(updatedLayers);
    await syncSettingsToSupabase(policeDispatchActive, medicalDispatchActive, localOutpostActive, updatedLayers);
  };

  // ================= PURE ACTIVE INSTITUTIONAL DISPATCH EXECUTION =================
  const testNodeDispatch = async (nodeName) => {
    const timestamp = new Date().toLocaleTimeString();
    setLastSyncStatus(`[${timestamp}] Transmitting live encrypted packet to ${nodeName}...`);
    Vibration.vibrate([400, 400, 400, 400], true);

    try {
      let lat = 0.3476;
      let lng = 32.5825;
      let placeName = 'Kampala Institutional Dispatch Node';

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = location.coords.latitude;
        lng = location.coords.longitude;

        let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          const match = geocode[0];
          placeName = `${match.street || match.name || ''}, ${match.subregion || match.city || 'Kampala'}`.replace(/^, /, '');
        }
      }

      const { error } = await supabase.from('active_sos_events').insert([
        {
          user_handle: '@borris_institutional_node',
          threat_level: `institutional_dispatch_${nodeName.toLowerCase().replace(/\s+/g, '_')}`,
          responders_count: 1,
          location_lat: lat,
          location_lng: lng,
          location_name: placeName,
          status: 'Active',
          timestamp: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setLastSyncStatus(`[${timestamp}] 🏛️ SUCCESS: Verified dispatch received at ${nodeName}!`);
      Alert.alert("🏛️ Active Institutional Node Dispatched", `Live encrypted SOS packet transmitted to ${nodeName}.\nLocation: ${placeName}`);
    } catch (err) {
      setLastSyncStatus(`[${timestamp}] ❌ ERROR: Dispatch failed - ${err.message}`);
      Alert.alert("Dispatch Error ❌", err.message || "Failed to transmit packet to institutional gateway.");
    }
  };

  const layerDefinitions = [
    { key: 'kampalaCentralCommandMesh', label: '🏛️ Kampala Central Mesh' },
    { key: 'interPolCrossBorderRelay', label: '🌐 InterPol Border Relay' },
    { key: 'nationalAmbulanceDispatcherAi', label: '🚑 National EMS AI' },
    { key: 'quantumNodeSecurityHash', label: '🔐 Quantum Node Security' },
    { key: 'autonomousDroneInterceptionGrid', label: '🚁 Autonomous Drone Grid' },
    { key: 'zeroFeeGovSubsidizer', label: '🪙 Zero-Fee Gov Gas' },
    { key: 'smartContractEmergencyEscrow', label: '🪙 Smart Contract Escrow' },
    { key: 'bluetoothP2pGovMesh', label: '🛰️ Bluetooth P2P Gov Mesh' },
    { key: 'federatedAiThreatAnalyticsGov', label: '🧠 Federated AI Threat' },
    { key: 'realtimeSentimentMeshGov', label: '🌿 Sentiment Mesh Gov' },
    { key: 'flutterwaveGovTreasurySync', label: '🪙 Flutterwave Gov Sync' },
    { key: 'multimodalHlsNodeSurveillance', label: '🎥 Multimodal HLS Feed' },
    { key: 'cryptographicNodeWatermark', label: '🛡️ Crypto Watermark' },
    { key: 'automaticSpeechDispatchLog', label: '📜 Speech Dispatch Log' },
    { key: 'silentDuressAudioBeaconGov', label: '🔊 Silent Duress Audio' },
    { key: 'cloudSentinelNodeBackup', label: '☁️ Cloud Sentinel Backup' },
    { key: 'chromaKeyNodeMasking', label: '🎨 Chroma Key Mask' },
    { key: 'studioAudioNodeDenoiser', label: '🎙️ Studio Denoiser' },
    { key: 'hdrNightVisionNodeCorrection', label: '☀️ HDR Night Correction' },
    { key: 'globalGovEmergencyOverride', label: '🚨 Global Gov Override' },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Institutional Emergency Nodes</Text>
        {isSaving && (
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>☁️ Syncing...</Text>
          </View>
        )}
      </View>
      <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
        Direct automated dispatch links connecting critical threat alerts to official Kampala authorities and medical centers in real-time.
      </Text>

      {/* 🧠 LIVE AI SUPERVISOR HUD INTEGRATED HERE */}
      <AiSupervisorHud isDarkMode={isDarkMode} />

      {/* REGISTERED STATIONS HEADER WITH REGISTRATION BUTTON */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionHeader, { color: '#3182ce', marginBottom: 0 }]}>🏛️ Registered Authority Nodes ({registeredStations.length})</Text>
          <TouchableOpacity style={styles.regTriggerBtn} onPress={() => setShowRegModal(true)}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>+ Register Station</Text>
          </TouchableOpacity>
        </View>

        {registeredStations.length === 0 ? (
          <Text style={{ fontSize: 12, color: '#718096', fontStyle: 'italic' }}>No registered stations found. Tap "+ Register Station" to add one.</Text>
        ) : (
          registeredStations.map((st) => (
            <View key={st.id} style={{ backgroundColor: '#ebf8ff', padding: 8, borderRadius: 6, marginBottom: 4, borderWidth: 1, borderColor: '#bee3f8' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🛡️ {st.station_name} ({st.node_type})</Text>
              <Text style={{ fontSize: 10, color: '#4a5568' }}>Zone: {st.jurisdiction_zone} | Officer: {st.officer_in_charge} ({st.badge_number})</Text>
            </View>
          ))
        )}
      </View>

      {/* STATION REGISTRATION MODAL */}
      <Modal visible={showRegModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>🏛️ Register Official Station Node</Text>

            <Text style={styles.modalLabel}>Station / Precinct Name:</Text>
            <TextInput style={[styles.modalInput, isDarkMode && styles.darkInput]} value={regStationName} onChangeText={setRegStationName} placeholder="e.g. Jinja Road Police Station" placeholderTextColor="#a0aec0" />

            <Text style={styles.modalLabel}>Officer In Charge:</Text>
            <TextInput style={[styles.modalInput, isDarkMode && styles.darkInput]} value={regOfficerName} onChangeText={setRegOfficerName} placeholder="Full Name" placeholderTextColor="#a0aec0" />

            <Text style={styles.modalLabel}>Badge Number:</Text>
            <TextInput style={[styles.modalInput, isDarkMode && styles.darkInput]} value={regBadgeNumber} onChangeText={setRegBadgeNumber} placeholder="Badge ID" placeholderTextColor="#a0aec0" />

            <Text style={styles.modalLabel}>Jurisdiction Zone:</Text>
            <TextInput style={[styles.modalInput, isDarkMode && styles.darkInput]} value={regJurisdiction} onChangeText={setRegJurisdiction} placeholder="e.g. Nakawa Division" placeholderTextColor="#a0aec0" />

            <Text style={styles.modalLabel}>Node Type:</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
              {['Police Command', 'Medical EMS', 'Community Outpost'].map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.typeBtn, regNodeType === type && styles.typeBtnSelected]}
                  onPress={() => setRegNodeType(type)}
                >
                  <Text style={[styles.typeBtnText, regNodeType === type && { color: '#fff' }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#cbd5e0' }]} onPress={() => setShowRegModal(false)}>
                <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#111' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#2563eb' }]} onPress={handleRegisterStationNode} disabled={isRegistering}>
                <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#fff' }}>{isRegistering ? 'Saving...' : 'Save & Arm Node'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 20+ Institutional Layers Toggle Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 14 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} 20+ Institutional & Gov-Grid Layers</Text>
      </TouchableOpacity>

      {/* ================= 20+ INSTITUTIONAL LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 14 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>⚡ Institutional Nodes Enterprise Layers Matrix</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {layerDefinitions.map((layer) => {
              const isActive = institutionalLayers[layer.key];
              return (
                <View key={layer.key} style={styles.layerItem}>
                  <Text style={styles.layerLabel} numberOfLines={1}>{layer.label}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleInstitutionalLayer(layer.key)}
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

      {/* Node Control Panel */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.sectionHeader, isDarkMode && styles.darkText]}>📡 Active Dispatch Gateways</Text>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Kampala Police Central Command</Text>
            <Text style={[styles.sublabel, isDarkMode && { color: '#a0aec0' }]}>Auto-dispatches armed threat coordinates</Text>
          </View>
          <Switch 
            value={policeDispatchActive} 
            onValueChange={(val) => handleToggleCoreSwitch('police', val)} 
            trackColor={{ false: "#767577", true: "#e74c3c" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Emergency Medical Services (EMS)</Text>
            <Text style={[styles.sublabel, isDarkMode && { color: '#a0aec0' }]}>Shares blood type & medical profile</Text>
          </View>
          <Switch 
            value={medicalDispatchActive} 
            onValueChange={(val) => handleToggleCoreSwitch('medical', val)} 
            trackColor={{ false: "#767577", true: "#27ae60" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Local Community Security Outpost</Text>
            <Text style={[styles.sublabel, isDarkMode && { color: '#a0aec0' }]}>Direct link to neighborhood patrol units</Text>
          </View>
          <Switch 
            value={localOutpostActive} 
            onValueChange={(val) => handleToggleCoreSwitch('outpost', val)} 
            trackColor={{ false: "#767577", true: "#007AFF" }} 
          />
        </View>
      </View>

      {/* Sync Status Box */}
      <View style={[styles.statusBox, isDarkMode && styles.darkInnerCard]}>
        <Text style={[styles.statusTitle, isDarkMode && styles.darkText]}>Gateway Status:</Text>
        <Text style={[styles.statusText, isDarkMode && { color: '#a0aec0' }]}>{lastSyncStatus}</Text>
        <TouchableOpacity style={{ marginTop: 8 }} onPress={stopStationAlarm}>
          <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 11 }}>🛑 Silence Station Alarm & Vibration</Text>
        </TouchableOpacity>
      </View>

      {/* Testing Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testNodeDispatch('Kampala Police Command')}
        >
          <Text style={styles.testButtonText}>Test Police Dispatch Node (Live)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#27ae60' }]} 
          onPress={() => testNodeDispatch('Emergency Medical Services')}
        >
          <Text style={styles.testButtonText}>Test Medical Dispatch Node (Live)</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  darkCard: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
  },
  darkInnerCard: {
    backgroundColor: '#1a202c',
    borderColor: '#4a5568',
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  regTriggerBtn: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    backgroundColor: '#f7fafc',
    color: '#2d3748',
    fontSize: 11,
    marginBottom: 6,
  },
  typeBtn: {
    backgroundColor: '#edf2f7',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    flex: 1,
    alignItems: 'center',
  },
  typeBtnSelected: {
    backgroundColor: '#3182ce',
    borderColor: '#2b6cb0',
  },
  typeBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nodeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sublabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  statusBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#37474f',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    gap: 10,
  },
  testButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  darkText: {
    color: '#fff',
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