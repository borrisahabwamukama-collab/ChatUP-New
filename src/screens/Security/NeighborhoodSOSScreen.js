import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';

export default function NeighborhoodSOSScreen() {
  const [sosActive, setSosActive] = useState(false);
  const [responderCount, setResponderCount] = useState(0);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState([]);
  const [threatLevel, setThreatLevel] = useState('standard'); // 'standard' or 'critical_armed'

  // Trigger Silent SOS with 3km Wide-Radius escalation for critical threats
  const handleTriggerSOS = (level) => {
    setThreatLevel(level);
    const timestamp = new Date().toLocaleTimeString();
    setSosActive(true);
    
    if (level === 'critical_armed') {
      setResponderCount(14); // Scaled up responder network
      setBreadcrumbTrail([
        `[${timestamp}] CRITICAL THREAT ALERT (Gun/Knife/Multiple Attackers)`,
        `[${timestamp}] 3-Kilometer Wide-Radius Broadcast Activated across Kampala Grid`,
        `[${timestamp}] GPS Breadcrumb: Lat 0.3476, Lng 32.5825 (High-Priority Interception)`
      ]);
      Alert.alert("🚨 3KM WIDE-RADIUS SOS", "Critical threat reported! Broadcast radius expanded to 3 kilometers, alerting armed nodes and wide community network.");
    } else {
      setResponderCount(3);
      setBreadcrumbTrail([
        `[${timestamp}] Standard SOS Broadcasted: Kampala Central Zone`,
        `[${timestamp}] GPS Breadcrumb: Lat 0.3476, Lng 32.5825 (Local Street Threat Track Active)`
      ]);
      Alert.alert("🚨 Silent SOS Activated", "Emergency profile broadcasted to local neighborhood grid.");
    }
  };

  const handleCancelSOS = () => {
    setSosActive(false);
    setResponderCount(0);
    setBreadcrumbTrail([]);
    setThreatLevel('standard');
    Alert.alert("SOS Stand down", "Emergency broadcast cleared safely.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Neighborhood Watch SOS</Text>
      <Text style={styles.subtitle}>
        Wide-radius 3km threat broadcasting, verified profiles, and real-time responder feeds.
      </Text>

      {/* Verified Emergency Profile Card Preview */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>🪪 Verified Emergency Profile Card</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>B</Text></View>
          <View>
            <Text style={styles.profileName}>Borris Ahabwamukama</Text>
            <Text style={styles.profileDetails}>Location: Kampala, Uganda</Text>
            <Text style={styles.profileDetails}>Medical: O+ | No Chronic Allergies</Text>
          </View>
        </View>
        <Text style={styles.cardNote}>Instant display on responder safety screens during active SOS.</Text>
      </View>

      {/* Active SOS or Trigger Options */}
      {sosActive ? (
        <View style={[styles.activeSosBox, threatLevel === 'critical_armed' && styles.criticalBox]}>
          <Text style={styles.alertingText}>
            {threatLevel === 'critical_armed' ? '⚠️ 3-KM CRITICAL ARMED THREAT BROADCAST ACTIVE' : '🔴 LOCAL SILENT SOS ACTIVE'}
          </Text>
          
          <View style={styles.feedBox}>
            <Text style={styles.feedTitle}>Live Reassurance Feed:</Text>
            <Text style={styles.feedCount}>{responderCount} responders / armed nodes en route.</Text>
          </View>

          <View style={styles.breadcrumbBox}>
            <Text style={styles.breadcrumbTitle}>Street Threat GPS & Radius Log:</Text>
            {breadcrumbTrail.map((crumb, index) => (
              <Text key={index} style={styles.breadcrumbText}>{crumb}</Text>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSOS}>
            <Text style={styles.cancelButtonText}>Stand Down / Cancel SOS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.triggerContainer}>
          <TouchableOpacity style={styles.sosButton} onPress={() => handleTriggerSOS('standard')}>
            <Text style={styles.sosButtonText}>TRIGGER STANDARD SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.criticalSosButton} onPress={() => handleTriggerSOS('critical_armed')}>
            <Text style={styles.criticalSosButtonText}>🚨 CRITICAL THREAT (Gun/Knife/Multiple - 3KM Radius)</Text>
          </TouchableOpacity>
        </View>
      )}
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  profileDetails: {
    fontSize: 13,
    color: '#555',
  },
  cardNote: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  triggerContainer: {
    gap: 12,
  },
  sosButton: {
    backgroundColor: '#e67e22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  criticalSosButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  criticalSosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  activeSosBox: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  criticalBox: {
    backgroundColor: '#ffdbdc',
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  alertingText: {
    color: '#c0392b',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  feedBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  feedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  feedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c0392b',
  },
  breadcrumbBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  breadcrumbTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  breadcrumbText: {
    fontSize: 11,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  cancelButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});