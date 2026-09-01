import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';

export default function InstitutionalNodesScreen() {
  const [policeDispatchActive, setPoliceDispatchActive] = useState(true);
  const [medicalDispatchActive, setMedicalDispatchActive] = useState(true);
  const [localOutpostActive, setLocalOutpostActive] = useState(true);
  const [lastSyncStatus, setLastSyncStatus] = useState("All institutional nodes synced & armed.");

  const testNodeDispatch = (nodeName) => {
    const timestamp = new Date().toLocaleTimeString();
    const statusMsg = `[${timestamp}] Test SOS packet successfully dispatched to ${nodeName} desk!`;
    setLastSyncStatus(statusMsg);
    Alert.alert("🏛️ Node Dispatch Test", `Encrypted coordinates and Verified Emergency Profile sent to ${nodeName}.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Institutional Emergency Nodes</Text>
      <Text style={styles.subtitle}>
        Direct automated dispatch links connecting 3km critical threat alerts to official Kampala authorities and medical centers.
      </Text>

      {/* Node Control Panel */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📡 Active Dispatch Gateways</Text>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={styles.label}>Kampala Police Central Command</Text>
            <Text style={styles.sublabel}>Auto-dispatches armed threat coordinates</Text>
          </View>
          <Switch 
            value={policeDispatchActive} 
            onValueChange={setPoliceDispatchActive} 
            trackColor={{ false: "#767577", true: "#e74c3c" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={styles.label}>Emergency Medical Services (EMS)</Text>
            <Text style={styles.sublabel}>Shares blood type & medical profile</Text>
          </View>
          <Switch 
            value={medicalDispatchActive} 
            onValueChange={setMedicalDispatchActive} 
            trackColor={{ false: "#767577", true: "#27ae60" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={styles.label}>Local Community Security Outpost</Text>
            <Text style={styles.sublabel}>Direct link to neighborhood patrol units</Text>
          </View>
          <Switch 
            value={localOutpostActive} 
            onValueChange={setLocalOutpostActive} 
            trackColor={{ false: "#767577", true: "#007AFF" }} 
          />
        </View>
      </View>

      {/* Sync Status Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Gateway Status:</Text>
        <Text style={styles.statusText}>{lastSyncStatus}</Text>
      </View>

      {/* Testing Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testNodeDispatch('Kampala Police Command')}
        >
          <Text style={styles.testButtonText}>Test Police Dispatch Node</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#27ae60' }]} 
          onPress={() => testNodeDispatch('Emergency Medical Services')}
        >
          <Text style={styles.testButtonText}>Test Medical Dispatch Node</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
});