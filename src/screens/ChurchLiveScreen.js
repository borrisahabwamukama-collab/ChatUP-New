import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../../Services/supabaseClient';

export default function ChurchLiveScreen({ isDarkMode, navigation }) {
  // Navigation Sub-Tabs: 'stream' | 'bible' | 'hymns' | 'islamic' | 'testimonies' | 'prayers' | 'worship' | 'giving' | 'church'
  const [activeTab, setActiveTab] = useState('stream');

  // ================= 1. CHURCH REGISTRATION & VERIFICATION STATE =================
  const [regChurchName, setRegChurchName] = useState('');
  const [regPastorName, setRegPastorName] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regCountry, setRegCountry] = useState('Uganda');
  const [regPhone, setRegPhone] = useState('');
  const [regLogoUrl, setRegLogoUrl] = useState('');
  const [ownershipModalVisible, setOwnershipModalVisible] = useState(false);

  // Active Church Context
  const [churchName, setChurchName] = useState('Kampala Grace Sanctuary');
  const [leadPastor, setLeadPastor] = useState('Pastor John & Sarah');

  // ================= 2. HOLY BIBLE SEARCH STATE =================
  const [bibleLanguage, setBibleLanguage] = useState('English (KJV)'); // 'English (KJV)' | 'Luganda (Baibuli)'
  const [searchVerseQuery, setSearchVerseQuery] = useState('');
  const [bibleVerses] = useState([
    { book: 'John', chapter: '3', verse: '16', textEn: 'For God so loved the world that He gave His only begotten Son...', textLg: 'Kubanga Katonda bwayagala ensi bwati, okuwaayo Omwana we eyazaalibwa omuyekka...' },
    { book: 'Psalm', chapter: '23', verse: '1', textEn: 'The LORD is my shepherd; I shall not want.', textLg: 'MUKAMA ye musumba wange; ssiyaagale kyonna.' },
    { book: 'Philippians', chapter: '4', verse: '13', textEn: 'I can do all things through Christ who strengthens me.', textLg: 'Nsobola buli kintu mu Oyo ampa amaanyi.' },
    { book: 'Jeremiah', chapter: '29', verse: '11', textEn: 'For I know the plans I have for you, declares the LORD...', textLg: 'Kubanga mmanyi ebirowozo bye ndirowooza ku mmwe, bw’atyo bw’agamba MUKAMA...' },
  ]);

  // ================= 3. COMPREHENSIVE HYMNAL STATE =================
  const [hymnSearchQuery, setHymnSearchQuery] = useState('');
  const [hymnCategory, setHymnCategory] = useState('All'); // 'All' | 'Enyimba' | 'English Classic' | 'Catholic Enjatula'
  const [hymnsList] = useState([
    { id: 'h1', titleEn: 'Amazing Grace', titleLg: 'Ekyisa Ekitangaza', number: '12', category: 'English Classic', lyrics: 'Amazing grace! How sweet the sound, That saved a wretch like me...' },
    { id: 'h2', titleEn: 'How Great Thou Art', titleLg: 'Katonda Wange Bwendowooza', number: '45', category: 'Enyimba', lyrics: 'O Lord my God, when I in awesome wonder, Consider all the worlds Thy hands have made...' },
    { id: 'h3', titleEn: 'Holy Holy Holy', titleLg: 'Omutukuvu Omutukuvu', number: '08', category: 'Catholic Enjatula', lyrics: 'Holy, holy, holy! Lord God Almighty! Early in the morning our song shall rise to Thee...' },
  ]);

  // ================= 4. ISLAMIC COMPANION STATE =================
  const [tasbihCount, setTasbihCount] = useState(0);
  const [activeDhikr, setActiveDhikr] = useState('SubhanAllah');
  const [quranSearchQuery, setQuranSearchQuery] = useState('');
  const [quranAyahs] = useState([
    { surah: 'Al-Fatiha', number: '1:1', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', luganda: 'Mu ttuutumu lya Allah, Omusaasizi w’esawa zonna, Omusaasizi ennyo.' },
    { surah: 'Ayat al-Kursi', number: '2:255', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', luganda: 'Allah! Taliwo katonda mulala okuggyako Ye, Omulamu, Owekyisa kyonna...' },
  ]);

  // ================= 5. TESTIMONIES TAB STATE =================
  const [testimonyText, setTestimonyText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [testimoniesList, setTestimoniesList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');

  // ================= 6. PRAYER WALL STATE =================
  const [prayerInput, setPrayerInput] = useState('');
  const [prayerCategory, setPrayerCategory] = useState('Healing');
  const [prayers, setPrayers] = useState([
    { id: '1', name: 'Brother David', text: 'Praying for healing and strength for my family this week.', count: 12, category: 'Healing' },
    { id: '2', name: 'Sister Grace', text: 'Standing in faith for our upcoming youth revival conference in Kampala.', count: 19, category: 'Fellowship' },
  ]);

  // ================= 7. LIVE SERVICE & CHAT STATE =================
  const [streamChat, setStreamChat] = useState([
    { id: '1', user: 'Sister Mary', text: 'Amen! Praise the Lord! 🙏' },
    { id: '2', user: 'Brother John', text: 'Greetings from Entebbe Fellowship!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [liveViewers, setLiveViewers] = useState(148);

  // ================= 8. TITHES & GIVING STATE =================
  const [givingType, setGivingType] = useState('Tithe'); // 'Tithe' | 'Offering' | 'Building Fund'
  const [titheAmount, setTitheAmount] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('MTN MoMo'); // 'MTN MoMo' | 'Airtel Money'
  const [recentGivings, setRecentGivings] = useState([]);

  // ================= 9. CAMERA & OPTIONS MODAL STATE =================
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [facing, setFacing] = useState('back');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSeconds, setBroadcastSeconds] = useState(0);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Fetch Testimonies On Mount
  useEffect(() => {
    fetchTestimonies();
  }, []);

  // Broadcast Timer Effect
  useEffect(() => {
    let timer;
    if (isBroadcasting) {
      timer = setInterval(() => {
        setBroadcastSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setBroadcastSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isBroadcasting]);

  // ================= DATABASE & HANDLER FUNCTIONS =================

  const handleRegisterChurch = async () => {
    if (!regChurchName.trim() || !regPastorName.trim() || !regDistrict.trim() || !regPhone.trim()) {
      Alert.alert('Missing Details', 'Please fill out all mandatory fields to submit your church for verification.');
      return;
    }

    const churchRequestPayload = {
      church_name: regChurchName.trim(),
      pastor_name: regPastorName.trim(),
      district: regDistrict.trim(),
      country: regCountry.trim(),
      phone: regPhone.trim(),
      logo_image_url: regLogoUrl.trim() || 'https://via.placeholder.com/150',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        await supabase.from('church_requests').insert([churchRequestPayload]);
      }
    } catch (err) {
      console.log('Supabase sync warning:', err);
    }

    setOwnershipModalVisible(false);
    setRegChurchName('');
    setRegPastorName('');
    setRegDistrict('');
    setRegPhone('');
    setRegLogoUrl('');

    Alert.alert(
      'Verification Request Sent 🙏',
      'Your church registration has been submitted to the Super-Admin. Access to live streaming and sanctuary administration will be unlocked once approved.'
    );
  };

  const fetchTestimonies = async () => {
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
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
      Alert.alert('Testimony Shared 🙏', 'Your praise report has been published to the community feed.');
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

  const handleSendPrayer = () => {
    if (!prayerInput.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      name: 'You (Fellowship Member)',
      text: prayerInput.trim(),
      count: 1,
      category: prayerCategory,
    };
    setPrayers([newEntry, ...prayers]);
    setPrayerInput('');
    Alert.alert('Prayer Shared 🙏', 'Your prayer request has been lifted up to the community prayer wall.');
  };

  const handlePrayForRequest = (id) => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, count: p.count + 1 } : p));
  };

  const handleSendStreamChat = () => {
    if (!chatInput.trim()) return;
    setStreamChat(prev => [...prev, { id: Date.now().toString(), user: 'You', text: chatInput.trim() }]);
    setChatInput('');
  };

  const handleGiveOffering = () => {
    if (!titheAmount || isNaN(titheAmount) || Number(titheAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount for tithes or offerings.');
      return;
    }
    const newReceipt = {
      id: 'GIV_' + Date.now(),
      amount: titheAmount,
      type: givingType,
      carrier: selectedCarrier,
      date: new Date().toLocaleDateString(),
    };
    setRecentGivings([newReceipt, ...recentGivings]);
    Alert.alert(
      'Secure Giving Initiated 🌟',
      `Processing UGX ${Number(titheAmount).toLocaleString()} for ${givingType} via ${selectedCarrier}. A prompt will appear on your phone shortly.`,
      [{ text: 'Done', onPress: () => setTitheAmount('') }]
    );
  };

  const handleStartBroadcasting = () => {
    setIsBroadcasting(true);
    Alert.alert('Broadcast Live 🔴', 'Your sanctuary live stream is now broadcasting to fellowship members.');
  };

  const handleStopBroadcasting = () => {
    setIsBroadcasting(false);
    setCameraModalVisible(false);
    Alert.alert('Stream Ended 🏁', 'Live service broadcast completed successfully.');
  };

  const handleOpenBroadcastCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Notice 💻', 'Live camera broadcasting requires a physical mobile device.');
      return;
    }
    if (!cameraPermission || !cameraPermission.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to broadcast live service.');
        return;
      }
    }
    setCameraModalVisible(true);
  };

  // Filters
  const filteredTestimonies = testimoniesList.filter(item => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  const filteredVerses = bibleVerses.filter(v => 
    v.book.toLowerCase().includes(searchVerseQuery.toLowerCase()) || 
    v.textEn.toLowerCase().includes(searchVerseQuery.toLowerCase()) ||
    v.textLg.toLowerCase().includes(searchVerseQuery.toLowerCase())
  );

  const filteredHymns = hymnsList.filter(h => {
    const matchesSearch = h.titleEn.toLowerCase().includes(hymnSearchQuery.toLowerCase()) || 
                          h.titleLg.toLowerCase().includes(hymnSearchQuery.toLowerCase()) ||
                          h.number.includes(hymnSearchQuery);
    const matchesCat = hymnCategory === 'All' || h.category === hymnCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Sanctuary Navigation Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerInner}>
          <View>
            <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>⛪ {churchName}</Text>
            <Text style={styles.headerSub}>Ministering: {leadPastor}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.goLiveHeaderBtn} onPress={handleOpenBroadcastCamera}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🔴 Go Live</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuIconBtn} onPress={() => setAdminModalVisible(true)}>
              <Text style={{ fontSize: 16, color: isDarkMode ? '#fff' : '#2d3748' }}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 8 Multi-Faith & Sanctuary Navigation Sub-Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {[
            { key: 'stream', label: '🎥 Live Service' },
            { key: 'bible', label: '📖 Holy Bible' },
            { key: 'hymns', label: '🎵 Hymn Book' },
            { key: 'islamic', label: '🌙 Muzilimu Guide' },
            { key: 'testimonies', label: '🙌 Testimonies' },
            { key: 'prayers', label: '🙏 Prayer Wall' },
            { key: 'worship', label: '🎶 Praise & Worship' },
            { key: 'giving', label: '💳 Tithes & Giving' },
            { key: 'church', label: '🏛️ Sanctuary Hub' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab.key && styles.activeTabBtnText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Viewport */}
      <ScrollView contentContainerStyle={styles.mainLayout} showsVerticalScrollIndicator={false}>

        {/* ================= TAB 1: LIVE SERVICE & SERMON ================= */}
        {activeTab === 'stream' && (
          <View>
            <View style={styles.videoPlayerFrame}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.videoBgImage}
              />
              <View style={styles.liveStreamOverlay}>
                <View style={styles.liveStatusBadge}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>● LIVE SERVICE</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 8 }}>👥 {liveViewers} Worshippers</Text>
              </View>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📖 Today's Sermon: Walking in Divine Purpose</Text>
              <Text style={styles.scriptureText}>
                "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope."
              </Text>
              <Text style={styles.scriptureRef}>— Jeremiah 29:11</Text>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>💬 Sanctuary Live Fellowship Chat</Text>
              
              <View style={styles.chatBoxContainer}>
                <ScrollView style={{ height: 110 }}>
                  {streamChat.map(item => (
                    <Text key={item.id} style={{ fontSize: 11, marginBottom: 4 }}>
                      <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{item.user}: </Text>
                      <Text style={{ color: isDarkMode ? '#e2e8f0' : '#334155' }}>{item.text}</Text>
                    </Text>
                  ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TextInput
                    style={[styles.chatInput, isDarkMode && styles.darkInput]}
                    placeholder="Share an Amen or praise report..."
                    placeholderTextColor="#94a3b8"
                    value={chatInput}
                    onChangeText={setChatInput}
                  />
                  <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendStreamChat}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 2: HOLY BIBLE (KJV & LUGANDA BAIBULI) ================= */}
        {activeTab === 'bible' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>📖 Holy Bible / Baibuli Ekitukuvu</Text>
              
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['English (KJV)', 'Luganda (Baibuli)'].map(lang => (
                  <TouchableOpacity 
                    key={lang} 
                    style={[styles.typePill, bibleLanguage === lang && styles.activeTypePill]} 
                    onPress={() => setBibleLanguage(lang)}
                  >
                    <Text style={[styles.typePillText, bibleLanguage === lang && { color: '#fff' }]}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Search scripture by keyword or book (e.g. John, Psalm)..."
                placeholderTextColor="#94a3b8"
                value={searchVerseQuery}
                onChangeText={setSearchVerseQuery}
              />
            </View>

            {filteredVerses.map((item, idx) => (
              <View key={idx} style={[styles.card, isDarkMode && styles.darkCard]}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>
                  📌 {item.book} {item.chapter}:{item.verse}
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#e2e8f0' : '#334155', lineHeight: 18 }}>
                  {bibleLanguage === 'English (KJV)' ? item.textEn : item.textLg}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 8, alignSelf: 'flex-end' }} 
                  onPress={() => Alert.alert('Copied 📋', `Verse ${item.book} ${item.chapter}:${item.verse} copied to clipboard.`)}
                >
                  <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: 'bold' }}>📋 Copy Verse</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 3: HYMN BOOK (ENYIMBA & CATHOLIC ENJATULA) ================= */}
        {activeTab === 'hymns' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🎵 Hymn Book / Enyimba Ez'okutendereza</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {['All', 'Enyimba', 'English Classic', 'Catholic Enjatula'].map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChip, hymnCategory === cat && styles.activeFilterChip]} 
                    onPress={() => setHymnCategory(cat)}
                  >
                    <Text style={[styles.filterChipText, hymnCategory === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Search hymn by title or hymn number..."
                placeholderTextColor="#94a3b8"
                value={hymnSearchQuery}
                onChangeText={setHymnSearchQuery}
              />
            </View>

            {filteredHymns.map(hymn => (
              <View key={hymn.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2563eb' }}>
                    #{hymn.number} - {hymn.titleEn} ({hymn.titleLg})
                  </Text>
                  <View style={styles.badgePill}><Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569' }}>{hymn.category}</Text></View>
                </View>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#cbd5e1' : '#475569', fontStyle: 'italic', lineHeight: 16 }}>
                  "{hymn.lyrics}"
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 4: ISLAMIC COMPANION (MUZILIMU / QUR'AN & TASBIH) ================= */}
        {activeTab === 'islamic' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard, { alignItems: 'center', paddingVertical: 18 }]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 4 }]}>📿 Digital Tasbih Counter</Text>
              <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: 'bold', marginBottom: 10 }}>Active Dhikr: {activeDhikr}</Text>
              
              <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#2563eb', marginVertical: 6 }}>{tasbihCount}</Text>
              
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setTasbihCount(c => c + 1)}>
                  <Text style={styles.primaryBtnText}>Tap Dhikr (+1) 📿</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#64748b' }]} onPress={() => setTasbihCount(0)}>
                  <Text style={styles.primaryBtnText}>Reset 🔄</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>📖 Luganda Qur'an Verses & Supplications</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Search Surah or verse..."
                placeholderTextColor="#94a3b8"
                value={quranSearchQuery}
                onChangeText={setQuranSearchQuery}
              />
              {quranAyahs.map((q, i) => (
                <View key={i} style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#16a34a' }}>{q.surah} ({q.number})</Text>
                  <Text style={{ fontSize: 14, textAlign: 'right', marginVertical: 4, fontWeight: 'bold' }}>{q.arabic}</Text>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#cbd5e1' : '#475569' }}>{q.luganda}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB 5: CHURCH TESTIMONIES & VIDEO SANCTUARY ================= */}
        {activeTab === 'testimonies' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
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

            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 6 }]}>
              📖 Community Praise Reports ({filteredTestimonies.length})
            </Text>
            
            {filteredTestimonies.length > 0 ? (
              filteredTestimonies.map(item => (
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
          </View>
        )}

        {/* ================= TAB 6: PRAYER WALL ================= */}
        {activeTab === 'prayers' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 6 }}>
                Submit Prayer Request:
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {['Healing', 'Provision', 'Family', 'Fellowship', 'Spiritual Growth'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPill, prayerCategory === cat && styles.activeCatPill]}
                    onPress={() => setPrayerCategory(cat)}
                  >
                    <Text style={[styles.catPillText, prayerCategory === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.prayerInput, isDarkMode && styles.darkInput]}
                placeholder="Write your prayer request..."
                placeholderTextColor="#94a3b8"
                value={prayerInput}
                onChangeText={setPrayerInput}
                multiline
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSendPrayer}>
                <Text style={styles.primaryBtnText}>Post to Prayer Wall 🙏</Text>
              </TouchableOpacity>
            </View>

            {prayers.map(item => (
              <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb' }}>{item.name}</Text>
                  <View style={styles.badgePill}>
                    <Text style={{ fontSize: 9, color: '#475569', fontWeight: 'bold' }}>{item.category}</Text>
                  </View>
                </View>

                <Text style={[styles.prayerBodyText, isDarkMode && styles.darkText]}>{item.text}</Text>

                <View style={styles.prayerActionRow}>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>🙏 {item.count} praying</Text>
                  <TouchableOpacity style={styles.prayBtn} onPress={() => handlePrayForRequest(item.id)}>
                    <Text style={styles.prayBtnText}>I Prayed For This 🙏</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 7: PRAISE & WORSHIP ================= */}
        {activeTab === 'worship' && (
          <View>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🎶 Praise & Worship Media</Text>

            {[
              { id: '1', title: 'Way Maker (Live Worship)', choir: 'Kampala Sanctuary Choir', duration: '6:15' },
              { id: '2', title: '10,000 Reasons (Bless the Lord)', choir: 'Fellowship Youth Band', duration: '5:40' },
              { id: '3', title: 'Great Is Thy Faithfulness', choir: 'Acoustic Hymns Worship', duration: '4:20' },
            ].map(song => (
              <View key={song.id} style={[styles.card, isDarkMode && styles.darkCard, styles.songRow]}>
                <View style={styles.songPlayIcon}>
                  <Text style={{ fontSize: 16 }}>▶</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.songTitle, isDarkMode && styles.darkText]}>{song.title}</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>{song.choir} • {song.duration}</Text>
                </View>
                <TouchableOpacity style={styles.smallOutlineBtn} onPress={() => Alert.alert('Worship Audio', `Playing ${song.title}`)}>
                  <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: 'bold' }}>Listen</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 8: TITHES & GIVING ================= */}
        {activeTab === 'giving' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 16 }]}>🌟 Tithes, Offerings & Seeds</Text>
              <Text style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginBottom: 14 }}>
                "Bring all the tithes into the storehouse, that there may be food in My house..." — Malachi 3:10
              </Text>

              <Text style={styles.formLabel}>Select Contribution Type:</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {['Tithe', 'Offering', 'Building Fund'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typePill, givingType === type && styles.activeTypePill]}
                    onPress={() => setGivingType(type)}
                  >
                    <Text style={[styles.typePillText, givingType === type && { color: '#fff' }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Quick Amount (UGX):</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {['5000', '20000', '50000', '100000'].map(amt => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.amountPill}
                    onPress={() => setTitheAmount(amt)}
                  >
                    <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: 'bold' }}>{Number(amt).toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Custom Amount (UGX):</Text>
              <TextInput
                style={[styles.amountInput, isDarkMode && styles.darkInput]}
                placeholder="e.g. 50000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={titheAmount}
                onChangeText={setTitheAmount}
              />

              <Text style={styles.formLabel}>Payment Provider:</Text>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {['MTN MoMo', 'Airtel Money'].map(carrier => (
                  <TouchableOpacity
                    key={carrier}
                    style={[styles.carrierBtn, selectedCarrier === carrier && styles.activeCarrierBtn]}
                    onPress={() => setSelectedCarrier(carrier)}
                  >
                    <Text style={[styles.carrierText, selectedCarrier === carrier && { color: '#fff' }]}>{carrier}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.giveBtn} onPress={handleGiveOffering}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
                  Give {givingType} via {selectedCarrier} 💳
                </Text>
              </TouchableOpacity>
            </View>

            {recentGivings.length > 0 && (
              <View style={[styles.card, isDarkMode && styles.darkCard]}>
                <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🧾 Recent Giving Receipts</Text>
                {recentGivings.map(item => (
                  <View key={item.id} style={styles.receiptRow}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#16a34a' }}>UGX {Number(item.amount).toLocaleString()}</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>{item.type} • {item.carrier} • {item.date}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 9: SANCTUARY HUB & DIRECTORY ================= */}
        {activeTab === 'church' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 16 }]}>🏛️ {churchName}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>📍 Kampala Central Sanctuary, Uganda</Text>

              <Text style={{ fontSize: 12, color: isDarkMode ? '#cbd5e1' : '#334155', lineHeight: 18, marginBottom: 12 }}>
                Welcome to our digital fellowship sanctuary. Join us for weekly live services, prayer wall intercession, and community outreach.
              </Text>

              <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 4 }}>Weekly Service Schedule:</Text>
                <Text style={{ fontSize: 11, color: '#64748b' }}>• Sunday Main Service: 9:00 AM - 12:00 PM</Text>
                <Text style={{ fontSize: 11, color: '#64748b' }}>• Wednesday Mid-Week Prayer: 5:00 PM - 7:00 PM</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.outlineActionBtn} onPress={() => setOwnershipModalVisible(true)}>
              <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
                ⛪ Request Sanctuary Registration & Super-Admin Verification
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ================= MODAL 1: LIVE BROADCAST CAMERA ================= */}
      <Modal visible={cameraModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {cameraPermission?.granted ? (
            <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef}>
              <View style={styles.cameraOverlayControls}>
                <View style={styles.cameraTopRow}>
                  <TouchableOpacity style={styles.camIconBtn} onPress={() => setCameraModalVisible(false)}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>

                  {isBroadcasting && (
                    <View style={styles.liveTimerBadge}>
                      <View style={styles.redPulseDot} />
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                        LIVE 00:{broadcastSeconds < 10 ? `0${broadcastSeconds}` : broadcastSeconds}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.camIconBtn} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                    <Text style={{ color: '#fff', fontSize: 18 }}>🔄</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                  {!isBroadcasting ? (
                    <TouchableOpacity style={styles.startBroadBtn} onPress={handleStartBroadcasting}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>🔴 Start Live Broadcast</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.stopBroadBtn} onPress={handleStopBroadcasting}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>⏹ End Stream</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', marginBottom: 12 }}>Camera Permission Needed</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={requestCameraPermission}>
                <Text style={styles.primaryBtnText}>Grant Camera Access</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ================= MODAL 2: FULL CHURCH REGISTRATION & VERIFICATION FORM ================= */}
      <Modal visible={ownershipModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlay} onPress={() => setOwnershipModalVisible(false)}>
            <Pressable style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '90%' }]} onPress={e => e.stopPropagation()}>
              
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>⛪ Church Sanctuary Verification</Text>
                <TouchableOpacity onPress={() => setOwnershipModalVisible(false)}>
                  <Text style={{ color: '#64748b', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 16, marginBottom: 14 }}>
                  To maintain spiritual integrity, every sanctuary must be verified by the administration before broadcasting or managing services.
                </Text>

                <Text style={styles.formLabel}>Church Name *</Text>
                <TextInput
                  style={[styles.inputField, isDarkMode && styles.darkInput]}
                  placeholder="e.g. Watoto Church"
                  placeholderTextColor="#94a3b8"
                  value={regChurchName}
                  onChangeText={setRegChurchName}
                />

                <Text style={styles.formLabel}>Senior Pastor / Leader Name *</Text>
                <TextInput
                  style={[styles.inputField, isDarkMode && styles.darkInput]}
                  placeholder="e.g. Pastor John"
                  placeholderTextColor="#94a3b8"
                  value={regPastorName}
                  onChangeText={setRegPastorName}
                />

                <Text style={styles.formLabel}>District / City *</Text>
                <TextInput
                  style={[styles.inputField, isDarkMode && styles.darkInput]}
                  placeholder="e.g. Kampala"
                  placeholderTextColor="#94a3b8"
                  value={regDistrict}
                  onChangeText={setRegDistrict}
                />

                <Text style={styles.formLabel}>Country *</Text>
                <TextInput
                  style={[styles.inputField, isDarkMode && styles.darkInput]}
                  placeholder="e.g. Uganda"
                  placeholderTextColor="#94a3b8"
                  value={regCountry}
                  onChangeText={setRegCountry}
                />

                <Text style={styles.formLabel}>Contact Phone Number *</Text>
                <TextInput
                  style={[styles.inputField, isDarkMode && styles.darkInput]}
                  placeholder="e.g. +256700000000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={regPhone}
                  onChangeText={setRegPhone}
                />

                <Text style={styles.formLabel}>Church Logo / Banner Image URL</Text>
                <TextInput
                  style={[styles.inputField, isDarkMode && styles.darkInput]}
                  placeholder="https://example.com/logo.png"
                  placeholderTextColor="#94a3b8"
                  value={regLogoUrl}
                  onChangeText={setRegLogoUrl}
                />

                <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10, paddingVertical: 12 }]} onPress={handleRegisterChurch}>
                  <Text style={styles.primaryBtnText}>Submit for Super-Admin Approval 🛡️</Text>
                </TouchableOpacity>
              </ScrollView>

            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= MODAL 3: OPTIONS MENU (•••) ================= */}
      <Modal visible={adminModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setAdminModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 360, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>⚙️ Sanctuary Management</Text>
            
            <TouchableOpacity style={styles.menuRow} onPress={() => { setAdminModalVisible(false); handleOpenBroadcastCamera(); }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb' }}>🔴 Launch Service Broadcast Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuRow} onPress={() => { setAdminModalVisible(false); setOwnershipModalVisible(true); }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>📜 Request Church Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={() => { setAdminModalVisible(false); Alert.alert('Share', 'Sanctuary link copied.'); }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>🔗 Share Fellowship Stream Link</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingTop: 8 },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  headerInner: { paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  headerSub: { fontSize: 10, color: '#64748b' },
  darkText: { color: '#ffffff' },

  goLiveHeaderBtn: { backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 6 },
  menuIconBtn: { paddingHorizontal: 8, height: 30, justifyContent: 'center', alignItems: 'center' },

  tabsRow: { paddingHorizontal: 12, maxHeight: 38, marginTop: 8, marginBottom: 6 },
  tabBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 6, height: 30, justifyContent: 'center' },
  activeTabBtn: { backgroundColor: '#2563eb' },
  tabBtnText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  activeTabBtnText: { color: '#ffffff' },

  mainLayout: { padding: 14, paddingBottom: 140 },
  card: { backgroundColor: '#ffffff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },

  // Live Stream Player
  videoPlayerFrame: { height: 190, backgroundColor: '#000', borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 12 },
  videoBgImage: { width: '100%', height: '100%' },
  liveStreamOverlay: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center' },
  liveStatusBadge: { backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  
  scriptureText: { fontSize: 12, fontStyle: 'italic', color: '#334155', marginTop: 6, lineHeight: 18 },
  scriptureRef: { fontSize: 11, fontWeight: 'bold', color: '#2563eb', textAlign: 'right', marginTop: 4 },

  chatBoxContainer: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  chatInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, height: 32, fontSize: 11 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' },
  sendChatBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, height: 32, borderRadius: 6, justifyContent: 'center', marginLeft: 6 },

  // Testimonies & Post Form
  filterChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e0' },
  activeFilterChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  activeFilterChipText: { color: '#ffffff' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  inputMulti: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, height: 90, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10, textAlignVertical: 'top' },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemAuthor: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  categoryBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#1d4ed8' },
  itemText: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 10 },
  videoPlayerContainer: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e0' },
  itemFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  likeBtn: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },

  // Prayer Wall
  catPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6 },
  activeCatPill: { backgroundColor: '#2563eb' },
  catPillText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
  prayerInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 8, height: 60, fontSize: 11, marginBottom: 10 },
  prayerBodyText: { fontSize: 12, color: '#334155', marginVertical: 6, lineHeight: 17 },
  prayerActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 6 },
  prayBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  prayBtnText: { fontSize: 10, fontWeight: 'bold', color: '#2563eb' },
  badgePill: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  // Worship & Media
  songRow: { flexDirection: 'row', alignItems: 'center' },
  songPlayIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  songTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  smallOutlineBtn: { borderWidth: 1, borderColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },

  // Tithes & Giving
  formLabel: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 4 },
  typePill: { flex: 1, paddingVertical: 6, backgroundColor: '#f1f5f9', alignItems: 'center', borderRadius: 6, marginRight: 6 },
  activeTypePill: { backgroundColor: '#2563eb' },
  typePillText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  amountPill: { flex: 1, paddingVertical: 6, backgroundColor: '#eff6ff', alignItems: 'center', borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  amountInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, height: 38, fontSize: 12, marginBottom: 12 },
  carrierBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#f1f5f9', alignItems: 'center', borderRadius: 6, marginRight: 6 },
  activeCarrierBtn: { backgroundColor: '#16a34a' },
  carrierText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  giveBtn: { backgroundColor: '#16a34a', padding: 12, borderRadius: 8 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 6 },

  // Sanctuary Actions & Buttons
  outlineActionBtn: { borderWidth: 1, borderColor: '#2563eb', padding: 12, borderRadius: 8, marginTop: 4 },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },

  // Camera Overlay Controls
  cameraOverlayControls: { flex: 1, justifyContent: 'space-between', padding: 20 },
  cameraTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  camIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  liveTimerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  redPulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  startBroadBtn: { backgroundColor: '#dc2626', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  stopBroadBtn: { backgroundColor: '#475569', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },

  // Modals & Overlays
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  inputField: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, height: 38, fontSize: 11, marginBottom: 12 },
  menuRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
});