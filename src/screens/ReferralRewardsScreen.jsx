import React, { useState, useEffect, useRef } from 'react';
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
import { supabase } from '../../Services/supabaseClient';

export default function ReferralRewardsScreen({ isDarkMode, currentUser, coins, setCoins }) {
  const [loading, setLoading] = useState(true);
  const [referredList, setReferredList] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [systemActive, setSystemActive] = useState(true);

  // Anti-Spam Button Lock State
  const [isButtonLocked, setIsButtonLocked] = useState(false);

  // Dynamic user data fallback
  const userId = currentUser?.id || 'guest_user';
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Member';

  const referralCode = `CHATUP-${userId.toString().toUpperCase().slice(0, 8)}-2026`;
  const referralLink = `https://chatup.ug/invite?ref=${referralCode}`;

  // Layer 1: Multi-Tier Commission Boost & VIP Royalty Rank
  const [vipTierRank, setVipTierRank] = useState('Standard Affiliate Tier (10% Commission) 🌟');
  const [bonusBoostActive, setBonusBoostActive] = useState(false);

  // Layer 2: Automated Mobile Money Payout Routing Preference
  const [payoutProvider, setPayoutProvider] = useState('MTN Mobile Money');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');

  // Layer 3: Referral Funnel Analytics & Click Tracker
  const [totalClicks, setTotalClicks] = useState(0);
  const [conversionRate, setConversionRate] = useState('0.0%');

  // Layer 4: Admin Platform Revenue Fee (5%)
  const [adminFeeEnabled, setAdminFeeEnabled] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchSystemStatus();
      loadUserProfilePreferences();
      fetchReferralData();

      // Real-Time Supabase Subscription: Listen for new referrals instantly on dashboard!
      const referralSubscription = supabase
        .channel('public:referrals')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${userId}` }, (payload) => {
          console.log('New referral detected live:', payload.new);
          fetchReferralData(); // Refresh list & earnings instantly when someone installs!
        })
        .subscribe();

      return () => {
        supabase.removeChannel(referralSubscription);
      };
    }
  }, [currentUser]);

  const fetchSystemStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('is_enabled')
        .eq('setting_key', 'referrals_active')
        .single();
      
      if (!error && data && typeof data.is_enabled === 'boolean') {
        setSystemActive(data.is_enabled);
      }
    } catch {
      setSystemActive(true);
    }
  };

  const loadUserProfilePreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_referral_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setVipTierRank(data.vip_tier_rank || vipTierRank);
        setBonusBoostActive(data.bonus_boost_active ?? false);
        setPayoutProvider(data.payout_provider || payoutProvider);
        setMobileMoneyNumber(data.mobile_money_number || '');
        setTotalClicks(data.total_clicks || 0);
        setAdminFeeEnabled(data.admin_fee_enabled ?? true);
      } else {
        await supabase.from('user_referral_profiles').upsert([{
          user_id: userId,
          name: userName,
          referral_code: referralCode,
          total_clicks: 0
        }]);
      }
    } catch (err) {
      console.log('Profile sync notice:', err.message);
    }
  };

  const syncProfilePreference = async (fieldsToUpdate) => {
    try {
      await supabase
        .from('user_referral_profiles')
        .update(fieldsToUpdate)
        .eq('user_id', userId);
    } catch (err) {
      console.log('Profile sync error:', err.message);
    }
  };

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select('id, status, reward_earned, created_at, referred_user_name')
        .eq('referrer_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedList = data.map(item => ({
          id: item.id,
          name: item.referred_user_name || 'New Member',
          date: new Date(item.created_at).toLocaleDateString(),
          status: item.status?.includes('Active') ? 'Active 🟢' : 'Pending Verification 🟡',
          rewardEarned: `UGX ${Number(item.reward_earned || 0).toLocaleString()}`
        }));
        setReferredList(formattedList);

        const total = data.reduce((acc, curr) => acc + (curr.status?.includes('Active') ? Number(curr.reward_earned || 0) : 0), 0);
        setTotalEarnings(total);

        if (totalClicks > 0) {
          const rate = ((data.length / totalClicks) * 100).toFixed(1);
          setConversionRate(`${rate}%`);
        }
      } else {
        setReferredList([]);
        setTotalEarnings(0);
      }
    } catch (err) {
      console.log('Referral fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clean Share Handler (No fake click counts or coin inflation)
  const handleShareReferralLink = async () => {
    if (isButtonLocked) return;

    setIsButtonLocked(true);

    try {
      await Share.share({
        message: `Join me on ChatUP — Uganda's premier community & tour sharing app! Use my invite link: ${referralLink}`,
      });
      Alert.alert('Shared Successfully 🚀', 'Your referral link has been shared.');
    } catch {
      Alert.alert('Error', 'Could not share referral link.');
    } finally {
      setTimeout(() => {
        setIsButtonLocked(false);
      }, 4000);
    }
  };

  // Clean Clipboard Handler (No fake click counts or coin inflation)
  const handleCopyCodeToClipboard = () => {
    if (isButtonLocked) return;

    setIsButtonLocked(true);
    Clipboard.setString(referralLink);
    Alert.alert('Copied! 📋', 'Referral link copied to clipboard.');

    setTimeout(() => {
      setIsButtonLocked(false);
    }, 4000);
  };

  // TEST HANDLER: Simulate a friend installing and using your code!
  const handleSimulateNewInstall = async () => {
    try {
      const dummyNames = ['Kampala Creator 🌍', 'Jinja Traveler 🦁', 'Entebbe Friend ✈️', 'Pearl Explorer 🇺🇬'];
      const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];

      const { data, error } = await supabase.from('referrals').insert([
        {
          referrer_id: userId,
          referred_user_id: `user_${Date.now()}`,
          referred_user_name: randomName,
          status: 'Active 🟢',
          reward_earned: 5000,
          created_at: new Date().toISOString()
        }
      ]).select();

      if (error) {
        console.log('Supabase Insert Error:', error);
        Alert.alert('Database Error 🛑', error.message);
        return;
      }

      Alert.alert('Simulated Install Success! 🎉', `New user "${randomName}" successfully joined using your code!`);
      fetchReferralData(); // Refresh immediately
    } catch (err) {
      console.log('Catch Error:', err);
      Alert.alert('Error', err.message || 'Could not simulate referral install.');
    }
  };

  const handleRequestPayout = async () => {
    if (!systemActive) {
      return Alert.alert('System Paused 🛑', 'Referral rewards and Mobile Money payouts are temporarily paused by administration.');
    }

    if (!mobileMoneyNumber.trim()) {
      return Alert.alert('Missing Number ⚠️', 'Please enter your mobile money number below before requesting a payout.');
    }

    if (totalEarnings < 5000) {
      return Alert.alert('Minimum Payout Notice 💳', 'You need at least UGX 5,000 in confirmed earnings to request a Mobile Money payout.');
    }

    let finalPayoutAmount = totalEarnings;
    let adminFeeAmount = 0;

    if (adminFeeEnabled) {
      adminFeeAmount = Math.round(totalEarnings * 0.05);
      finalPayoutAmount = totalEarnings - adminFeeAmount;
    }

    try {
      const { error } = await supabase.from('payout_requests').insert([
        { 
          user_id: userId, 
          amount: finalPayoutAmount, 
          payment_method: `${payoutProvider} (${mobileMoneyNumber}) [Admin Revenue Fee Collected: UGX ${adminFeeAmount}]`, 
          status: 'Processing',
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      const feeMsg = adminFeeEnabled ? `\n(UGX ${adminFeeAmount.toLocaleString()} retained as Admin Platform Revenue)` : '';
      Alert.alert('Payout Requested 🚀', `Your ${payoutProvider} payout for UGX ${finalPayoutAmount.toLocaleString()} has been submitted.${feeMsg}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit payout request to database. Please check your network connection.');
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      
      {!systemActive && (
        <View style={styles.pausedBanner}>
          <Text style={styles.pausedBannerText}>⚠️ Referral Payouts Are Currently Paused by Admin</Text>
        </View>
      )}

      {/* Header Banner */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🎁 Invite Friends & Earn Rewards (Wallet: {coins} 🪙)</Text>
        <Text style={[styles.headerSubtitle, isDarkMode && styles.darkSubText]}>
          Share your QR code or invite link. Earn cash commissions paid via local Mobile Money when your invited friends join ChatUP!
        </Text>
      </View>

      {/* Layer 1: Multi-Tier Commission Boost & VIP Royalty Rank */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d69e2e', borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🌟 Affiliate Tier & Royalty Boost</Text>
          <Switch
            value={bonusBoostActive}
            onValueChange={(val) => {
              setBonusBoostActive(val);
              syncProfilePreference({ bonus_boost_active: val });
              Alert.alert('Affiliate Boost', val ? '🚀 Commission Boost activated for active referrals!' : 'Boost paused.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
          />
        </View>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d69e2e', marginBottom: 4 }}>{vipTierRank}</Text>
        <Text style={{ fontSize: 11, color: '#718096' }}>Maintain active monthly referrals to unlock Platinum Tier (Increased commissions & perks).</Text>
      </View>

      {/* Layer 2: Automated Mobile Money Payout Routing */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 6 }]}>💳 Mobile Money Payout Routing</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Select preferred provider and mobile number for instant cash-outs:</Text>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['MTN Mobile Money', 'Airtel Money'].map((prov) => (
            <TouchableOpacity
              key={prov}
              style={[styles.providerChip, payoutProvider === prov && styles.activeProviderChip]}
              onPress={() => {
                setPayoutProvider(prov);
                syncProfilePreference({ payout_provider: prov });
              }}
            >
              <Text style={[styles.providerChipText, payoutProvider === prov && { color: '#fff' }]}>{prov}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, isDarkMode && styles.darkChatInput]}
          placeholder="Enter Mobile Number (e.g., +256770000000)"
          placeholderTextColor="#a0aec0"
          value={mobileMoneyNumber}
          onChangeText={(val) => {
            setMobileMoneyNumber(val);
            syncProfilePreference({ mobile_money_number: val });
          }}
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
          <TouchableOpacity 
            style={[styles.actionBtnPrimary, isButtonLocked && { backgroundColor: '#a0aec0' }]} 
            onPress={handleShareReferralLink}
            disabled={isButtonLocked}
          >
            <Text style={styles.btnTextWhite}>{isButtonLocked ? 'Please Wait...' : 'Share Link 🔗'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtnSecondary, isButtonLocked && { backgroundColor: '#cbd5e0' }]} 
            onPress={handleCopyCodeToClipboard}
            disabled={isButtonLocked}
          >
            <Text style={styles.btnTextDark}>{isButtonLocked ? 'Wait...' : 'Copy Link 📋'}</Text>
          </TouchableOpacity>
        </View>

        {/* Developer Testing Tool: Simulate Friend Install */}
        <TouchableOpacity 
          style={{ marginTop: 16, backgroundColor: '#7c3aed', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
          onPress={handleSimulateNewInstall}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🧪 Simulate Friend Install & Earn</Text>
        </TouchableOpacity>
      </View>

      {/* Layer 3: Referral Funnel Analytics & Click Tracker */}
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
          <TouchableOpacity style={[styles.payoutBtn, (!systemActive || totalEarnings < 5000) && { backgroundColor: '#a0aec0' }]} onPress={handleRequestPayout}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Request Payout 💸</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 10, color: '#a0aec0' }}>* Payouts processed via {payoutProvider} ({mobileMoneyNumber || 'No number set'}).</Text>
      </View>

      {/* Layer 4: Admin Platform Revenue Fee (5%) */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🏢 Admin Platform Service Fee (5%)</Text>
          <Switch
            value={adminFeeEnabled}
            onValueChange={(val) => {
              setAdminFeeEnabled(val);
              syncProfilePreference({ admin_fee_enabled: val });
              Alert.alert('Admin Fee', val ? '🏢 5% platform service fee enabled on payouts (App Owner Revenue).' : 'Admin fee disabled.');
            }}
            trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
          />
        </View>
        <Text style={{ fontSize: 11, color: '#718096' }}>Automatically collects a 5% administrative processing fee on user payouts as platform owner revenue.</Text>
      </View>

      {/* Referred Users List with Live Updates */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            👥 Your Referrals ({referredList.length}) [Live Sync ⚡]
          </Text>
          <TouchableOpacity onPress={fetchReferralData}>
            <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold' }}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

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
          <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', padding: 20 }}>No referrals recorded yet. When a friend installs and joins using your link, their reward will appear here instantly!</Text>
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
  qrContainer: { padding: 12, backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', marginBottom: 12, alignItems: 'center' },
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