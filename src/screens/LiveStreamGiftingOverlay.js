import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

export default function LiveStreamGiftingOverlay({ 
  visible, 
  onClose, 
  isDarkMode, 
  currentUser, 
  streamerId, 
  streamerName, 
  userCoins, 
  setCoins 
}) {
  const [sendingGift, setSendingGift] = useState(false);

  // Available Super Gifts (Priced in Coins)
  const giftCatalog = [
    { id: 'g1', name: '🌹 Red Rose', cost: 10, animation: '🌹' },
    { id: 'g2', name: '☕ Hot Coffee', cost: 25, animation: '☕' },
    { id: 'g3', name: '🎁 Mystery Box', cost: 100, animation: '🎁' },
    { id: 'g4', name: '👑 Royal Crown', cost: 500, animation: '👑' },
    { id: 'g5', name: '💎 Diamond Vault', cost: 1000, animation: '💎' },
    { id: 'g6', name: '🐘 Safari Elephant', cost: 5000, animation: '🐘' },
  ];

  const handleSendGift = async (gift) => {
    if (userCoins < gift.cost) {
      return Alert.alert(
        'Insufficient Coins 🪙', 
        `You need ${gift.cost} coins to send the ${gift.name}, but you only have ${userCoins} coins.`
      );
    }

    setSendingGift(true);
    try {
      const updatedUserCoins = userCoins - gift.cost;

      // 1. Deduct coins from sender in Supabase
      const { error: senderError } = await supabase
        .from('userwallets')
        .update({ coins: updatedUserCoins })
        .eq('id', currentUser?.id || 1);

      if (senderError) throw senderError;

      // 2. Broadcast/Insert the gift event into Supabase so streamer & chat see it live
      const { error: giftEventError } = await supabase
        .from('live_stream_gifts')
        .insert([{
          sender_id: currentUser?.id || 1,
          sender_name: currentUser?.username || 'Community Member',
          streamer_id: streamerId,
          gift_name: gift.name,
          gift_cost: gift.cost,
          created_at: new Date().toISOString()
        }]);

      if (giftEventError) {
        console.log('Gift event log warning:', giftEventError.message);
      }

      // Update parent component state
      if (setCoins) setCoins(updatedUserCoins);

      Alert.alert(
        'Gift Sent Successfully! 🎉', 
        `You sent a ${gift.name} (🪙 ${gift.cost}) to ${streamerName || 'the creator'}!`
      );
      onClose();
    } catch (err) {
      console.log('Send gift error:', err);
      Alert.alert('Error', 'Could not dispatch gift transaction.');
    } finally {
      setSendingGift(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🎁 Send Super Gift</Text>
              <Text style={styles.subtitle}>Supporting: <Text style={{ fontWeight: 'bold', color: '#3182ce' }}>@{streamerName || 'Creator'}</Text></Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#718096" />
            </TouchableOpacity>
          </View>

          {/* User Balance Reminder */}
          <View style={styles.balanceBadge}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>
              Your Liquid Wallet Balance: 🪙 {userCoins} Coins
            </Text>
          </View>

          {/* Gift Grid */}
          <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
            {giftCatalog.map(gift => (
              <TouchableOpacity
                key={gift.id}
                style={[styles.giftCard, isDarkMode && styles.darkCard]}
                onPress={() => handleSendGift(gift)}
                disabled={sendingGift}
              >
                <Text style={{ fontSize: 32, marginBottom: 4 }}>{gift.animation}</Text>
                <Text style={[styles.giftName, isDarkMode && styles.darkText]} numberOfLines={1}>{gift.name}</Text>
                <Text style={styles.giftCost}>🪙 {gift.cost} Coins</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {sendingGift && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 8 }}>Dispatching gift...</Text>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '55%' },
  darkCard: { backgroundColor: '#2d3748' },
  darkText: { color: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 10 },
  modalTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748' },
  subtitle: { fontSize: 11, color: '#718096', marginTop: 2 },
  balanceBadge: { backgroundColor: '#ebf8ff', padding: 8, borderRadius: 8, marginBottom: 14, alignItems: 'center' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 },
  giftCard: { width: '31%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  giftName: { fontSize: 11, fontWeight: 'bold', color: '#2d3748', marginBottom: 2, textAlign: 'center' },
  giftCost: { fontSize: 10, fontWeight: 'bold', color: '#38a169' }
});