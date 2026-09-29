import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function EditProfileSection({
  isDarkMode,
  isEditing,
  setIsEditing,
  username,
  setUsername,
  handle,
  setHandle,
  phoneNumber,
  country,
  setCountry,
  dateOfBirth,
  setDateOfBirth,
  hobbies,
  setHobbies,
  bio,
  setBio,
  onPressChangePhone,
  onSave
}) {
  return (
    <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 14 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>✏️ Edit Profile & Bio</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 12 }}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Display Name</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={username}
        editable={isEditing}
        onChangeText={setUsername}
        placeholder="Enter display name..."
        placeholderTextColor="#a0aec0"
      />

      <Text style={styles.inputLabel}>Handle</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={handle}
        editable={isEditing}
        onChangeText={setHandle}
        placeholder="@handle..."
        placeholderTextColor="#a0aec0"
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Text style={styles.inputLabel}>Phone Number (Protected)</Text>
        <TouchableOpacity onPress={onPressChangePhone}>
          <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold' }}>Change Phone 📱</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, { backgroundColor: '#edf2f7' }, isDarkMode && styles.darkInput]}
        value={phoneNumber}
        editable={false}
        placeholder="No phone number bound"
        placeholderTextColor="#a0aec0"
      />

      <Text style={styles.inputLabel}>Country / Region</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={country}
        editable={isEditing}
        onChangeText={setCountry}
        placeholder="Country..."
        placeholderTextColor="#a0aec0"
      />

      <Text style={styles.inputLabel}>Date of Birth</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={dateOfBirth}
        editable={isEditing}
        onChangeText={setDateOfBirth}
        placeholder="Month Day, Year"
        placeholderTextColor="#a0aec0"
      />

      <Text style={styles.inputLabel}>Hobbies & Interests</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        value={hobbies}
        editable={isEditing}
        onChangeText={setHobbies}
        placeholder="Your hobbies..."
        placeholderTextColor="#a0aec0"
      />

      <Text style={styles.inputLabel}>Bio & Channel Description</Text>
      <TextInput
        style={[styles.input, { height: 70, textAlignVertical: 'top' }, isDarkMode && styles.darkInput]}
        value={bio}
        editable={isEditing}
        multiline
        onChangeText={setBio}
        placeholder="Write a short bio..."
        placeholderTextColor="#a0aec0"
      />

      {isEditing && (
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>Save Profile Changes 💾</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12, marginBottom: 4 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  saveBtn: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});