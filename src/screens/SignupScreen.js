import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function SignupScreen({ navigation, isDarkMode, coins, setCoins }) {
  const [email, setEmail] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // LAYER 1: BIOMETRIC & PASSKEY AUTO-ENROLLMENT TOGGLE
  const [biometricEnrollEnabled, setBiometricEnrollEnabled] = useState(true);

  // LAYER 2: MULTI-FACTOR AUTHENTICATION (MFA) SETUP
  const [mfaSetupEnabled, setMfaSetupEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // LAYER 3: CREATOR ACCOUNT & STATION FRANCHISE ROLE
  const [selectedCreatorRole, setSelectedCreatorRole] = useState('Wildlife & Eco Streamer 🌿');
  const creatorRoles = [
    'Wildlife & Eco Streamer 🌿',
    'Kampala Tech & Dev Hub 💡',
    'Afrobeat & Music Producer 🎶',
    'Global News & Media Network 📰',
  ];

  // LAYER 4: TERMS OF SERVICE & COPYRIGHT COMPLIANCE SHIELD
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // STEP 1: TRIGGER SUPABASE EMAIL OTP SIGNUP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      return Alert.alert('Missing Field', 'Please enter your email address.');
    }
    if (!acceptedTerms) {
      return Alert.alert('Compliance Error', 'You must accept the Terms of Service and Copyright Shield agreement.');
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: {
          creator_role: selectedCreatorRole,
          phone: phoneNumber,
          biometric_enabled: biometricEnrollEnabled,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else {
      setShowOtpField(true);
      if (setCoins) setCoins(c => c + 10); // Reward for initiating registration
      Alert.alert(
        'Verification Code Sent 📩',
        `A 6-digit verification code has been dispatched to ${email}. Please check your inbox!`
      );
    }
  };

  // STEP 2: VERIFY OTP CODE AND COMPLETE ACCOUNT PROVISIONING
  const handleVerifyOtp = async () => {
    if (!otpCodeInput.trim()) {
      return Alert.alert('Missing OTP', 'Please enter the 6-digit code sent to your email.');
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCodeInput.trim(),
      type: 'email',
    });

    if (error) {
      setIsLoading(false);
      return Alert.alert('Verification Failed ⚠️', error.message);
    }

    // Upsert creator metadata into user profiles table
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.trim(),
        phone: phoneNumber,
        creator_role: selectedCreatorRole,
        biometric_enabled: biometricEnrollEnabled,
      });
    }

    setIsLoading(false);
    if (setCoins) setCoins(c => c + 100); // Generous reward for successful signup & verification

    Alert.alert(
      'Account Verified & Provisioned 🎉 (+100 🪙)',
      `Welcome aboard! Provisioned with role: ${selectedCreatorRole}.`
    );

    if (navigation && navigation.navigate) {
      navigation.navigate('GroupList');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center', paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>🚀 Create ChatUp Account (Wallet: {coins} 🪙)</Text>
          <Text style={[styles.subtitle, isDarkMode && { color: '#a0aec0' }]}>
            Register your creator passport using secure Email OTP authentication.
          </Text>
        </View>

        {/* Email Input Card */}
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <TextInput 
            placeholder="Email Address" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={email} 
            onChangeText={setEmail} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            autoCapitalize="none" 
            keyboardType="email-address"
            editable={!showOtpField}
          />
        </View>

        {/* Email OTP Code Input Field (Revealed when code is sent) */}
        {showOtpField && (
          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { color: '#3182ce', marginBottom: 6 }]}>
              Enter 6-Digit Email Verification Code:
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput, { marginBottom: 0 }]}
              placeholder="123456"
              placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
              value={otpCodeInput}
              onChangeText={setOtpCodeInput}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
        )}

        {/* LAYER 1: BIOMETRIC & PASSKEY AUTO-ENROLLMENT */}
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Biometric & Passkey Fast-Login</Text>
              <Text style={{ fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096' }}>Enable FaceID / Fingerprint sign-in for secure one-touch access.</Text>
            </View>
            <Switch 
              value={biometricEnrollEnabled} 
              onValueChange={setBiometricEnrollEnabled} 
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
              disabled={showOtpField}
            />
          </View>
        </View>

        {/* LAYER 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Multi-Factor Authentication (MFA)</Text>
              <Text style={{ fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096' }}>Add Mobile Number verification for advanced safety.</Text>
            </View>
            <Switch 
              value={mfaSetupEnabled} 
              onValueChange={setMfaSetupEnabled} 
              trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
              disabled={showOtpField}
            />
          </View>
          {mfaSetupEnabled && (
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput, { marginTop: 10, marginBottom: 0 }]}
              placeholder="Mobile Number (e.g. +256 700 000000)..."
              placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!showOtpField}
            />
          )}
        </View>

        {/* LAYER 3: CREATOR ACCOUNT & STATION FRANCHISE ROLE */}
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Select Creator Role & Station Genre</Text>
          <Text style={{ fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096', marginBottom: 8 }}>Instantly provisions your customized EPG channel category:</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {creatorRoles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.chip, selectedCreatorRole === role && styles.activeChip, isDarkMode && styles.darkChip]}
                onPress={() => !showOtpField && setSelectedCreatorRole(role)}
                disabled={showOtpField}
              >
                <Text style={[styles.chipText, selectedCreatorRole === role && { color: '#fff' }, isDarkMode && selectedCreatorRole !== role && { color: '#cbd5e0' }]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LAYER 4: TERMS OF SERVICE & COPYRIGHT SHIELD */}
        <View style={[styles.card, isDarkMode && styles.darkCard, { paddingVertical: 12 }]}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => !showOtpField && setAcceptedTerms(!acceptedTerms)}
            disabled={showOtpField}
          >
            <Text style={{ fontSize: 16, marginRight: 10, color: acceptedTerms ? '#38a169' : '#cbd5e0' }}>
              {acceptedTerms ? '☑️' : '◻️'}
            </Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#cbd5e0' : '#4a5568', flex: 1, lineHeight: 15 }}>
              I agree to ChatUp Terms of Service, DRM Copyright Protection Shield, and Creator Payout Guidelines.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {!showOtpField ? (
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : null}
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Sending OTP Code...' : 'Sign Up & Send Code 📩'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && { opacity: 0.7 }]} 
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : null}
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Verifying Code...' : 'Verify & Complete Registration 🚀'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, isDarkMode && { backgroundColor: '#2d3748' }, { marginBottom: 8 }]} 
              onPress={() => { setShowOtpField(false); setOtpCodeInput(''); }}
            >
              <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkText]}>Change Email / Edit Info ✏️</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={[styles.secondaryButton, isDarkMode && { backgroundColor: '#2d3748' }]} 
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('Login');
            }
          }}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkText]}>Already have an account? Log In 🔐</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerContainer: { marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#718096', lineHeight: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', padding: 12, marginBottom: 10, borderRadius: 8, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 13 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  chip: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  darkChip: { backgroundColor: '#1a202c', borderWidth: 1, borderColor: '#4a5568' },
  activeChip: { backgroundColor: '#3182ce' },
  chipText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  primaryButton: { backgroundColor: '#38a169', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4, flexDirection: 'row', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#edf2f7', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#4a5568', fontSize: 13, fontWeight: 'bold' },
  darkText: { color: '#fff' },
});