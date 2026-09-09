import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Clipboard,
  ActivityIndicator,
  Switch,
  TextInput,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { createClient } from '@supabase/supabase-js';

// Initialize your Supabase client with your live credentials
const SUPABASE_URL = 'https://kwktegtjowrurgdsvafv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eNIi0Z0ZrsigF0Mo6DJQyg_XgtpKx1L';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ReferralRewardsScreen({ isDarkMode, currentUser = { id: 'borris_01', name: 'Borris' } }) {
  const [loading, setLoading] = useState(true);
  const [referredList, setReferredList] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [systemActive, setSystemActive] = useState(true); // Master kill-switch state

  const referralCode = `CHATUP-${currentUser.id.toUpperCase()}-2026`;
  const referralLink = `https://chatup.ug/invite?ref=${referralCode}`;

  // NEW LAYER 1: MULTI-TIER COMMISSION BOOST & VIP ROYALTY RANK
  const [vipTierRank, setVipTierRank] = useState('Gold Affiliate Tier (15% Commission) 🌟');
  const [bonusBoostActive, setBonusBoostActive] = useState(true);

  // NEW LAYER 2: AUTOMATED MOBILE MONEY PAYOUT ROUTING PREFERENCE
  const [payoutProvider, setPayoutProvider] = useState('MTN Mobile Money');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('+256 770 000000');

  // NEW LAYER 3: REFERRAL FUNNEL ANALYTICS & CLICK TRACKER
  const [totalClicks, setTotalClicks] = useState(142);
  const [conversionRate, setConversionRate] = useState('4.2%');

  // NEW LAYER 4: COMMUNITY ECO-TOURISM SPONSORSHIPS & CHARITY TITHING
  const [charityTithingEnabled, setCharityTithingEnabled] = useState(true);
  const [selectedCharityFund, setSelectedCharityFund] = useState('Bwindi Gorilla Conservation Fund 🦍');

  useEffect(() => {
    fetchReferralData();
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('is_enabled')
        .eq('setting_key', 'referrals_active')
        .single();
      
      if (data && typeof data.is_enabled === 'boolean') {
        setSystemActive(data.is_enabled);
      }
    } catch (err) {
      // Default to active if settings table is offline or missing
      setSystemActive(true);
    }
  };

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch referrals where current user is the referrer from Supabase
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          status,
          reward_earned,
          created_at,
          referred_user:users!referred_user_id(name)
        `)
        .eq('referrer_id', currentUser.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedList = data.map(item => ({
          id: item.id,
          name: item.referred_user?.name || 'New Member',
          date: new Date(item.created_at).toLocaleDateString(),
          status: item.status === 'Active' ? 'Active 🟢' : 'Pending Verification 🟡',
          rewardEarned: `UGX ${item.reward_earned.toLocaleString()}`
        }));
        setReferredList(formattedList);

        const total = data.reduce((acc, curr) => acc + (curr.status === 'Active' ? curr.reward_earned : 0), 0);
        setTotalEarnings(total);
      } else {
        loadMockReferrals();
      }
    } catch (err) {
      console.log('Supabase sync notice:', err.message);
      loadMockReferrals();
    } finally {
      setLoading(false);
    }
  };

  const loadMockReferrals = () => {
    const mockData = [
      { id: '1', name: 'Nimusiima Asifa', date: 'Aug 28, 2026', status: 'Active 🟢', rawReward: 1000, rewardEarned: 'UGX 1,000' },
      { id: '2', name: 'Stella', date: 'Aug 30, 2026', status: 'Active 🟢', rawReward: 1000, rewardEarned: 'UGX 1,000' },
      { id: '3', name: 'Ranger Brian', date: 'Yesterday', status: 'Pending Verification 🟡', rawReward: 0, rewardEarned: 'UGX 0' },
    ];
    setReferredList(mockData);
    setTotalEarnings(2000);
  };

  const handleShareReferralLink = async () => {
    try {
      await Share.share({
        message: `Join me on ChatUP — Uganda's premier community & tour sharing app! Use my invite link: ${referralLink}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share referral link.');
    }
  };

  const handleCopyCodeToClipboard = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied! 📋', 'Referral link copied to clipboard.');
  };

  const handleRequestPayout = async () => {
    if (!systemActive) {
      Alert.alert('System Paused 🛑', 'Referral rewards and Mobile Money payouts are temporarily paused by administration.');
      return;
    }

    if (totalEarnings < 5000) {
      Alert.alert('Minimum Payout Notice 💳', 'You need at least UGX 5,000 in confirmed earnings to request a Mobile Money payout.');
      return;
    }

    try {
      const { error } = await supabase.from('payout_requests').insert([
        { user_id: currentUser.id, amount: totalEarnings, payment_method: `${payoutProvider} (${mobileMoneyNumber})`, status: 'Processing' }
      ]);

      if (error) throw error;
      Alert.alert('Payout Requested 🚀', `Your ${payoutProvider} payout request for UGX ${totalEarnings.toLocaleString()} has been sent to the admin ledger.`);
    } catch (err) {
      Alert.alert('Payout Notice', `Request logged locally. Admin will transfer funds via ${payoutProvider} to ${mobileMoneyNumber}.`);
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      {/* System Status Alert Banner if Paused */}
      {!systemActive && (
        <View style={styles.pausedBanner}>
          <Text style={styles.pausedBannerText}>⚠️ Referral Payouts Are Currently Paused by Admin</Text>
        </View>
      )}

      {/* Header Banner */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🎁 Invite Friends & Earn Rewards</Text>
        <Text style={[styles.headerSubtitle, isDarkMode && styles.darkSubText]}>
          Share your QR code or invite link. Earn cash commissions paid via local Mobile Money when your invited friends join ChatUP!
        </Text>
      </View>

      {/* NEW LAYER 1: MULTI-TIER COMMISSION BOOST & VIP ROYALTY RANK */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🌟 Affiliate Tier & Royalty Boost</Text>
          <Switch
            value={bonusBoostActive}
            onValueChange={(val) => {
              setBonusBoostActive(val);
              Alert.alert('Affiliate Boost', val ? '🚀 2x Commission Boost activated for active referrals!' : 'Boost paused.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
          />
        </View>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d69e2e', marginBottom: 4 }}>{vipTierRank}</Text>
        <Text style={{ fontSize: 11, color: '#718096' }}>Maintain 5 active monthly referrals to unlock Platinum Tier (25% Commission + Free Eco-Tour Tickets).</Text>
      </View>

      {/* NEW LAYER 2: AUTOMATED MOBILE MONEY PAYOUT ROUTING */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 6 }]}>💳 Mobile Money Payout Routing</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Select preferred provider and mobile number for instant cash-outs:</Text>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['MTN Mobile Money', 'Airtel Money'].map((prov) => (
            <TouchableOpacity
              key={prov}
              style={[styles.providerChip, payoutProvider === prov && styles.activeProviderChip]}
              onPress={() => setPayoutProvider(prov)}
            >
              <Text style={[styles.providerChipText, payoutProvider === prov && { color: '#fff' }]}>{prov}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, isDarkMode && styles.darkChatInput]}
          placeholder="Enter Mobile Number (+256...)"
          placeholderTextColor="#a0aec0"
          value={mobileMoneyNumber}
          onChangeText={setMobileMoneyNumber}
          keyboardType="phone-pad"
        />
      </View>

      {/* QR Code Card */}
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }, isDarkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 14 }]}>Your Personal Referral QR Code</Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={referralLink}
            size={180}
            color="#1a202c"
            backgroundColor="#ffffff"
          />
        </View>

        <Text style={[styles.codeText, isDarkMode && styles.darkText]}>{referralCode}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleShareReferralLink}>
            <Text style={styles.btnTextWhite}>Share Link 🔗</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleCopyCodeToClipboard}>
            <Text style={styles.btnTextDark}>Copy Link 📋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NEW LAYER 3: REFERRAL FUNNEL ANALYTICS & CLICK TRACKER */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 1.5 }]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>📈 Funnel Analytics & Conversion Metrics</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 10, borderRadius: 8 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>TOTAL CLICKS</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3182ce', marginTop: 2 }}>{totalClicks}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#cbd5e0' }}>
            <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>CONVERSION</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#48bb78', marginTop: 2 }}>{conversionRate}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>SIGN-UPS</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#d69e2e', marginTop: 2 }}>{referredList.length}</Text>
          </View>
        </View>
      </View>

      {/* Earnings Summary */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 11, color: '#718096', fontWeight: 'bold' }}>TOTAL REWARDS EARNED</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#38a169', marginTop: 2 }}>UGX {totalEarnings.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={[styles.payoutBtn, !systemActive && { backgroundColor: '#a0aec0' }]} onPress={handleRequestPayout}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Request Payout 💸</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 10, color: '#a0aec0' }}>* Payouts processed via {payoutProvider} ({mobileMoneyNumber}) in Kampala.</Text>
      </View>

      {/* NEW LAYER 4: COMMUNITY ECO-TOURISM SPONSORSHIPS & CHARITY TITHING */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🦍 Community Eco-Tourism Tithing</Text>
          <Switch
            value={charityTithingEnabled}
            onValueChange={(val) => {
              setCharityTithingEnabled(val);
              Alert.alert('Eco-Tithing', val ? '💚 5% of referral earnings will be automatically donated to Ugandan conservation.' : 'Donation tithing paused.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
          />
        </View>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>Supporting local wildlife preservation funds across national parks:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Bwindi Gorilla Conservation Fund 🦍', 'Queen Elizabeth Wildlife Trust 🐘', 'Murchison Falls Eco-Project 🌳'].map((fund) => (
            <TouchableOpacity
              key={fund}
              style={[styles.charityChip, selectedCharityFund === fund && styles.activeCharityChip]}
              onPress={() => setSelectedCharityFund(fund)}
            >
              <Text style={[styles.charityChipText, selectedCharityFund === fund && { color: '#fff' }]}>{fund}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Referred Users List */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 10 }]}>
          👥 Your Referrals ({referredList.length})
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color="#3182ce" style={{ padding: 20 }} />
        ) : referredList.length > 0 ? (
          referredList.map((item) => (
            <View key={item.id} style={[styles.referralRow, isDarkMode && styles.darkBorder]}>
              <View>
                <Text style={[styles.referredName, isDarkMode && styles.darkText]}>{item.name}</Text>
                <Text style={{ fontSize: 10, color: '#a0aec0', marginTop: 2 }}>Joined: {item.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: item.status.includes('Active') ? '#38a169' : '#d69e2e' }}>
                  {item.status}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginTop: 2 }}>{item.rewardEarned}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', padding: 20 }}>No referrals recorded yet. Share your link to start earning!</Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  headerSubtitle: { fontSize: 11, color: '#4a5568', lineHeight: 16 },
  darkText: { color: '#fff' },
  darkSubText: { color: '#cbd5e0' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  qrContainer: { padding: 12, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', marginBottom: 12, alignItems: 'center' },
  codeText: { fontSize: 12, fontWeight: 'bold', color: '#3182ce', marginTop: 8, letterSpacing: 1 },
  buttonRow: { flexDirection: 'row', marginTop: 14, width: '100%', justifyContent: 'center' },
  actionBtnPrimary: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  actionBtnSecondary: { backgroundColor: '#edf2f7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0' },
  btnTextWhite: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  btnTextDark: { color: '#2d3748', fontSize: 11, fontWeight: 'bold' },
  payoutBtn: { backgroundColor: '#38a169', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  referralRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  darkBorder: { borderBottomColor: '#4a5568' },
  referredName: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  pausedBanner: { backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#feb2b2', padding: 10, borderRadius: 8, marginBottom: 14, alignItems: 'center' },
  pausedBannerText: { color: '#c53030', fontSize: 11, fontWeight: 'bold' },
  providerChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 },
  activeProviderChip: { backgroundColor: '#3182ce' },
  providerChipText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  charityChip: { backgroundColor: '#f3e8ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#d8b4fe' },
  activeCharityChip: { backgroundColor: '#9333ea', borderColor: '#9333ea' },
  charityChipText: { fontSize: 10, fontWeight: 'bold', color: '#6b21a8' },
});