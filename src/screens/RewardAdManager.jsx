import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';

export default function RewardAdManager({ isDarkMode, coins = 100, setCoins }) {
  const [isAdLoading, setIsAdLoading] = useState(false);

  // NEW LAYER 1: MULTI-TIER REWARD MULTIPLIER & STREAK BONUS
  const [dailyStreakCount, setDailyStreakCount] = useState(4);
  const [streakMultiplierActive, setStreakMultiplierActive] = useState(true);

  // NEW LAYER 2: SPONSOR TARGETING & ECO-PARTNER CAMPAIGNS
  const [selectedSponsorCampaign, setSelectedSponsorCampaign] = useState('Talk With Nature Wildlife Spot 🌿');
  const sponsorCampaigns = [
    'Talk With Nature Wildlife Spot 🌿',
    'Kampala Tech Innovation Spotlight 💡',
    'Pearl Africa Eco-Tourism Promo 🐘',
    'Afrobeat Indie Music Showcase 🎶',
  ];

  // NEW LAYER 3: INSTANT WALLET LEDGER & AUTO-CONVERSION TO USD
  const [autoConvertUsdEnabled, setAutoConvertUsdEnabled] = useState(false);
  const coinToUsdRate = 0.05; // 1 Coin = $0.05 USD

  // NEW LAYER 4: AUDIO MUTE & DATA SAVER REWARD MODE
  const [soundMutedDuringAd, setSoundMutedDuringAd] = useState(true);

  // Simulate triggering a Rewarded Ad (Value Exchange Strategy)
  const handleWatchRewardedAd = () => {
    setIsAdLoading(true);
    
    setTimeout(() => {
      setIsAdLoading(false);
      
      const baseCoins = 50;
      const earnedCoins = streakMultiplierActive ? baseCoins * 2 : baseCoins;
      
      if (setCoins) {
        setCoins(prev => prev + earnedCoins);
      }
      setDailyStreakCount(prev => prev + 1);
      
      Alert.alert(
        "Reward Unlocked! 🎉",
        `You successfully watched the ${selectedSponsorCampaign} sponsor ad${soundMutedDuringAd ? ' (Muted/Data Saver)' : ''} and earned +${earnedCoins} bonus coins (${streakMultiplierActive ? '2x Streak Bonus Applied!' : ''})!`
      );
    }, 3000);
  };

  const calculatedUsdValue = (coins * coinToUsdRate).toFixed(2);

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, paddingBottom: 60 }}
      nestedScrollEnabled={true}
    >
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🎁 ChatUP Reward Hub & Monetization</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubText]}>Watch sponsor videos to earn free coins, boost marketplace visibility, and fund creator projects!</Text>
        
        {/* Wallet Balance & USD Conversion Badge */}
        <View style={[styles.coinBadge, isDarkMode && { backgroundColor: '#1e3a8a', borderColor: '#3b82f6' }]}>
          <Text style={[styles.coinText, isDarkMode && { color: '#93c5fd' }]}>Wallet Balance: 🪙 {coins} Coins (${calculatedUsdValue} USD)</Text>
        </View>

        {/* LAYER 1: DAILY STREAK MULTIPLIER */}
        <View style={[styles.subCard, isDarkMode && styles.darkSubCard, { borderColor: '#d69e2e', borderWidth: 1 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.subCardTitle, isDarkMode && styles.darkText]}>🔥 Daily Streak Multiplier ({dailyStreakCount} Days)</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Double your coin rewards (+100 coins) by maintaining your daily watch streak.</Text>
            </View>
            <Switch 
              value={streakMultiplierActive} 
              onValueChange={setStreakMultiplierActive} 
              trackColor={{ false: '#cbd5e0', true: '#d69e2e' }}
            />
          </View>
        </View>

        {/* LAYER 2: SPONSOR CAMPAIGN SELECTOR */}
        <View style={[styles.subCard, isDarkMode && styles.darkSubCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
          <Text style={[styles.subCardTitle, isDarkMode && styles.darkText]}>🌿 Select Sponsor Campaign Channel</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Choose your preferred ad partner category for targeted rewards:</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {sponsorCampaigns.map((camp) => (
              <TouchableOpacity
                key={camp}
                style={[styles.chip, isDarkMode && styles.darkChip, selectedSponsorCampaign === camp && styles.activeChip]}
                onPress={() => setSelectedSponsorCampaign(camp)}
              >
                <Text style={[styles.chipText, isDarkMode && styles.darkText, selectedSponsorCampaign === camp && { color: '#fff' }]}>{camp}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LAYER 3: AUTO-CONVERT TO USD WALLET POUCH */}
        <View style={[styles.subCard, isDarkMode && styles.darkSubCard, { borderColor: '#48bb78', borderWidth: 1 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.subCardTitle, isDarkMode && styles.darkText]}>💵 Auto-Convert Coins to USD Payout</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Automatically sync earned coins to withdrawable Mobile Money / USD balance.</Text>
            </View>
            <Switch 
              value={autoConvertUsdEnabled} 
              onValueChange={setAutoConvertUsdEnabled} 
              trackColor={{ false: '#cbd5e0', true: '#48bb78' }}
            />
          </View>
        </View>

        {/* LAYER 4: DATA SAVER & MUTE PREFERENCE */}
        <View style={[styles.subCard, isDarkMode && styles.darkSubCard, { paddingVertical: 10 }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.subCardTitle, isDarkMode && styles.darkText]}>📉 Data Saver & Mute Ad Mode</Text>
              <Text style={{ fontSize: 11, color: '#718096' }}>Compress video quality and mute audio to save mobile data while earning.</Text>
            </View>
            <Switch 
              value={soundMutedDuringAd} 
              onValueChange={setSoundMutedDuringAd} 
              trackColor={{ false: '#cbd5e0', true: '#2b6cb0' }}
            />
          </View>
        </View>

        {/* Watch Ad Action Button */}
        <TouchableOpacity 
          style={[styles.button, isAdLoading && styles.buttonDisabled]} 
          onPress={handleWatchRewardedAd}
          disabled={isAdLoading}
        >
          {isAdLoading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : null}
          <Text style={styles.buttonText}>
            {isAdLoading ? "Loading Sponsor Ad..." : `Watch Ad & Earn +${streakMultiplierActive ? '100' : '50'} Coins 🚀`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a202c',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#2d3748',
  },
  subCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkSubCard: {
    backgroundColor: '#1a202c',
    borderColor: '#4a5568',
  },
  subCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  darkText: {
    color: '#fff',
  },
  darkSubText: {
    color: '#cbd5e0',
  },
  coinBadge: {
    backgroundColor: '#ebf8ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  coinText: {
    color: '#2b6cb0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chip: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  darkChip: {
    backgroundColor: '#1a202c',
    borderColor: '#4a5568',
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#3182ce',
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  button: {
    backgroundColor: '#2b6cb0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});