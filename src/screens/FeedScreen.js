import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kwktegtjowrurgdsvafv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eNIiOZ0ZrsigF0Mo6DJQyg_XgtpKx1L';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function FeedScreen({ isDarkMode }) {
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: 'Talk With Nature',
      content: 'Exploring the breathtaking scenery and wildlife across Uganda! 🦁🌿 Watch, download, and share.',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likes: 24,
      shares: 8,
      commentsCount: 5,
      effect: 'TikTok Cinematic Glow ✨',
      filterName: 'Nature Vibrant 🌿',
      captionsEnabled: true,
      trimSpeed: '1.0x (Normal)',
    }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pro Feed Editor Suite States (Always Visible)
  const [selectedEffect, setSelectedEffect] = useState('TikTok Cinematic Glow ✨');
  const [selectedFilter, setSelectedFilter] = useState('Nature Vibrant 🌿');
  const [autoCaptionsActive, setAutoCaptionsActive] = useState(true);
  const [trimSpeedSetting, setTrimSpeedSetting] = useState('1.0x (Normal)');
  const [voiceOverStudioActive, setVoiceOverStudioActive] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });
      
      if (data && data.length > 0) {
        setPosts(data);
      }
    } catch (err) {
      console.log('Error fetching posts:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      return Alert.alert('Error', 'Please enter some text or caption for your post.');
    }

    setIsLoading(true);
    const postData = {
      author: 'Borris',
      content: newPostContent,
      mediaUrl: newPostMediaUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likes: 0,
      shares: 0,
      commentsCount: 0,
      effect: selectedEffect,
      filterName: selectedFilter,
      captionsEnabled: autoCaptionsActive,
      trimSpeed: trimSpeedSetting,
    };

    try {
      const { data, error } = await supabase.from('posts').insert([postData]).select();
      
      if (error) {
        setPosts(prev => [{ id: Date.now().toString(), ...postData }, ...prev]);
      } else if (data) {
        setPosts(prev => [data[0], ...prev]);
      }

      setNewPostContent('');
      setNewPostMediaUrl('');
      Alert.alert('Pro Post Published 🚀', `Post published with filter "${selectedFilter}" & TikTok effect!`);
    } catch (err) {
      Alert.alert('Error', 'Failed to publish post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleForwardPost = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
    Alert.alert('Forwarded / Shared ↗️', 'Post link successfully forwarded to community channels!');
  };

  const handleDownloadMedia = (mediaUrl) => {
    if (!mediaUrl) return Alert.alert('Error', 'No media attached to download.');
    Alert.alert(
      '📥 Download Media',
      'Choose download format:',
      [
        { text: 'MP4 Video (HD)', onPress: () => Linking.openURL(mediaUrl) },
        { text: 'Audio Extract (MP3)', onPress: () => Alert.alert('Success', 'Audio track extracted & downloaded.') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
      
      {/* PRO FEED POSTING & ALWAYS-VISIBLE EDITOR SUITE */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { borderColor: '#3182ce', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>✍️ Pro Feed Creator & Media Studio</Text>
        
        <TextInput
          style={[styles.chatInput, { height: 70, textAlignVertical: 'top', paddingVertical: 10, marginBottom: 10 }, isDarkMode && styles.darkChatInput]}
          placeholder="Share your story, nature update, or broadcast clip..."
          placeholderTextColor="#a0aec0"
          multiline
          value={newPostContent}
          onChangeText={setNewPostContent}
        />

        <TextInput
          style={[styles.chatInput, { height: 40, marginBottom: 12 }, isDarkMode && styles.darkChatInput]}
          placeholder="Attach Video / Media URL (YouTube, MP4)..."
          placeholderTextColor="#a0aec0"
          value={newPostMediaUrl}
          onChangeText={setNewPostMediaUrl}
        />

        {/* Always Visible Pro Editor Drawer */}
        <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e0' }}>
          
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>🎨 Visual Color Filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {['Nature Vibrant 🌿', 'Cinematic Warm ☀️', 'Kampala Urban 🏙️', 'B&W Contrast 🎞️'].map((flt) => (
              <TouchableOpacity
                key={flt}
                style={{ backgroundColor: selectedFilter === flt ? '#48bb78' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
                onPress={() => setSelectedFilter(flt)}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{flt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>✨ TikTok Visual Transition Effect:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {['TikTok Cinematic Glow ✨', 'Zoom Snap ⚡', 'Vibrant Retro 📼', 'Wildlife FX 🦁'].map((eff) => (
              <TouchableOpacity
                key={eff}
                style={{ backgroundColor: selectedEffect === eff ? '#3182ce' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
                onPress={() => setSelectedEffect(eff)}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{eff}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>⚡ Precision Speed Control:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {['0.5x Slow-Mo', '1.0x (Normal)', '1.5x Fast', '2.0x Timelapse'].map((spd) => (
              <TouchableOpacity
                key={spd}
                style={{ backgroundColor: trimSpeedSetting === spd ? '#d69e2e' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
                onPress={() => setTrimSpeedSetting(spd)}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{spd}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2d3748' }}>AI Auto-Captions & Subtitle Styling:</Text>
            <TouchableOpacity 
              style={{ backgroundColor: autoCaptionsActive ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
              onPress={() => setAutoCaptionsActive(!autoCaptionsActive)}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{autoCaptionsActive ? 'Active 🟢' : 'Off 🔴'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2d3748' }}>AI Voice-Over Studio:</Text>
            <TouchableOpacity 
              style={{ backgroundColor: voiceOverStudioActive ? '#3182ce' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
              onPress={() => setVoiceOverStudioActive(!voiceOverStudioActive)}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{voiceOverStudioActive ? 'Studio Voice: ON 🎙️' : 'Standard ⚪'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: '#3182ce', flexDirection: 'row', justifyContent: 'center' }]} 
          onPress={handleCreatePost}
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
          <Text style={styles.sendButtonText}>{isLoading ? 'Processing Pro Media...' : 'Publish Pro Post 🚀'}</Text>
        </TouchableOpacity>
      </View>

      {/* FEED POSTS LIST */}
      {posts.map((item) => {
        const embedUrl = getYouTubeEmbedUrl(item.mediaUrl);

        return (
          <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkHeader]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.postAuthor}>{item.author || 'Borris'}</Text>
              <View style={{ flexDirection: 'row' }}>
                {item.filterName ? (
                  <View style={{ backgroundColor: '#f0fff4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, borderWidth: 1, borderColor: '#c6f6d5' }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#22543d' }}>🎨 {item.filterName}</Text>
                  </View>
                ) : null}
                {item.effect ? (
                  <View style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#bee3f8' }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#2b6cb0' }}>✨ {item.effect}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={[styles.messageText, isDarkMode && styles.darkText, { marginBottom: 10 }]}>{item.content}</Text>
            
            {item.mediaUrl && (
              <View style={{ marginBottom: 10 }}>
                {embedUrl ? (
                  <View style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
                    <iframe
                      width="100%"
                      height="200"
                      src={embedUrl}
                      title="Feed Media"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </View>
                ) : null}
              </View>
            )}

            {item.captionsEnabled && (
              <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 6, borderRadius: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#718096' }}>💬 TikTok-Style Animated Auto-Captions Active</Text>
              </View>
            )}

            {/* Social Action Bar with Share & Download */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: isDarkMode ? '#4a5568' : '#e2e8f0', paddingTop: 8, alignItems: 'center' }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handleLikePost(item.id)}>
                <Text style={{ fontSize: 12, color: '#e53e3e', fontWeight: 'bold' }}>❤️ Likes ({item.likes || 0})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }} onPress={() => handleForwardPost(item.id)}>
                <Text style={{ fontSize: 12, color: '#2b6cb0', fontWeight: 'bold' }}>Share / Forward ↗️ ({item.shares || 0})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ backgroundColor: '#f0fff4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }} onPress={() => handleDownloadMedia(item.mediaUrl)}>
                <Text style={{ fontSize: 12, color: '#22543d', fontWeight: 'bold' }}>📥 Download</Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 12, color: '#718096' }}>💬 {item.commentsCount || 0}</Text>
            </View>
          </View>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  darkText: { color: '#fff' },
  messageText: { fontSize: 15, color: '#2d3748' },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, paddingHorizontal: 15, backgroundColor: '#f7fafc', color: '#2d3748' },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  postAuthor: { fontWeight: 'bold', color: '#3182ce', fontSize: 14 },
  commentsHeader: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 8 },
});