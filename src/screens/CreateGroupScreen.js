import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General Fellowship');

  const categories = ['General Fellowship', 'Church & Prayer', 'Tech & Code', 'Kampala Node', 'Media & Creators'];

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Missing Group Name', 'Please enter a name for your group before creating it.');
      return;
    }

    // Here you would normally insert the new group into your Supabase database table
    Alert.alert(
      'Group Created Successfully! 🚀',
      `"${groupName}" has been created. You are now the Group Administrator.`,
      [
        {
          text: 'Open Chat',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Create New Group Hub 👥</Text>
      <Text style={styles.headerSub}>
        Establish a new community channel, prayer circle, or project workspace with admin moderation controls.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Group Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Kampala Sunday Prayer Cell"
          placeholderTextColor="#94a3b8"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Group Purpose & Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What is the objective or fellowship goal of this group?"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
          value={groupDescription}
          onChangeText={setGroupDescription}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Group Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={handleCreateGroup}>
        <Text style={styles.createBtnText}>Initialize & Launch Group 🚀</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 13,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeCategoryChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  createBtn: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});