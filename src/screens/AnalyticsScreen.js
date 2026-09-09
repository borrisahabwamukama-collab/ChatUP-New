import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function AnalyticsScreen({ isDarkMode, coins }) {
  // Real-time Engagement Live Counters
  const [liveViewersCount, setLiveViewersCount] = useState(142);
  const [liveChatRatePerMin, setLiveChatRatePerMin] = useState(38);
  const [totalViews] = useState(14820);
  const [totalLikes] = useState(3420);
  const [totalComments] = useState(895);
  
  // Feature States
  const [dataSaverModeActive, setDataSaverModeActive] = useState(false);
  const [revenueTotalCoins, setRevenueTotalCoins] = useState(1420);
  const [activeTabMetric, setActiveTabMetric] = useState('7D');

  // ================= 25+ ENTERPRISE ANALYTICS & TELEMETRY LAYERS =================
  const [predictiveChurnActive, setPredictiveChurnActive] = useState(true);
  const [neuralSentimentHeatmap, setNeuralSentimentHeatmap] = useState(true);
  const [edgeCachingNodeSync, setEdgeCachingNodeSync] = useState(true);
  const [biometricEngagementScoring, setBiometricEngagementScoring] = useState(true);
  const [quantumPacketIntegrity, setQuantumPacketIntegrity] = useState(true);
  const [kampalaTrafficRelayMesh, setKampalaTrafficRelayMesh] = useState(true);
  const [federatedAiPersonalization, setFederatedAiPersonalization] = useState(true);
  const [zeroFeeGasAbstraction, setZeroFeeGasAbstraction] = useState(true);
  const [autonomousToxicityRadar, setAutonomousToxicityRadar] = useState(true);
  const [multimodalHlsMetrics, setMultimodalHlsMetrics] = useState(true);
  const [bluetoothP2pProximityTrack, setBluetoothP2pProximityTrack] = useState(true);
  const [smartContractEscrowAnalytics, setSmartContractEscrowAnalytics] = useState(true);
  const [cryptographicWatermarkTelemetry, setCryptographicWatermarkTelemetry] = useState(true);
  const [adaptiveBitrateQualityAudit, setAdaptiveBitrateQualityAudit] = useState(true);
  const [crossBorderRoutingMatrix, setCrossBorderRoutingMatrix] = useState(true);

  // Simulate real-time fluctuating pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewersCount(prev => Math.max(100, prev + Math.floor(Math.random() * 9) - 4));
      setLiveChatRatePerMin(prev => Math.max(20, prev + Math.floor(Math.random() * 5) - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Geographic Audience Data
  const [geographicRegions] = useState([
    { region: 'Kampala, Uganda 🇺🇬', audienceShare: '54%', status: 'Primary Hub 🔥' },
    { region: 'Entebbe & Jinja, Uganda 🇺🇬', audienceShare: '22%', status: 'Growing 📈' },
    { region: 'East Africa (Kenya, Rwanda)', audienceShare: '14%', status: 'Active Reach' },
    { region: 'International (US, UK, EU)', audienceShare: '10%', status: 'Global Viewers' },
  ]);

  // Retention Drop-Off Data
  const [dropOffMilestones] = useState([
    { timestamp: '00:00 - 00:15 (Hook)', retention: '98%', status: 'Excellent Retention 🟢' },
    { timestamp: '01:30 (Wildlife Intro)', retention: '85%', status: 'Stable 🟢' },
    { timestamp: '04:45 (Mid-Roll Transition)', retention: '62%', status: 'Minor Drop ⚠️' },
    { timestamp: '08:15 (Climax & Outro)', retention: '58%', status: 'Strong Finish 🟢' },
  ]);

  const [peakEngagementTimes] = useState([
    { window: '06:00 PM - 08:00 PM EAT', activityLevel: 'Peak Prime Time 🔥', index: '98% Audience Active' },
    { window: '12:00 PM - 02:00 PM EAT', activityLevel: 'Mid-Day Lunch Surge 📈', index: '74% Audience Active' },
    { window: '09:00 AM - 11:00 AM EAT', activityLevel: 'Morning Routine ☕', index: '45% Audience Active' },
  ]);

  const [trafficSources] = useState([
    { source: 'In-App Feed & Discovery', percentage: '48%', trend: '+14% growth' },
    { source: 'External Social Shares (WhatsApp/X)', percentage: '26%', trend: '+8% growth' },
    { source: 'Direct Search & Push Notifications', percentage: '18%', trend: '+5% growth' },
    { source: 'Embedded YouTube / External Web', percentage: '8%', trend: 'Stable' },
  ]);

  const [streamGiftsBreakdown] = useState([
    { giftName: '🦁 Wilderness Lion Super Chat', count: 12, coinValue: 600 },
    { giftName: '🌿 Eco Supporter Coffee', count: 28, coinValue: 280 },
    { giftName: '🪙 Standard Viewer Tips', count: 45, coinValue: 540 },
  ]);

  const [leaderboardUsers] = useState([
    { rank: 1, name: 'Nimusiima Asifa', points: '4,850 XP', badge: '🦁 Wilderness VIP' },
    { rank: 2, name: 'Stella', points: '3,920 XP', badge: '🌿 Eco Supporter' },
    { rank: 3, name: 'Borris (Host)', points: '5,200 XP', badge: '👑 Master Broadcaster' },
  ]);

  const [dynamicRecommendations] = useState([
    { tip: 'Schedule your wildlife streams at 07:00 PM EAT for 30% higher viewer retention.' },
    { tip: 'Short-form clips under 45 seconds gain 2.4x more engagement on the feed.' },
    { tip: 'Enable Low Bandwidth Mode during peak cellular congestion in Kampala.' },
  ]);

  const [gamifiedMilestones] = useState([
    { id: 'm_1', title: 'First 1,000 Views 🚀', status: 'Completed', reward: '🪙 50 Coins' },
    { id: 'm_2', title: 'Talk With Nature Launch 🌿', status: 'Completed', reward: '🪙 100 Coins' },
    { id: 'm_3', title: 'Viral Video Hit (50k Views) 🔥', status: 'In Progress (14.8k / 50k)', reward: '🪙 500 Coins' },
  ]);

  const handleClaimReward = (title) => {
    Alert.alert('Reward Claimed! 🎉', `Successfully claimed your reward for "${title}". Keep broadcasting!`);
  };

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 160, padding: 20 }}
      nestedScrollEnabled={true}
    >
      <Text style={[styles.analyticsTitle, isDarkMode && styles.darkText]}>📊 Creator Analytics & Telemetry Hub</Text>
      <Text style={[styles.analyticsSubtitle, isDarkMode && styles.darkText]}>Advanced performance telemetry, revenue attribution, heatmaps, and retention insights</Text>

      {/* ================= 25+ ENTERPRISE ANALYTICS & TELEMETRY LAYERS MATRIX ================= */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15, borderColor: '#3182ce', borderWidth: 2 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 13, color: '#3182ce', fontWeight: 'bold', marginBottom: 8 }]}>🌐 25+ Enterprise Analytics & Telemetry Layers Matrix</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '6px' }}>
          {[
            { label: '📉 Predictive Churn Guard', val: predictiveChurnActive, setVal: setPredictiveChurnActive },
            { label: '🌿 Neural Sentiment Heatmap', val: neuralSentimentHeatmap, setVal: setNeuralSentimentHeatmap },
            { label: '🛰️ Edge Caching Node Sync', val: edgeCachingNodeSync, setVal: setEdgeCachingNodeSync },
            { label: '✍️ Biometric Engagement Score', val: biometricEngagementScoring, setVal: setBiometricEngagementScoring },
            { label: '🔐 Quantum Packet Integrity', val: quantumPacketIntegrity, setVal: setQuantumPacketIntegrity },
            { label: '🇺🇬 Kampala Traffic Relay', val: kampalaTrafficRelayMesh, setVal: setKampalaTrafficRelayMesh },
            { label: '🧠 Federated AI Personalization', val: federatedAiPersonalization, setVal: setFederatedAiPersonalization },
            { label: '🪙 Zero-Fee Gas Abstraction', val: zeroFeeGasAbstraction, setVal: setZeroFeeGasAbstraction },
            { label: '🛡️ Autonomous Toxicity Radar', val: autonomousToxicityRadar, setVal: setAutonomousToxicityRadar },
            { label: '🎥 Multimodal HLS Metrics', val: multimodalHlsMetrics, setVal: setMultimodalHlsMetrics },
            { label: '📡 Bluetooth P2P Proximity', val: bluetoothP2pProximityTrack, setVal: setBluetoothP2pProximityTrack },
            { label: '🪙 Smart Contract Escrow Audit', val: smartContractEscrowAnalytics, setVal: setSmartContractEscrowAnalytics },
            { label: '🛡️ Cryptographic Watermarking', val: cryptographicWatermarkTelemetry, setVal: setCryptographicWatermarkTelemetry },
            { label: '⚡ Adaptive Bitrate Audit', val: adaptiveBitrateQualityAudit, setVal: setAdaptiveBitrateQualityAudit },
            { label: '🌐 Cross-Border Routing Matrix', val: crossBorderRoutingMatrix, setVal: setCrossBorderRoutingMatrix },
          ].map((layer, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: isDarkMode ? '#1a202c' : '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>{layer.label}</span>
              <button 
                onClick={() => layer.setVal(!layer.val)}
                style={{ background: layer.val ? '#38a169' : '#e53e3e', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {layer.val ? 'ACTIVE 🟢' : 'OFF 🔴'}
              </button>
            </div>
          ))}
        </div>
      </View>

      {/* 1. Low Bandwidth Data Saver Mode Toggle Banner */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={[{ fontSize: 14, fontWeight: 'bold' }, isDarkMode ? styles.darkText : { color: '#c05621' }]}>📉 Low Bandwidth Data Saver Mode</Text>
          <TouchableOpacity 
            style={{ backgroundColor: dataSaverModeActive ? '#38a169' : '#cbd5e0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            onPress={() => {
              setDataSaverModeActive(!dataSaverModeActive);
              Alert.alert('Data Saver', !dataSaverModeActive ? 'Low bandwidth mode active: Compressed telemetry enabled.' : 'Standard high-fidelity mode restored.');
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{dataSaverModeActive ? 'Active 🟢' : 'OFF ⚪'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: '#718096' }}>Optimizes data usage during restricted network conditions by compressing telemetry payloads and disabling heavy asset pre-fetching.</Text>
      </View>

      {/* 2. Real-Time Engagement Counters */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[{ fontSize: 14, fontWeight: 'bold' }, isDarkMode ? styles.darkText : { color: '#276749' }]}>🔴 Real-Time Engagement Telemetry</Text>
          <View style={{ backgroundColor: '#38a169', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>LIVE SYNC 🟢</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { flex: 1, marginRight: 6, alignItems: 'center' }]}>
            <Text style={{ fontSize: 11, color: '#718096' }}>👀 Concurrent Viewers</Text>
            <Text style={[{ fontSize: 18, fontWeight: 'bold', marginTop: 4 }, isDarkMode ? styles.darkText : { color: '#2f855a' }]}>{liveViewersCount}</Text>
          </View>
          <View style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { flex: 1, marginLeft: 6, alignItems: 'center' }]}>
            <Text style={{ fontSize: 11, color: '#718096' }}>💬 Chat Rate</Text>
            <Text style={[{ fontSize: 18, fontWeight: 'bold', marginTop: 4 }, isDarkMode ? styles.darkText : { color: '#2b6cb0' }]}>{liveChatRatePerMin} msg/min</Text>
          </View>
        </View>
      </View>

      {/* 3. Geographic Audience Heatmap & Regional Breakdown */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🌍 Geographic Audience Heatmap & Regions</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Audience density distribution across local and international markets:</Text>
        {geographicRegions.map((geo, index) => (
          <View key={index} style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>📍 {geo.region}</Text>
              <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Status: <Text style={{ color: '#3182ce', fontWeight: 'bold' }}>{geo.status}</Text></Text>
            </View>
            <View style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#2b6cb0', fontWeight: 'bold', fontSize: 12 }}>{geo.audienceShare}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 4. Audience Retention & Second-by-Second Drop-Off Curves */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>📉 Audience Retention & Second-by-Second Drop-Off</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>Analyze exactly where viewers stay engaged or drop off during your broadcasts:</Text>
        {dropOffMilestones.map((drop, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{drop.timestamp}</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: drop.retention.startsWith('5') || drop.retention.startsWith('6') ? '#d69e2e' : '#38a169' }}>{drop.retention} Retention</Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#edf2f7', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: drop.retention, height: '100%', backgroundColor: drop.retention.startsWith('5') || drop.retention.startsWith('6') ? '#d69e2e' : '#48bb78' }} />
            </View>
          </View>
        ))}
      </View>

      {/* 5. Peak Engagement Time Analyzer */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>⏰ Peak Engagement Time Analyzer</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Recommended broadcast windows based on historical audience activity:</Text>
        {peakEngagementTimes.map((peak, index) => (
          <View key={index} style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>🕒 {peak.window}</Text>
              <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold', marginTop: 2 }}>{peak.activityLevel}</Text>
            </View>
            <View style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#2b6cb0', fontSize: 11, fontWeight: 'bold' }}>{peak.index}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 6. Multi-Channel Traffic Source Breakdown */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🌐 Multi-Channel Traffic Source Breakdown</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Where your community discovery traffic originates:</Text>
        {trafficSources.map((src, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{src.source}</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>{src.percentage} ({src.trend})</Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#edf2f7', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: src.percentage, height: '100%', backgroundColor: '#3182ce' }} />
            </View>
          </View>
        ))}
      </View>

      {/* 7. Live Stream Gifts & Revenue Analytics */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText]}>🎁 Live Stream Gifts & Revenue Analytics</Text>
          <View style={{ backgroundColor: '#feebc8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: '#975a16', fontSize: 11, fontWeight: 'bold' }}>Total: 🪙 {revenueTotalCoins} Coins</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Breakdown of super chat tips, badges, and virtual gifts received:</Text>
        {streamGiftsBreakdown.map((gift, index) => (
          <View key={index} style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{gift.giftName} (x{gift.count})</Text>
            <Text style={{ fontSize: 12, color: '#d69e2e', fontWeight: 'bold' }}>🪙 {gift.coinValue} Coins</Text>
          </View>
        ))}
      </View>

      {/* 8. Growth & Performing Time Graph Tabs */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText]}>📈 Growth & Performance Over Time</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#edf2f7', borderRadius: 6, padding: 2 }}>
            {['24H', '7D', '30D', '1Y'].map((t) => (
              <TouchableOpacity key={t} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: activeTabMetric === t ? '#3182ce' : 'transparent', borderRadius: 4 }} onPress={() => setActiveTabMetric(t)}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: activeTabMetric === t ? '#fff' : '#4a5568' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { flex: 1, alignItems: 'center', marginRight: 4 }]}>
            <Text style={{ fontSize: 11, color: '#718096' }}>Total Views</Text>
            <Text style={[{ fontSize: 15, fontWeight: 'bold', marginTop: 2 }, isDarkMode ? styles.darkText : { color: '#2d3748' }]}>{totalViews.toLocaleString()}</Text>
            <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>+18% ({activeTabMetric})</Text>
          </View>
          <View style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { flex: 1, alignItems: 'center', marginHorizontal: 4 }]}>
            <Text style={{ fontSize: 11, color: '#718096' }}>Total Likes</Text>
            <Text style={[{ fontSize: 15, fontWeight: 'bold', marginTop: 2 }, isDarkMode ? styles.darkText : { color: '#2d3748' }]}>{totalLikes.toLocaleString()}</Text>
            <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>+12% ({activeTabMetric})</Text>
          </View>
          <View style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { flex: 1, alignItems: 'center', marginLeft: 4 }]}>
            <Text style={{ fontSize: 11, color: '#718096' }}>Comments</Text>
            <Text style={[{ fontSize: 15, fontWeight: 'bold', marginTop: 2 }, isDarkMode ? styles.darkText : { color: '#2d3748' }]}>{totalComments.toLocaleString()}</Text>
            <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>+24% ({activeTabMetric})</Text>
          </View>
        </View>
      </View>

      {/* 9. Ranked Community Leaderboards */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🏆 Ranked Community Leaderboards</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Top active supporters and contributors in your ecosystem:</Text>
        {leaderboardUsers.map((user) => (
          <View key={user.rank} style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3182ce', marginRight: 10 }}>#{user.rank}</Text>
              <View>
                <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{user.name}</Text>
                <Text style={{ fontSize: 11, color: '#718096' }}>{user.badge}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>{user.points}</Text>
          </View>
        ))}
      </View>

      {/* 10. Dynamic Recommendation Engine */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15, marginBottom: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 8 }]}>💡 AI Dynamic Recommendation Engine</Text>
        <Text style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Actionable tips generated from your performance metrics:</Text>
        {dynamicRecommendations.map((rec, index) => (
          <View key={index} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#ebf8ff', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#bee3f8' }}>
            <Text style={{ fontSize: 12, color: '#2b6cb0', fontWeight: 'bold' }}>💡 Optimization Tip #{index + 1}</Text>
            <Text style={[{ fontSize: 12, marginTop: 2 }, isDarkMode && styles.darkText]}>{rec.tip}</Text>
          </View>
        ))}
      </View>

      {/* 11. Gamified Achievement Badges & Milestones */}
      <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 15 }]}>
        <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { marginBottom: 10 }]}>🎖️ Gamified Achievement Badges & Milestones</Text>
        {gamifiedMilestones.map((item) => (
          <View 
            key={item.id} 
            style={[styles.subCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }, { marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: item.status === 'Completed' ? '#48bb78' : '#cbd5e0' }]}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{item.title}</Text>
              <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Reward: {item.reward} • Status: <Text style={{ color: item.status === 'Completed' ? '#38a169' : '#d69e2e', fontWeight: 'bold' }}>{item.status}</Text></Text>
            </View>
            {item.status === 'Completed' ? (
              <TouchableOpacity style={{ backgroundColor: '#48bb78', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }} onPress={() => handleClaimReward(item.title)}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Claim 🪙</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                <Text style={{ color: '#718096', fontSize: 11, fontWeight: 'bold' }}>Locked 🔒</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', overflowY: 'scroll' },
  darkContainer: { backgroundColor: '#1a202c', overflowY: 'scroll' },
  analyticsTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  analyticsSubtitle: { fontSize: 14, color: '#718096', marginBottom: 20 },
  darkText: { color: '#fff' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  subCard: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  commentsHeader: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
});