import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'expo-router'; // or standard react-native components

export default function RewardAdManager({ navigation }) {
  const [userCoins, setUserCoins] = useState(100); // Starting wallet balance
  const [isAdLoading, setIsAdLoading] = useState(false);

  // Simulate triggering a Rewarded Ad (Value Exchange Strategy)
  const handleWatchRewardedAd = () => {
    setIsAdLoading(true);
    
    // Simulate ad network load and playback delay (e.g., 3 seconds)
    setTimeout(() => {
      setIsAdLoading(false);
      
      // Simulate successful completion (User watched the full ad)
      const earnedCoins = 50;
      setUserCoins((prev) => prev + earnedCoins);
      
      Alert.alert(
        "Reward Unlocked!",
        `You successfully watched the video ad and earned +${earnedCoins} bonus coins for your wallet!`,
        [{ text: "Awesome" }]
      );
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ChatUP Reward Hub</Text>
        <Text style={styles.subtitle}>Watch a short sponsor video to earn free coins and boost your marketplace visibility!</Text>
        
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>Wallet Balance: {userCoins} Coins</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, isAdLoading && styles.buttonDisabled]} 
          onPress={handleWatchRewardedAd}
          disabled={isAdLoading}
        >
          <Text style={styles.buttonText}>
            {isAdLoading ? "Loading Sponsor Ad..." : "Watch Ad & Earn +50 Coins"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },
  coinBadge: {
    backgroundColor: '#ebf8ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  coinText: {
    color: '#2b6cb0',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2b6cb0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});