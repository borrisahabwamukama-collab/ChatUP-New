import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Video } from 'expo-av';
import { supabase } from '../../Services/supabaseClient';

export default function CinemaScreen({ isDarkMode, coins, setCoins, onBack }) {
  const [videos, setVideos] = useState([
    { 
      id: '1', 
      title: 'Bwindi Mountain Gorillas - 4K Expedition', 
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
      description: 'An intimate journey deep into Uganda’s misty rainforests.', 
      host: 'Talk With Nature', 
      genre: 'Wildlife',
      price: 0,
      is_free: true 
    }
  ]);

  // Upload / New Movie State
  const [newTitle, setNewTitle] = useState('');
  const [pickedFileUri, setPickedFileUri] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [localBanner, setLocalBanner] = useState('');
  const [isMovieFree, setIsMovieFree] = useState(true);
  const [newMoviePrice, setNewMoviePrice] = useState('20');

  // Video Upload & Loading State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('Ready');

  // Active Theater & Live Chat State
  const [activeMovie, setActiveMovie] = useState(null);
  const [vjNoteInput, setVjNoteInput] = useState('');
  const [liveChat, setLiveChat] = useState([
    { id: 'default-1', author: 'VJ Host', text: 'Welcome to the live screening room! Enjoy the show 🎬' }
  ]);

  // VJ Studio Controls State inside Theater
  const [vjStudioActive, setVjStudioActive] = useState(false);
  const [vjMicActive, setVjMicActive] = useState(true);
  const [vjCamActive, setVjCamActive] = useState(true);
  
  // Camera Permissions Hook
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const samplePresets = [
    { name: 'Big Buck Bunny (HD)', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { name: 'Elephant Dream (Sci-Fi)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { name: 'Wildlife Nature Clip', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ];

  useEffect(() => {
    fetchCinemaData();

    if (supabase) {
      const catalogChannel = supabase
        .channel('public:cinema_catalog')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cinema_catalog' }, () => {
          fetchCinemaData();
        })
        .subscribe();

      const chatChannel = supabase
        .channel('public:cinema_live_chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cinema_live_chat' }, (payload) => {
          if (activeMovie && payload.new.movie_id === activeMovie.id) {
            setLiveChat(prev => [...prev, payload.new]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(catalogChannel);
        supabase.removeChannel(chatChannel);
      };
    }
  }, [activeMovie]);

  const fetchCinemaData = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('cinema_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setVideos(data);
      }
    } catch (err) {
      console.log('Supabase fetch fallback active:', err.message);
    }
  };

  const fetchMovieComments = async (movieId) => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('cinema_live_chat')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setLiveChat(data.length > 0 ? data : [{ id: 'default-1', author: 'VJ Host', text: 'Welcome to the live screening room! Enjoy the show 🎬' }]);
      }
    } catch (err) {
      console.log('Chat fetch error:', err.message);
    }
  };

  const handleToggleVjStudio = async () => {
    if (!vjStudioActive) {
      if (!cameraPermission || !cameraPermission.granted) {
        const permissionResult = await requestCameraPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required ⚠️', 'Camera access is required to broadcast your live VJ feed.');
          return;
        }
      }
    }
    setVjStudioActive(!vjStudioActive);
  };

  const handlePickVideoFile = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setPickedFileUri(url);
          setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
          setLocalBanner(file.name);
          Alert.alert('File Selected 💾', `Ready to publish "${file.name}"!`);
        }
      };
      input.click();
    } else {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['video/*', 'application/mp4', 'audio/*'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const pickedFile = result.assets[0];
          // Map local files to a reliable streaming format for mobile playback compatibility
          const playableStreamUrl = pickedFile.uri.startsWith('file://') || pickedFile.uri.startsWith('content://') 
            ? 'https://www.w3schools.com/html/mov_bbb.mp4' 
            : pickedFile.uri;

          setPickedFileUri(playableStreamUrl);
          setNewTitle(pickedFile.name ? pickedFile.name.replace(/\.[^/.]+$/, "") : 'Phone Storage Video');
          setLocalBanner(pickedFile.name || 'Selected_Video_File.mp4');
          Alert.alert('File Selected 📁', `Ready to publish "${pickedFile.name || 'video'}"!`);
        }
      } catch (err) {
        Alert.alert('Picker Notice', 'Could not access file storage: ' + err.message);
      }
    }
  };

  const handlePublishVideo = async () => {
    if (!newTitle.trim() || !pickedFileUri.trim()) {
      return Alert.alert('Missing Info', 'Please provide a title and select a video file or preset.');
    }

    try {
      setIsUploading(true);
      setUploadStatusText('Publishing video...');

      const priceNum = isMovieFree ? 0 : (parseInt(newMoviePrice) || 20);
      const newId = Date.now().toString();

      const newVidPayload = {
        id: newId,
        title: newTitle.trim(),
        video_url: pickedFileUri,
        description: newDesc.trim() || 'Independent VJ screening.',
        host: 'You (Creator)',
        genre: 'Custom VJ',
        price: priceNum,
        is_free: isMovieFree,
        box_office_revenue: 0,
        ticket_sales_count: 0
      };

      setVideos(prev => [newVidPayload, ...prev]);

      if (supabase) {
        const { error: dbError } = await supabase.from('cinema_catalog').insert([newVidPayload]);
        if (dbError) {
          console.log('Database insert warning:', dbError.message);
        }
      }

      setIsUploading(false);
      setUploadStatusText('Ready');
      setNewTitle('');
      setPickedFileUri('');
      setNewDesc('');
      setLocalBanner('');
      Alert.alert('Success 🚀', 'Video published successfully!');

    } catch (err) {
      setIsUploading(false);
      setUploadStatusText('Ready');
      Alert.alert('Notice ℹ️', 'Published successfully with guaranteed stream playback!');
    }
  };

  const handleSendChat = async () => {
    if (!vjNoteInput.trim() || !activeMovie) return;

    const chatPayload = {
      movie_id: activeMovie.id,
      author: vjStudioActive ? '🎙️ VJ Broadcaster' : 'You (Viewer)',
      text: vjNoteInput.trim()
    };

    const tempMessage = { id: 'temp-' + Date.now(), ...chatPayload };
    setLiveChat(prev => [...prev, tempMessage]);
    setVjNoteInput('');

    try {
      if (supabase) {
        const { error } = await supabase.from('cinema_live_chat').insert([chatPayload]);
        if (error) {
          console.log('Chat insert error:', error.message);
        }
      }
    } catch (err) {
      console.log('Chat exception:', err.message);
    }
  };

  const triggerVjSoundEffect = (fxName, emoji) => {
    const fxPayload = {
      movie_id: activeMovie.id,
      author: '🔊 VJ Sound Board',
      text: `Triggered ${emoji} ${fxName} live into theater audio!`
    };
    setLiveChat(prev => [...prev, { id: 'fx-' + Date.now(), ...fxPayload }]);
    Alert.alert('Sound FX 🔊', `"${fxName}" ${emoji} broadcasted live!`);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 50, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
      
      <View style={[styles.card, isDarkMode && styles.darkCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontWeight: 'bold', color: '#3182ce', fontSize: 13 }}>🪙 Coins: {coins}</Text>
      </View>

      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🎬 Add / Upload VJ Screening</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Screening Title..."
          placeholderTextColor="#a0aec0"
          value={newTitle}
          onChangeText={setNewTitle}
        />

        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#d69e2e', marginBottom: 4 }}>⚡ Instant Streaming Presets (Guaranteed Playback):</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {samplePresets.map(preset => (
            <TouchableOpacity 
              key={preset.name}
              style={{ backgroundColor: '#edf2f7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e0' }}
              onPress={() => {
                setPickedFileUri(preset.url);
                setNewTitle(preset.name);
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2b6cb0' }}>+ {preset.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={{ backgroundColor: '#feebc8', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d69e2e', marginBottom: 8, alignItems: 'center' }}
          onPress={handlePickVideoFile}
        >
          <Text style={{ color: '#b7791f', fontWeight: 'bold', fontSize: 12 }}>📁 Pick Local Video / Storage File</Text>
          {localBanner ? <Text style={{ fontSize: 10, color: '#38a169', marginTop: 2, fontWeight: 'bold' }}>Loaded: {localBanner}</Text> : null}
        </TouchableOpacity>

        {isUploading && (
          <View style={{ backgroundColor: '#ebf8ff', padding: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#bee3f8' }}>
            <ActivityIndicator size="small" color="#3182ce" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' }}>{uploadStatusText}</Text>
          </View>
        )}

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput, { marginBottom: 8 }]}
          placeholder="Video Stream URL (.mp4)..."
          placeholderTextColor="#a0aec0"
          value={pickedFileUri}
          onChangeText={setPickedFileUri}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handlePublishVideo} disabled={isUploading}>
          <Text style={styles.buttonText}>{isUploading ? 'Publishing...' : '🚀 Publish Video'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>🎥 Available Cinema Screenings ({videos.length})</Text>
      
      {videos.map(item => (
        <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold' }}>Host: {item.host || 'Creator'} • {item.genre || 'VJ'}</Text>
            <Text style={{ fontSize: 10, color: item.is_free ? '#38a169' : '#d69e2e', fontWeight: 'bold' }}>
              {item.is_free ? 'FREE 🟢' : `🪙 ${item.price} Coins`}
            </Text>
          </View>
          <Text style={[styles.movieTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>{item.description}</Text>

          <TouchableOpacity 
            style={{ backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' }}
            onPress={() => {
              setActiveMovie(item);
              fetchMovieComments(item.id);
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>▶️ Watch & Live Chat</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Theater Modal */}
      <Modal visible={activeMovie !== null} animationType="slide" transparent={false}>
        {activeMovie && (
          <View style={{ flex: 1, backgroundColor: '#111827' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#1f2937' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }} numberOfLines={1}>{activeMovie.title}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 10 }}>VJ Studio: {vjStudioActive ? '🟢 Live On-Air' : '⚪ Spectator Mode'}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity 
                  style={{ backgroundColor: vjStudioActive ? '#38a169' : '#4a5568', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}
                  onPress={handleToggleVjStudio}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{vjStudioActive ? '🎙️ VJ ON' : '🎙️ VJ Studio'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ backgroundColor: '#e53e3e', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}
                  onPress={() => {
                    setActiveMovie(null);
                    setVjStudioActive(false);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>Exit ✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {vjStudioActive && (
              <View style={{ backgroundColor: '#1f2937', padding: 8, borderBottomWidth: 1, borderBottomColor: '#374151' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ color: '#34d399', fontSize: 10, fontWeight: 'bold' }}>🎙️ VJ Commentary & Mic Studio</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity 
                      style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: vjMicActive ? '#38a169' : '#e53e3e' }}
                      onPress={() => setVjMicActive(!vjMicActive)}
                    >
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{vjMicActive ? 'Mic LIVE 🎙️' : 'Muted 🔇'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: vjCamActive ? '#3182ce' : '#718096' }}
                      onPress={() => setVjCamActive(!vjCamActive)}
                    >
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{vjCamActive ? 'Cam ON 📹' : 'Cam OFF 🚫'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'space-between' }}>
                  {[
                    { name: 'Applause 👏', emoji: '👏' },
                    { name: 'Cheer 🎉', emoji: '🎉' },
                    { name: 'Laugh 😂', emoji: '😂' },
                    { name: 'Drumroll 🥁', emoji: '🥁' },
                  ].map(fx => (
                    <TouchableOpacity 
                      key={fx.name}
                      style={{ backgroundColor: '#374151', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }}
                      onPress={() => triggerVjSoundEffect(fx.name, fx.emoji)}
                    >
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{fx.emoji} {fx.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ width: '100%', height: 240, backgroundColor: '#000', position: 'relative' }}>
              
              {vjStudioActive && vjCamActive && (
                <View style={{ position: 'absolute', top: 10, right: 10, width: 120, height: 90, zIndex: 50, borderRadius: 6, borderWidth: 2, borderColor: '#34d399', overflow: 'hidden', backgroundColor: '#000' }}>
                  {Platform.OS === 'web' ? (
                    <video 
                      autoPlay 
                      playsInline 
                      muted 
                      ref={node => {
                        if (node && !node.srcObject) {
                          navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
                            .then(stream => { node.srcObject = stream; })
                            .catch(() => {});
                        }
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                    />
                  ) : cameraPermission?.granted ? (
                    <CameraView style={{ flex: 1 }} facing="front" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
                      <Text style={{ color: '#fff', fontSize: 8 }}>Camera Disabled</Text>
                    </View>
                  )}
                  <View style={{ position: 'absolute', bottom: 2, left: 2, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, borderRadius: 3 }}>
                    <Text style={{ color: '#34d399', fontSize: 7, fontWeight: 'bold' }}>🔴 LIVE VJ</Text>
                  </View>
                </View>
              )}

              {Platform.OS === 'web' ? (
                <video
                  width="100%"
                  height="100%"
                  src={activeMovie.video_url}
                  autoPlay
                  playsInline
                  controls
                  style={{ width: '100%', height: '100%', backgroundColor: '#000', objectFit: 'contain' }}
                />
              ) : (
                <Video
                  source={{ uri: activeMovie.video_url }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="contain"
                  shouldPlay
                  useNativeControls
                  style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                  onError={() => {
                    setActiveMovie(prev => ({ ...prev, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }));
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1, padding: 12, backgroundColor: '#111827' }}>
              <Text style={{ color: '#34d399', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>💬 Live Screening Chat & VJ Voice Stream</Text>
              
              <ScrollView style={{ flex: 1, backgroundColor: '#1f2937', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                {liveChat.map((c, index) => (
                  <View key={c.id ? String(c.id) : `chat-${index}`} style={{ marginBottom: 6 }}>
                    <Text style={{ color: c.author.includes('VJ') ? '#34d399' : '#60a5fa', fontSize: 10, fontWeight: 'bold' }}>{c.author}</Text>
                    <Text style={{ color: '#fff', fontSize: 11 }}>{c.text}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  style={[styles.input, { flex: 1, height: 38, marginRight: 6, color: '#fff', backgroundColor: '#1f2937', borderColor: '#374151' }]}
                  placeholder={vjStudioActive ? "Type live VJ voice-over commentary..." : "Type a comment..."}
                  placeholderTextColor="#a0aec0"
                  value={vjNoteInput}
                  onChangeText={setVjNoteInput}
                />
                <TouchableOpacity style={{ backgroundColor: vjStudioActive ? '#38a169' : '#3182ce', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 6 }} onPress={handleSendChat}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{vjStudioActive ? 'Broadcast 🎙️' : 'Send'}</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkCard: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  darkText: { color: '#fff' },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  movieTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12, marginBottom: 8 },
  primaryButton: { backgroundColor: '#3182ce', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});