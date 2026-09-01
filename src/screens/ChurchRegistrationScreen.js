import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function ChurchRegistrationScreen({ navigation }) {
  const [churchName, setChurchName] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [district, setDistrict] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [phone, setPhone] = useState('');
  const [logoImageUrl, setLogoImageUrl] = useState('');

  const handleSubmitRequest = () => {
    if (!churchName || !pastorName || !district || !phone) {
      Alert.alert('Missing Details', 'Please fill out all mandatory fields to submit your church for verification.');
      return;
    }

    // Construct the database payload structure: church_requests / request_id
    const churchRequestPayload = {
      churchName: churchName.trim(),
      pastorName: pastorName.trim(),
      district: district.trim(),
      country: country.trim(),
      phone: phone.trim(),
      logoImageUrl: logoImageUrl.trim() || 'https://via.placeholder.com/150',
      submittedByUserId: 'current_user_id_123', // Replace with active session user ID
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      createdAt: Date.now(),
    };

    // TODO: Send churchRequestPayload to your backend or Supabase database table 'church_requests'
    console.log('Submitting Church Request:', churchRequestPayload);

    Alert.alert(
      'Verification Request Sent 🙏',
      'Your church registration has been submitted to the Super-Admin. Access to live streaming and sanctuary administration will be unlocked once approved.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>⛪ Church Sanctuary Verification</Text>
        <Text style={styles.subText}>
          To maintain spiritual integrity, every sanctuary must be verified by the administration before broadcasting or managing services.
        </Text>

        <Text style={styles.label}>Church Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Watoto Church"
          placeholderTextColor="#94a3b8"
          value={churchName}
          onChangeText={setChurchName}
        />

        <Text style={styles.label}>Senior Pastor / Leader Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Pastor John"
          placeholderTextColor="#94a3b8"
          value={pastorName}
          onChangeText={setPastorName}
        />

        <Text style={styles.label}>District / City *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Kampala"
          placeholderTextColor="#94a3b8"
          value={district}
          onChangeText={setDistrict}
        />

        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Uganda"
          placeholderTextColor="#94a3b8"
          value={country}
          onChangeText={setCountry}
        />

        <Text style={styles.label}>Contact Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., +256700000000"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Church Logo / Banner Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/logo.png"
          placeholderTextColor="#94a3b8"
          value={logoImageUrl}
          onChangeText={setLogoImageUrl}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRequest}>
          <Text style={styles.submitBtnText}>Submit for Super-Admin Approval 🛡️</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 13,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});