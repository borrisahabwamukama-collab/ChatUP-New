import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import IntruderShield from './IntruderShield';
import NeighborhoodSOSScreen from './NeighborhoodSOSScreen';
import InstitutionalNodeScreen from './InstitutionalNodeScreen';

export default function SecurityHubScreen({ isDarkMode }) {
  const [activeSubScreen, setActiveSubScreen] = useState(null);

  if (activeSubScreen === 'IntruderShield') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubScreen(null)}>
          <Text style={styles.backButtonText}>← Back to Security Hub</Text>
        </TouchableOpacity>
        <IntruderShield />
      </View>
    );
  }

  if (activeSubScreen === 'NeighborhoodSOS') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubScreen(null)}>
          <Text style={styles.backButtonText}>← Back to Security Hub</Text>
        </TouchableOpacity>
        <NeighborhoodSOSScreen />
      </View>
    );
  }

  if (activeSubScreen === 'InstitutionalNodes') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubScreen(null)}>
          <Text style={styles.backButtonText}>← Back to Security Hub</Text>
        </TouchableOpacity>
        <InstitutionalNodeScreen />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🛡️ ChatUP Security Center</Text>
      <Text style={styles.subtitle}>
        Manage your advanced biometric privacy shields, wide-radius neighborhood SOS, and official institutional dispatch gateways.
      </Text>

      {/* Module 1: Intruder Shield */}
      <TouchableOpacity 
        style={[styles.card, isDarkMode && styles.darkCard]} 
        onPress={() => setActiveSubScreen('IntruderShield')}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>AI Biometric Intruder Shield</Text>
        <Text style={styles.cardDesc}>
          Front-camera facial scanning, night-vision motion boost, and Duress Panic PIN (Fake Chat mode).
        </Text>
      </TouchableOpacity>

      {/* Module 2: Neighborhood SOS */}
      <TouchableOpacity 
        style={[styles.card, styles.sosCardBorder, isDarkMode && styles.darkCard]} 
        onPress={() => setActiveSubScreen('NeighborhoodSOS')}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Neighborhood Watch SOS</Text>
        <Text style={styles.cardDesc}>
          Verified emergency profile cards, live responder feeds, and 3km critical threat broadcasting.
        </Text>
      </TouchableOpacity>

      {/* Module 3: Institutional Nodes */}
      <TouchableOpacity 
        style={[styles.card, isDarkMode && styles.darkCard]} 
        onPress={() => setActiveSubScreen('InstitutionalNodes')}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Institutional Emergency Nodes</Text>
        <Text style={styles.cardDesc}>
          Direct automated dispatch gateways linking security alerts to Kampala police and medical centers.
        </Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  darkCard: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
  },
  sosCardBorder: {
    borderColor: '#ffcdd2',
    backgroundColor: '#fff8f8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  darkText: {
    color: '#fff',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#3182ce',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});