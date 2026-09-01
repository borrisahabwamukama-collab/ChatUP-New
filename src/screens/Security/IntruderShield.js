import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';

export default function IntruderShield() {
  const [shieldActive, setShieldActive] = useState(true);
  const [nightVisionBoost, setNightVisionBoost] = useState(true);
  const [decoyMode, setDecoyMode] = useState(true);
  const [shieldStatus, setShieldStatus] = useState("Monitoring active. Ready for facial & motion scan.");
  
  // Duress / Panic PIN State
  const [pinInput, setPinInput] = useState('');
  const [isFakeModeActive, setIsFakeModeActive] = useState(false);
  const DUPRESS_PANIC_PIN = '9999'; // Entering this triggers Fake Chat Mode

  const handlePinSubmit = () => {
    if (pinInput === DUPRESS_PANIC_PIN) {
      setIsFakeModeActive(true);
      setPinInput('');
    } else {
      Alert.alert("Security PIN", "PIN entered or normal access verified.");
      setPinInput('');
    }
  };

  // If Panic Mode is triggered via Duress PIN
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
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AI Biometric Intruder Shield</Text>
      <Text style={styles.subtitle}>
        Advanced front-camera facial analysis, night-vision motion lighting, and Duress Panic PIN integration.
      </Text>

      {/* Settings Panel */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Intruder Shield Active</Text>
          <Switch value={shieldActive} onValueChange={setShieldActive} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Night-Vision Light Boost</Text>
          <Switch value={nightVisionBoost} onValueChange={setNightVisionBoost} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Enable Decoy Mode on Breach</Text>
          <Switch value={decoyMode} onValueChange={setDecoyMode} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>
      </View>

      {/* Duress Panic PIN Input Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Duress PIN / Panic Entry</Text>
        <TextInput 
          style={styles.pinInputBox}
          placeholder="Enter PIN (Try 9999 for Fake Chat)"
          placeholderTextColor="#888"
          secureTextEntry
          keyboardType="numeric"
          value={pinInput}
          onChangeText={setPinInput}
        />
        <TouchableOpacity style={styles.pinButton} onPress={handlePinSubmit}>
          <Text style={styles.pinButtonText}>Submit PIN</Text>
        </TouchableOpacity>
      </View>

      {/* Status Monitor Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Sentinel Status Log:</Text>
        <Text style={styles.statusText}>{shieldStatus}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
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
  pinInputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
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
});