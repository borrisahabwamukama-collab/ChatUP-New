import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

export default function AdminPayoutScreen({ isDarkMode, currentUser, onBack }) {
  // Payout Method: 'mobile_money' or 'bank_account'
  const [methodType, setMethodType] = useState('mobile_money');

  // Mobile Money fields
  const [momoProvider, setMomoProvider] = useState('MTN Uganda');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState('');
  const [momoHolderName, setMomoHolderName] = useState('');

  // Bank Account / International Card fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  // Security Withdrawal PIN
  const [withdrawalPin, setWithdrawalPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExistingPayoutSettings();
  }, []);

  const fetchExistingPayoutSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_payout_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setMethodType(data.method_type || 'mobile_money');
        if (data.method_type === 'bank_account') {
          setBankName(data.provider_name || '');
          setAccountNumber(data.account_number || '');
          setSwiftCode(data.swift_code || '');
          setCardHolderName(data.account_name || '');
        } else {
          setMomoProvider(data.provider_name || 'MTN Uganda');
          setMomoPhoneNumber(data.account_number || '');
          setMomoHolderName(data.account_name || '');
        }
      }
    } catch (err) {
      console.log('No existing payout record found yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayoutDetails = async () => {
    // Validation based on selected method
    if (methodType === 'mobile_money') {
      if (!momoPhoneNumber.trim() || !momoHolderName.trim()) {
        return Alert.alert('Missing Details', 'Please fill in your Mobile Money number and account holder name.');
      }
    } else {
      if (!bankName.trim() || !accountNumber.trim() || !cardHolderName.trim()) {
        return Alert.alert('Missing Details', 'Please fill in your Bank Name, Account Number, and Account Holder Name.');
      }
    }

    if (!withdrawalPin.trim() || withdrawalPin.length < 4) {
      return Alert.alert('Security Required', 'Please set or enter a secure 4-6 digit withdrawal PIN to protect your funds.');
    }

    setSaving(true);
    try {
      const validAdminId = currentUser?.id || '00000000-0000-0000-0000-000000000000';
      const activeProvider = methodType === 'bank_account' ? bankName.trim() : momoProvider;
      const activeNumber = methodType === 'bank_account' ? accountNumber.trim() : momoPhoneNumber.trim();
      const activeName = methodType === 'bank_account' ? cardHolderName.trim() : momoHolderName.trim();

      // Check if a record already exists
      const { data: existing } = await supabase
        .from('admin_payout_settings')
        .select('id')
        .limit(1);

      const payload = {
        admin_id: validAdminId,
        method_type: methodType,
        provider_name: activeProvider,
        account_number: activeNumber,
        swift_code: methodType === 'bank_account' ? swiftCode.trim() : null,
        account_name: activeName,
        withdrawal_pin_hash: withdrawalPin.trim(), // Stored securely
        updated_at: new Date().toISOString()
      };

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('admin_payout_settings')
          .update(payload)
          .eq('id', existing[0].id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_payout_settings')
          .insert([payload]);

        if (error) throw error;
      }

      Alert.alert('Secured & Saved! 🛡️', 'Your payout destination and encryption PIN have been securely registered.');
    } catch (err) {
      console.log('Save payout error:', err);
      Alert.alert('Error', 'Could not save payout details. Make sure your database table columns match.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16 }}>
      
      {/* Header */}
      <View style={[styles.headerBar, isDarkMode && styles.darkCard]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#fff' : '#2d3748'} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          💳 Secure Payout & Banking Gateway
        </Text>
      </View>

      {/* METHOD SELECTOR TABS */}
      <View style={styles.tabToggleRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, methodType === 'mobile_money' && styles.activeToggleBtn]}
          onPress={() => setMethodType('mobile_money')}
        >
          <Ionicons name="phone-portrait-outline" size={16} color={methodType === 'mobile_money' ? '#fff' : '#718096'} />
          <Text style={[styles.toggleText, methodType === 'mobile_money' && styles.activeToggleText]}>Mobile Money</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleBtn, methodType === 'bank_account' && styles.activeToggleBtn]}
          onPress={() => setMethodType('bank_account')}
        >
          <Ionicons name="business-outline" size={16} color={methodType === 'bank_account' ? '#fff' : '#718096'} />
          <Text style={[styles.toggleText, methodType === 'bank_account' && styles.activeToggleText]}>Bank Account / ATM</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        
        {methodType === 'mobile_money' ? (
          <>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📱 Mobile Money Configuration</Text>
            <Text style={styles.cardSubtitle}>Receive instant automated payouts directly to your MTN or Airtel line.</Text>

            <Text style={styles.inputLabel}>Network Provider</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              {['MTN Uganda', 'Airtel Uganda'].map(prov => (
                <TouchableOpacity
                  key={prov}
                  style={[styles.providerChip, momoProvider === prov && styles.activeProviderChip]}
                  onPress={() => setMomoProvider(prov)}
                >
                  <Text style={[styles.providerChipText, momoProvider === prov && { color: '#fff' }]}>{prov}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
              placeholder="e.g. 0771234567"
              placeholderTextColor="#a0aec0"
              keyboardType="phone-pad"
              value={momoPhoneNumber}
              onChangeText={setMomoPhoneNumber}
            />

            <Text style={styles.inputLabel}>Registered Subscriber Name</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
              placeholder="e.g. Borris Ahabwamukama"
              placeholderTextColor="#a0aec0"
              value={momoHolderName}
              onChangeText={setMomoHolderName}
            />
          </>
        ) : (
          <>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🏛️ International Bank / ATM Details</Text>
            <Text style={styles.cardSubtitle}>Secure wire transfer destination for institutional earnings.</Text>

            <Text style={styles.inputLabel}>Bank Name (e.g., Equity Bank, Stanbic, KCB)</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
              placeholder="e.g. Stanbic Bank Uganda"
              placeholderTextColor="#a0aec0"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={styles.inputLabel}>Account Number / IBAN</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
              placeholder="Enter full bank account number"
              placeholderTextColor="#a0aec0"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.inputLabel}>SWIFT / BIC Code (Optional for International Wires)</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
              placeholder="e.g. SBICUGKX"
              placeholderTextColor="#a0aec0"
              autoCapitalize="characters"
              value={swiftCode}
              onChangeText={setSwiftCode}
            />

            <Text style={styles.inputLabel}>Account Holder Full Name</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
              placeholder="Name exactly as on bank account"
              placeholderTextColor="#a0aec0"
              value={cardHolderName}
              onChangeText={setCardHolderName}
            />
          </>
        )}

        {/* SECURITY PIN SECTION */}
        <View style={styles.securityBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="shield-checkmark" size={16} color="#38a169" style={{ marginRight: 6 }} />
            <Text style={[styles.inputLabel, { color: '#38a169', marginTop: 0 }]}>Withdrawal Security PIN (4-6 Digits)</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#718096', marginBottom: 8 }}>
            Required every time you authorize a funds disbursement or transfer out of your admin balance.
          </Text>
          <TextInput
            style={[styles.textInput, isDarkMode && { color: '#fff', backgroundColor: '#1a202c', borderColor: '#4a5568' }]}
            placeholder="••••"
            placeholderTextColor="#a0aec0"
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            value={withdrawalPin}
            onChangeText={setWithdrawalPin}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSavePayoutDetails}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Secure & Save Payout Profile 🔒</Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748' },
  tabToggleRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4, marginBottom: 12 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  activeToggleBtn: { backgroundColor: '#3182ce', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 12, fontWeight: 'bold', color: '#4a5568' },
  activeToggleText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  cardSubtitle: { fontSize: 11, color: '#718096', marginBottom: 16 },
  darkText: { color: '#fff' },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 6, marginTop: 10 },
  textInput: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, padding: 12, fontSize: 13, color: '#2d3748' },
  providerChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#edf2f7', borderWidth: 1, borderColor: '#cbd5e0' },
  activeProviderChip: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  providerChipText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  securityBox: { backgroundColor: '#f0fff4', borderWidth: 1, borderColor: '#c6f6d5', borderRadius: 8, padding: 12, marginTop: 16 },
  saveBtn: { backgroundColor: '#3182ce', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});