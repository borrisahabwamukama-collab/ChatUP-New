import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function LiveStreamGiftAnimator({ streamerId }) {
  const [activeFloatingGifts, setActiveFloatingGifts] = useState([]);

  useEffect(() => {
    // Listen for live gift inserts in real time
    const giftSubscription = supabase
      .channel('live-room-gifts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_stream_gifts',
          filter: `streamer_id=eq.${streamerId}`
        },
        (payload) => {
          const newGift = payload.new;
          triggerFloatingGiftAnimation(newGift);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(giftSubscription);
    };
  }, [streamerId]);

  const triggerFloatingGiftAnimation = (gift) => {
    const giftId = gift.id || Math.random().toString();
    
    // Add gift to active floating queue
    setActiveFloatingGifts((prev) => [...prev, { ...gift, uniqueKey: giftId }]);

    // Automatically remove the gift banner after 3.5 seconds
    setTimeout(() => {
      setActiveFloatingGifts((prev) => prev.filter((g) => g.uniqueKey !== giftId));
    }, 3500);
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {activeFloatingGifts.map((gift) => (
        <View key={gift.uniqueKey} style={styles.giftBanner}>
          <Text style={styles.senderText}>@{gift.sender_name} sent</Text>
          <Text style={styles.giftText}>{gift.gift_name}!</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    height: 250,
    justifyContent: 'flex-start',
    zIndex: 999,
  },
  giftBanner: {
    flexDirection: 'row',
    alignItem: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  senderText: {
    color: '#f6e05e',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 6,
  },
  giftText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});