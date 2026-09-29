import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { AiSupervisorEngine } from '../../../Services/AiSupervisorEngine'; // ✅ Four levels up (correct)

export default function AiSupervisorHud({ isDarkMode }) {
  const [supervisorActive, setSupervisorActive] = useState(true);
  const [liveLogs, setLiveLogs] = useState([
    `[${new Date().toLocaleTimeString()}] 🤖 AI Supervisor core armed & scanning Kampala mesh...`
  ]);

  useEffect(() => {
    let engine = null;
    if (supervisorActive) {
      engine = new AiSupervisorEngine((newLog) => {
        setLiveLogs(prev => [newLog, ...prev.slice(0, 15)]);
      });
      engine.startLiveSupervision();
    }

    return () => {
      if (engine) {
        engine.stopLiveSupervision();
      }
    };
  }, [supervisorActive]);

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#805ad5', borderWidth: 1.5 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={[styles.sectionHeader, { color: '#805ad5', marginBottom: 0 }]}>🧠 Live AI Supervisor Telemetry</Text>
        <Switch
          value={supervisorActive}
          onValueChange={setSupervisorActive}
          trackColor={{ false: '#767577', true: '#805ad5' }}
          thumbColor="#fff"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>

      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>
        Autonomous smart-city agent evaluating threat escalation and dispatch triage in real-time.
      </Text>

      <View style={[styles.terminalBox, isDarkMode && styles.darkInnerCard]}>
        <ScrollView contentContainerStyle={{ padding: 6 }} nestedScrollEnabled={true}>
          {liveLogs.map((log, index) => (
            <Text key={index} style={styles.terminalText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  terminalBox: {
    backgroundColor: '#1a202c',
    borderRadius: 8,
    height: 120,
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  terminalText: {
    fontSize: 10,
    color: '#68d391',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});