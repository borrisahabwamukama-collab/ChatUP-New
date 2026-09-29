import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

export default function ProfileHeader({
  isDarkMode,
  avatarUri,
  avatarEmoji,
  username,
  handle,
  email,
  country,
  dateOfBirth,
  hideDob,
  phoneNumber,
  hidePhoneNumber,
  bio,
  showOnlineStatus,
  followersCount,
  followingCount,
  totalLikesReceived,
  onPressAvatar,
  onPressQr,
  onPressLogout,
  onPressStat,
  onCopyPhone
}) {
  return (
    <View style={[styles.card, isDarkMode && styles.darkCard, styles.centerCard]}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onPressAvatar} activeOpacity={0.8}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text style={{ fontSize: 32 }}>{avatarEmoji}</Text>
        )}
        <View style={styles.cameraBadge}>
          <Text style={{ fontSize: 10 }}>🔍</Text>
        </View>
      </TouchableOpacity>
      <Text style={{ fontSize: 10, color: '#a0aec0', marginBottom: 4 }}>Tap to zoom or change photo</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[styles.profileName, isDarkMode && styles.darkText]}>{username || 'New Creator'}</Text>
        {showOnlineStatus && <View style={styles.onlineDot} />}
        <Text style={{ fontSize: 14, marginLeft: 4 }}>✔️</Text>
      </View>
      <Text style={styles.profileHandle}>{handle || '@user'}</Text>
      {email ? <Text style={{ fontSize: 11, color: '#3182ce', marginBottom: 4 }}>✉️ {email}</Text> : null}
      
      <Text style={{ fontSize: 11, color: '#718096', marginVertical: 4 }}>
        📍 {country || 'Country not set'} {hideDob || !dateOfBirth ? '' : `| 🎂 ${dateOfBirth}`}
      </Text>

      {!hidePhoneNumber && phoneNumber ? (
        <TouchableOpacity style={styles.phoneBadge} onPress={onCopyPhone}>
          <Text style={styles.phoneBadgeText}>📞 {phoneNumber} (Tap to copy)</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.phoneBadge, { backgroundColor: '#fff5f5', borderColor: '#feb2b2' }]}>
          <Text style={[styles.phoneBadgeText, { color: '#c53030' }]}>🔒 Phone Number Hidden or Not Set</Text>
        </View>
      )}

      <Text style={[styles.profileBio, isDarkMode && { color: '#cbd5e0' }]}>{bio || 'No bio provided yet.'}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
        <TouchableOpacity style={styles.qrTriggerBtn} onPress={onPressQr}>
          <Text style={styles.qrTriggerBtnText}>My QR 📇</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtnInline} onPress={onPressLogout}>
          <Text style={styles.logoutBtnText}>Log Out 🚪</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem} onPress={() => onPressStat('followers')}>
          <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>{followersCount}</Text>
          <Text style={styles.statLabel}>Followers 👥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => onPressStat('following')}>
          <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>{followingCount}</Text>
          <Text style={styles.statLabel}>Following 🛰️</Text>
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>❤️ {totalLikesReceived}</Text>
          <Text style={styles.statLabel}>Total Likes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  centerCard: { alignItems: 'center', paddingVertical: 20 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 35 },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  profileHandle: { fontSize: 12, color: '#3182ce', marginBottom: 4 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#48bb78', marginLeft: 6, borderWidth: 1.5, borderColor: '#fff' },
  phoneBadge: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#cbd5e0' },
  phoneBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  profileBio: { fontSize: 12, color: '#718096', textAlign: 'center', paddingHorizontal: 20, marginBottom: 12 },
  qrTriggerBtn: { backgroundColor: '#edf2f7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e0' },
  qrTriggerBtnText: { color: '#2d3748', fontSize: 12, fontWeight: 'bold' },
  logoutBtnInline: { backgroundColor: '#e53e3e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  logoutBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 12 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  statLabel: { fontSize: 10, color: '#a0aec0' },
  darkText: { color: '#fff' }
});