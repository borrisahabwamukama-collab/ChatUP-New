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
  // Core Auth & Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Complete Profile Fields
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [bio, setBio] = useState('');

  // LAYER 1: BIOMETRIC & PASSKEY AUTO-ENROLLMENT TOGGLE
  const [biometricEnrollEnabled, setBiometricEnrollEnabled] = useState(true);

  // LAYER 2: MULTI-FACTOR AUTHENTICATION (MFA) SETUP
  const [mfaSetupEnabled, setMfaSetupEnabled] = useState(false);

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

  // DIRECT PASSWORD SIGNUP WITH FULL PROFILE METADATA
  const handleRegisterWithPassword = async () => {
    if (!email.trim() || !password || !fullName.trim()) {
      return Alert.alert('Missing Fields ⚠️', 'Please fill in your Display Name, Email, and Password.');
    }
    if (password.length < 6) {
      return Alert.alert('Weak Password ⚠️', 'Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch ⚠️', 'Passwords do not match.');
    }
    if (!acceptedTerms) {
      return Alert.alert('Compliance Error ⚠️', 'You must accept the Terms of Service and Copyright Shield agreement.');
    }

    setIsLoading(true);

    const formattedHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim() || email.split('@')[0]}`;

    // 1. Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          handle: formattedHandle,
          phone: phoneNumber.trim(),
          country: country.trim(),
          date_of_birth: dateOfBirth.trim(),
          hobbies: hobbies.trim(),
          bio: bio.trim(),
          creator_role: selectedCreatorRole,
          biometric_enabled: biometricEnrollEnabled,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      return Alert.alert('Registration Failed ❌', error.message);
    }

    // Safely resolve user ID with session fallback
    let userId = data?.user?.id;
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;
    }

    // 2. Explicitly write/upsert record into the profiles table with all fields populated
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        username: formattedHandle,
        full_name: fullName.trim(),
        phone: phoneNumber.trim(),
        country: country.trim(),
        date_of_birth: dateOfBirth.trim(),
        hobbies: hobbies.trim(),
        bio: bio.trim(),
        creator_role: selectedCreatorRole,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        total_likes: 0,
      }, { onConflict: 'id' });

      if (profileError) {
        console.warn('Profile upsert warning:', profileError.message);
      }
    } else {
      console.warn('Could not resolve user ID for profile upsert.');
    }

    setIsLoading(false);
    if (setCoins) setCoins(c => c + 100);

    Alert.alert(
      'Account Created Successfully! 🎉 (+100 🪙)',
      `Welcome aboard, ${fullName}! Your creator profile is ready.`
    );

    if (navigation && navigation.navigate) {
      navigation.navigate('GroupList', { currentUserId: userId });
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
            Register instantly using email and password authentication.
          </Text>
        </View>

        {/* COMPREHENSIVE PROFILE & CREDENTIALS CARD */}
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { color: '#3182ce', marginBottom: 8 }]}>
            👤 Creator Profile & Security Passcode
          </Text>

          <Text style={styles.inputLabel}>Display Name *</Text>
          <TextInput 
            placeholder="e.g. Borris" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={fullName} 
            onChangeText={setFullName} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
          />

          <Text style={styles.inputLabel}>Handle</Text>
          <TextInput 
            placeholder="e.g. @borris" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={handle} 
            onChangeText={setHandle} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput 
            placeholder="name@example.com" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={email} 
            onChangeText={setEmail} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Password *</Text>
          <TextInput 
            placeholder="At least 6 characters..." 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={password} 
            onChangeText={setPassword} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Confirm Password *</Text>
          <TextInput 
            placeholder="Re-enter password..." 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput 
            placeholder="+256 770 000000" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={phoneNumber} 
            onChangeText={setPhoneNumber} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Country / Region</Text>
          <TextInput 
            placeholder="e.g. Uganda" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={country} 
            onChangeText={setCountry} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
          />

          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TextInput 
            placeholder="Month Day, Year (e.g. April 4)" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={dateOfBirth} 
            onChangeText={setDateOfBirth} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
          />

          <Text style={styles.inputLabel}>Hobbies & Interests</Text>
          <TextInput 
            placeholder="e.g. Coding, Football, Nature" 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={hobbies} 
            onChangeText={setHobbies} 
            style={[styles.input, isDarkMode && styles.darkInput]} 
          />

          <Text style={styles.inputLabel}>Bio & Channel Description</Text>
          <TextInput 
            placeholder="Write a short bio..." 
            placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
            value={bio} 
            onChangeText={setBio} 
            style={[styles.input, isDarkMode && styles.darkInput, { height: 60, textAlignVertical: 'top', marginBottom: 0 }]} 
            multiline
          />
        </View>

        {/* LAYER 1: BIOMETRIC & PASSKEY AUTO-ENROLLMENT */}
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Biometric & Passkey Fast-Login</Text>
              <Text style={{ fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096' }}>Enable FaceID / Fingerprint sign-in for secure one-touch access.</Text>
            </View>
            <Switch 
              value={biometricEnrollEnabled} 
              onValueChange={setBiometricEnrollEnabled} 
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>
        </View>

        {/* LAYER 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Multi-Factor Authentication (MFA)</Text>
              <Text style={{ fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096' }}>Add secondary verification for advanced safety.</Text>
            </View>
            <Switch 
              value={mfaSetupEnabled} 
              onValueChange={setMfaSetupEnabled} 
              trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
            />
          </View>
        </View>

        {/* LAYER 3: CREATOR ACCOUNT & STATION FRANCHISE ROLE */}
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Select Creator Role & Station Genre</Text>
          <Text style={{ fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096', marginBottom: 8 }}>Instantly provisions your customized EPG channel category:</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {creatorRoles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.chip, selectedCreatorRole === role && styles.activeChip, isDarkMode && styles.darkChip]}
                onPress={() => setSelectedCreatorRole(role)}
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
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <Text style={{ fontSize: 16, marginRight: 10, color: acceptedTerms ? '#38a169' : '#cbd5e0' }}>
              {acceptedTerms ? '☑️' : '◻️'}
            </Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#cbd5e0' : '#4a5568', flex: 1, lineHeight: 15 }}>
              I agree to ChatUp Terms of Service, DRM Copyright Protection Shield, and Creator Payout Guidelines.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && { opacity: 0.7 }]} 
          onPress={handleRegisterWithPassword}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : null}
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Creating Account...' : 'Register Permanent Account 🚀'}
          </Text>
        </TouchableOpacity>

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
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', marginBottom: 2, marginTop: 6 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', padding: 10, marginBottom: 6, borderRadius: 8, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
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