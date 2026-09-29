import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function CreateGroupScreen({ navigation, currentUser, isDarkMode }) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [adminHandle, setAdminHandle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General Fellowship');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['General Fellowship', 'Church & Prayer', 'Tech & Code', 'Kampala Node', 'Media & Creators'];

  useEffect(() => {
    if (currentUser) {
      const realHandle = currentUser.user_metadata?.handle || 
                         `@${currentUser.email?.split('@')[0] || 'admin'}`;
      setAdminHandle(realHandle);
    }
  }, [currentUser]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Missing Group Name ❌', 'Please enter a name for your group before creating it.');
      return;
    }

    setIsSubmitting(true);

    // Payload tuned for the community_groups table
    const newGroupPayload = {
      name: groupName.trim(),
      description: groupDescription.trim() || 'A new community space for fellowship and collaboration.',
      category: selectedCategory,
    };

    try {
      // 🚀 Pointed directly to your actual 'community_groups' table
      const { data, error } = await supabase
        .from('community_groups')
        .insert([newGroupPayload])
        .select();

      if (error) {
        Alert.alert('Supabase Database Error 🛑', error.message || JSON.stringify(error));
        console.error('Supabase Group Creation Error Details:', error);
        return;
      }

      Alert.alert(
        'Group Created & Secured! 🚀',
        `"${groupName}" is now live in community groups.`,
        [
          {
            text: 'Return to Hub',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Exception Caught ❌', err.message || String(err));
      console.error('Supabase Group Creation Exception:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Create Standard Group Hub 👥</Text>
      <Text style={styles.headerSub}>
        Establish a live community channel for fellowship and collaboration.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Group Name *</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="e.g., Kampala Sunday Prayer Cell"
          placeholderTextColor="#94a3b8"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Assigned Community Admin / Leader *</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="e.g., @Borris"
          placeholderTextColor="#94a3b8"
          value={adminHandle}
          onChangeText={setAdminHandle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Group Purpose & Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
          placeholder="What is the objective or fellowship goal of this group?"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
          value={groupDescription}
          onChangeText={setGroupDescription}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Group Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                isDarkMode && styles.darkCategoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isDarkMode && styles.darkCategoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        style={[styles.createBtn, isSubmitting && { opacity: 0.7 }]} 
        onPress={handleCreateGroup}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.createBtnText}>Initializing Secure Group...</Text>
          </View>
        ) : (
          <Text style={styles.createBtnText}>Initialize & Launch Group 🚀</Text>
        )}
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
  darkContainer: {
    backgroundColor: '#1a202c',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  darkText: {
    color: '#ffffff',
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
  darkLabel: {
    color: '#cbd5e0',
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
  darkInput: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
    color: '#ffffff',
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
  darkCategoryChip: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
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
  darkCategoryChipText: {
    color: '#cbd5e0',
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