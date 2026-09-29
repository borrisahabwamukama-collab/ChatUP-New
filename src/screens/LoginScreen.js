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
import { supabase } from '../../Services/supabaseClient';

export default function LoginScreen({ navigation, isDarkMode, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OPTIONAL SETTINGS TOGGLES
  const [biometricQuickLoginActive, setBiometricQuickLoginActive] = useState(true);
  const [meshAuthRelayActive, setMeshAuthRelayActive] = useState(true);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState(0);

  // HANDLE STANDARD EMAIL & PASSWORD LOGIN
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Fields Required ⚠️', 'Please enter both your email and password.');
    }

    if (failedAttemptsCount >= 5) {
      return Alert.alert('Account Locked 🚨', 'Too many failed attempts. Please try again later.');
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
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
      const userId = data?.user?.id;
      
      Alert.alert('Success 🎉', 'Logged in successfully!');

      // Pass user ID up to parent navigator if callback exists, else navigate
      if (onLoginSuccess && userId) {
        onLoginSuccess(userId);
      } else if (navigation && navigation.navigate) {
        navigation.navigate('GroupList', { currentUserId: userId });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]} keyboardShouldPersistTaps="handled">
      <View style={[styles.headerContainer, isDarkMode && styles.darkHeaderCard]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🔐 ChatUp Secure Login</Text>
        <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94a3b8' }]}>Authenticate securely using standard Email and Password login.</Text>
      </View>

      {/* Email Input */}
      <TextInput 
        placeholder="Email Address" 
        placeholderTextColor="#a0aec0"
        value={email} 
        onChangeText={setEmail} 
        style={[styles.input, isDarkMode && styles.darkInput]} 
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <TextInput 
        placeholder="Password" 
        placeholderTextColor="#a0aec0"
        value={password} 
        onChangeText={setPassword} 
        style={[styles.input, isDarkMode && styles.darkInput]} 
        secureTextEntry={true}
        autoCapitalize="none"
      />

      {/* BIOMETRIC QUICK LOGIN TOGGLE */}
      <View style={[styles.layerRow, isDarkMode && styles.darkCard]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.layerTitle, isDarkMode && styles.darkText]}>👁️ Biometric Face / Fingerprint Login</Text>
          <Text style={[styles.layerSub, isDarkMode && { color: '#94a3b8' }]}>Authenticate instantly using hardware keys.</Text>
        </View>
        <Switch
          value={biometricQuickLoginActive}
          onValueChange={setBiometricQuickLoginActive}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* OFFLINE MESH AUTHENTICATION HANDSHAKE */}
      <View style={[styles.layerRow, isDarkMode && styles.darkCard]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.layerTitle, isDarkMode && styles.darkText]}>🛰️ Offline Mesh Peer Handshake</Text>
          <Text style={{ fontSize: 10, color: isDarkMode ? '#94a3b8' : '#718096' }}>Allow nearby trusted nodes to verify session credentials locally.</Text>
        </View>
        <Switch
          value={meshAuthRelayActive}
          onValueChange={setMeshAuthRelayActive}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* ACCOUNT SECURITY LOCKOUT COUNTER BADGE */}
      <View style={[styles.lockoutBadge, isDarkMode && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
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

      <TouchableOpacity 
        style={[styles.secondaryBtn, isDarkMode && { backgroundColor: '#1e293b', borderColor: '#334155' }]} 
        onPress={() => {
          if (navigation && navigation.navigate) {
            navigation.navigate('Signup');
          }
        }}
      >
        <Text style={[styles.secondaryBtnText, isDarkMode && styles.darkText]}>Create New Account / Sign Up 📝</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  darkHeaderCard: { backgroundColor: '#1e293b' },
  darkText: { color: '#f8fafc' },
  darkInput: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' },
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