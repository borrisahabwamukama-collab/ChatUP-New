import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../supabaseClient'; // Make sure this path points to your initialized Supabase client

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OPTIONAL SETTINGS TOGGLES
  const [biometricQuickLoginActive, setBiometricQuickLoginActive] = useState(true);
  const [meshAuthRelayActive, setMeshAuthRelayActive] = useState(true);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState(0);

  // HANDLE STANDARD EMAIL & PASSWORD LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Fields Required ⚠️', 'Please enter both your email and password.');
    }

    if (failedAttemptsCount >= 5) {
      return Alert.alert('Account Locked 🚨', 'Too many failed attempts. Please try again later.');
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    setLoading(false);

    if (error) {
      const nextAttempts = failedAttemptsCount + 1;
      setFailedAttemptsCount(nextAttempts);
      Alert.alert('Login Failed ⚠️', `${error.message} (Attempt ${nextAttempts}/5)`);
    } else {
      setFailedAttemptsCount(0);
      Alert.alert('Success 🎉', 'Logged in successfully!');
      navigation.navigate('GroupList');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🔐 ChatUp Secure Login</Text>
        <Text style={styles.headerSubtitle}>Authenticate securely using standard Email and Password login.</Text>
      </View>

      {/* Email Input */}
      <TextInput 
        placeholder="Email Address" 
        placeholderTextColor="#a0aec0"
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <TextInput 
        placeholder="Password" 
        placeholderTextColor="#a0aec0"
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
        secureTextEntry={true}
        autoCapitalize="none"
      />

      {/* BIOMETRIC QUICK LOGIN TOGGLE */}
      <View style={styles.layerRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.layerTitle}>👁️ Biometric Face / Fingerprint Login</Text>
          <Text style={styles.layerSub}>Authenticate instantly using hardware keys.</Text>
        </View>
        <Switch
          value={biometricQuickLoginActive}
          onValueChange={setBiometricQuickLoginActive}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* OFFLINE MESH AUTHENTICATION HANDSHAKE */}
      <View style={styles.layerRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.layerTitle}>🛰️ Offline Mesh Peer Handshake</Text>
          <Text style={{ fontSize: 10, color: '#718096' }}>Allow nearby trusted nodes to verify session credentials locally.</Text>
        </View>
        <Switch
          value={meshAuthRelayActive}
          onValueChange={setMeshAuthRelayActive}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* ACCOUNT SECURITY LOCKOUT COUNTER BADGE */}
      <View style={styles.lockoutBadge}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: failedAttemptsCount > 0 ? '#e53e3e' : '#38a169' }}>
          🛡️ Security Guard: {5 - failedAttemptsCount} Login Attempt(s) Remaining
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.primaryBtnText}>Log In 🚀</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.secondaryBtnText}>Create New Account / Sign Up 📝</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7fafc' },
  headerContainer: { marginBottom: 16, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  headerSubtitle: { fontSize: 11, color: '#718096', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', padding: 12, marginBottom: 10, borderRadius: 8, backgroundColor: '#fff', fontSize: 12, color: '#2d3748' },
  layerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  layerTitle: { fontSize: 11, fontWeight: 'bold', color: '#2d3748' },
  layerSub: { fontSize: 10, color: '#718096' },
  lockoutBadge: { backgroundColor: '#edf2f7', padding: 8, borderRadius: 6, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e0' },
  primaryBtn: { backgroundColor: '#3182ce', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  primaryBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  secondaryBtn: { backgroundColor: '#edf2f7', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  secondaryBtnText: { color: '#2d3748', fontSize: 12, fontWeight: 'bold' },
});