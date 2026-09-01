import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function ChurchTestimoniesScreen({ isDarkMode }) {
  const [testimonyText, setTestimonyText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [testimoniesList, setTestimoniesList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      const { data, error } = await supabase
        .from('church_testimonies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data || data.length === 0) {
        setTestimoniesList([
          {
            id: '1',
            author: 'Brother Brian',
            text: 'Praise God! My family was wonderfully provided for this week when we needed it most.',
            category: 'Provision',
            video_url: '',
            likes: 12,
            created_at: '2 hours ago',
          },
          {
            id: '2',
            author: 'Sister Asifa',
            text: 'Healing testimony: Giving thanks to the Almighty for complete recovery and grace.',
            category: 'Healing',
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            likes: 19,
            created_at: 'Yesterday',
          },
        ]);
      } else {
        setTestimoniesList(data);
      }
    } catch (err) {
      console.log('Error fetching testimonies:', err);
    }
  };

  const handlePostTestimony = async () => {
    if (!testimonyText.trim() || !authorName.trim()) {
      Alert.alert('Missing Information', 'Please enter your name and your testimony/praise report.');
      return;
    }

    const newEntry = {
      author: authorName.trim(),
      text: testimonyText.trim(),
      category: filterCategory === 'All' ? 'General' : filterCategory,
      video_url: videoUrlInput.trim(),
      likes: 0,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('church_testimonies').insert([newEntry]);
      if (error) throw error;

      setTestimonyText('');
      setAuthorName('');
      setVideoUrlInput('');
      fetchTestimonies();
      Alert.alert('Testimony Shared 🙏', 'Your praise report and video testimony have been published to the church community.');
    } catch (error) {
      setTestimoniesList(prev => [
        { id: Date.now().toString(), ...newEntry, created_at: 'Just now' },
        ...prev
      ]);
      setTestimonyText('');
      setAuthorName('');
      setVideoUrlInput('');
      Alert.alert('Testimony Shared 🙏', 'Your praise report has been published locally.');
    }
  };

  const handleLikeTestimony = async (id, currentLikes) => {
    setTestimoniesList(prev =>
      prev.map(item => item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item)
    );
    try {
      await supabase.from('church_testimonies').update({ likes: (currentLikes || 0) + 1 }).eq('id', id);
    } catch (e) {}
  };

  const filteredList = testimoniesList.filter(item => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>⛪ Church Testimonies & Video Sanctuary</Text>
        <Text style={styles.headerSub}>Share your written praise reports or recorded video testimonies to glorify God and inspire the fellowship.</Text>
        
        {/* Category Filter Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {['All', 'Healing', 'Provision', 'Miracles', 'General'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filterCategory === cat && styles.activeFilterChip]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.filterChipText, filterCategory === cat && styles.activeFilterChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={true}>
        {/* Post Form Card with Video Link Support */}
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>✍️ Share Your Testimony & Video Record</Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Your Name or Handle (e.g., @borris)"
            placeholderTextColor="#a0aec0"
            value={authorName}
            onChangeText={setAuthorName}
          />
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Video Recording URL (e.g., MP4 link or camera recording URL)"
            placeholderTextColor="#a0aec0"
            value={videoUrlInput}
            onChangeText={setVideoUrlInput}
          />
          <TextInput
            style={[styles.inputMulti, isDarkMode && styles.darkInput]}
            placeholder="Write your detailed praise report or testimony here..."
            placeholderTextColor="#a0aec0"
            multiline
            numberOfLines={4}
            value={testimonyText}
            onChangeText={setTestimonyText}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handlePostTestimony}>
            <Text style={styles.primaryBtnText}>Publish Testimony & Video 🎥✨</Text>
          </TouchableOpacity>
        </View>

        {/* Community Feed */}
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>📖 Community Feed ({filteredList.length})</Text>
        
        {filteredList.length > 0 ? (
          filteredList.map(item => (
            <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
              <View style={styles.itemHeaderRow}>
                <Text style={[styles.itemAuthor, isDarkMode && styles.darkText]}>{item.author || '@believer'}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category || 'General'}</Text>
                </View>
              </View>

              <Text style={[styles.itemText, isDarkMode && styles.darkText]}>{item.text}</Text>

              {item.video_url ? (
                <View style={styles.videoPlayerContainer}>
                  <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: 'bold', marginBottom: 4 }}>📹 Attached Recorded Video Testimony</Text>
                  <Text style={{ fontSize: 10, color: '#64748b' }} numberOfLines={1}>{item.video_url}</Text>
                </View>
              ) : null}

              <View style={styles.itemFooterRow}>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>🕒 {item.created_at || 'Recent'}</Text>
                <TouchableOpacity 
                  style={styles.likeBtn} 
                  onPress={() => handleLikeTestimony(item.id, item.likes)}
                >
                  <Text style={{ fontSize: 12, color: '#e53e3e', fontWeight: '600' }}>❤️ {item.likes || 0} Praise Amen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 20 }}>No testimonies found in this category.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  headerSub: { fontSize: 11, color: '#64748b', lineHeight: 16 },
  filterChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e0' },
  activeFilterChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  activeFilterChipText: { color: '#ffffff' },
  scrollArea: { padding: 16, paddingBottom: 140 }, // Generous padding so everything scrolls fully into view
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  inputMulti: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, height: 90, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10, textAlignVertical: 'top' },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemAuthor: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  categoryBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#1d4ed8' },
  itemText: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 10 },
  videoPlayerContainer: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e0' },
  itemFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  likeBtn: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
});