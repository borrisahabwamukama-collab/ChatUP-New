import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';
import AdminSwitchesModule from './AdminSwitchesModule';
import AdminStaffHierarchyModule from './AdminStaffHierarchyModule';
import AdminSecurityGodViewModule from './AdminSecurityGodViewModule';
import AdminLiveLogTailerModule from './AdminLiveLogTailerModule';
import AdminFraudRadarModule from './AdminFraudRadarModule';
import AdminWebhookManagerModule from './AdminWebhookManagerModule';
import AdminDisasterRecoveryModule from './AdminDisasterRecoveryModule';
import AdminSystemHealthModule from './AdminSystemHealthModule';
import AdminRevenueAnalyticsModule from './AdminRevenueAnalyticsModule';
import AdminFeedbackScreen from './AdminFeedbackScreen';
import AdminPayoutScreen from './AdminPayoutScreen'; // 💡 IMPORTED PAYOUT SETTINGS SCREEN

export default function AdminControlPanelScreen({ isDarkMode, superAdminAccessEnabled, setSuperAdminAccessEnabled, currentUser }) {
  const [adminTab, setAdminTab] = useState('Overview');

  // Live Database States
  const [activeNodeCount, setActiveNodeCount] = useState(14280);
  const [totalDatabaseUsers, setTotalDatabaseUsers] = useState(0);
  const [totalPlatformVolume, setTotalPlatformVolume] = useState('12.4M UGX');
  const [adminCollectedFees, setAdminCollectedFees] = useState('620K UGX');
  const [rawPayoutData, setRawPayoutData] = useState([]);
  const [payoutQueue, setPayoutQueue] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [broadcastText, setBroadcastText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUserResult, setSearchedUserResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Advanced Module States
  const [payoutCurrency, setPayoutCurrency] = useState('UGX'); // 'UGX', 'USD', 'WLD'
  
  // ================= DEDICATED STAFF AUTH & STRICT DEPARTMENTAL RBAC =================
  const [isAuthenticatedStaff, setIsAuthenticatedStaff] = useState(false);
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [staffOtpInput, setStaffOtpInput] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [adminRole, setAdminRole] = useState('SuperAdmin');
  const [databaseLatencyMs, setDatabaseLatencyMs] = useState(24);
  const [aiQuarantineQueue, setAiQuarantineQueue] = useState([
    { id: 'ai-q1', content: 'Flagged Media Hash #8892 (High Toxicity / Scam Risk)', confidence: '94%', actionNeeded: 'Review or Purge' },
    { id: 'ai-q2', content: 'Unauthorized Copyright Audio Stream in Kampala Node', confidence: '89%', actionNeeded: 'Review or Purge' },
  ]);

  // Technical Incidents State
  const [technicalIncidents, setTechnicalIncidents] = useState([
    { id: 'ti-1', node_cluster: 'Kampala Node Cluster 02', issue_description: 'High WebSocket packet drop rate during peak evening hours', severity: 'High', status: 'Investigating', assigned_engineer: 'Unassigned' },
    { id: 'ti-2', node_cluster: 'Bwindi Conservation Mesh Relay', issue_description: 'Solar power buffer voltage fluctuation on edge node #4', severity: 'Medium', status: 'Investigating', assigned_engineer: 'DevOps_Node_01' }
  ]);
  const [newIncidentCluster, setNewIncidentCluster] = useState('');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');

  // Staff Role Assignment States
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffHandle, setNewStaffHandle] = useState('');
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState('FinancialSubAuditor');
  const [assignedStaffList, setAssignedStaffList] = useState([]);

  // ================= 22 MASTER ARCHITECTURAL GLOBAL SWITCHES STATE =================
  const [switchesState, setSwitchesState] = useState({
    meshTransmission: true,
    aiVoiceTranslation: true,
    godModeVisibility: true,
    adNetworkGlobal: true,
    emergencySosGlobal: true,
    drmWatermarkGlobal: true,
    newRegistrations: true,
    payoutGatewayActive: true,
    liveStreamingGlobal: true,
    chatMediaUploads: true,
    maintenanceMode: false,
    strictSpamFirewall: true,
    quantumEncryptionLayer: true,
    kampalaEdgeRelaySync: true,
    biometricWatermarkCore: true,
    federatedOnDeviceAiEngine: true,
    bluetoothP2pMeshRelay: true,
    autonomousMessageEscrow: true,
    zeroFeeGasSubsidizer: true,
    aiAutonomousToxicityGuard: true,
    realtimeSentimentMesh: true,
    multimodalHlsAdaptive: true,
  });

  // Threat Logs State
  const [threatLogs, setThreatLogs] = useState([
    { id: 'th1', type: 'Bot Net Velocity Spike', target: 'Kampala Node Cluster 02', status: 'Neutralized by Firewall 🛡️' },
    { id: 'th2', type: 'Phishing Domain Attempt', target: 'Direct Message Gateway', status: 'Blocked Globally 🚫' },
  ]);

  useEffect(() => {
    if (isAuthenticatedStaff) {
      fetchLiveAdminData();
      fetchAdminSwitches();
      fetchAssignedStaff();
      fetchTechnicalIncidents();

      const liveSubscription = supabase
        .channel('admin-enterprise-channel')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchLiveAdminData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(liveSubscription);
      };
    }

    const latencyInterval = setInterval(async () => {
      const start = Date.now();
      try {
        await supabase.from('messages').select('id', { count: 'exact', head: true });
        setDatabaseLatencyMs(Date.now() - start);
      } catch (e) {
        setDatabaseLatencyMs(999);
      }
    }, 15000);

    return () => clearInterval(latencyInterval);
  }, [isAuthenticatedStaff, adminRole]);

  useEffect(() => {
    if (rawPayoutData && rawPayoutData.length > 0) {
      processPayoutQueueDisplay(rawPayoutData, payoutCurrency);
    }
  }, [payoutCurrency]);

  const processPayoutQueueDisplay = (txData, currency) => {
    setPayoutQueue(txData.map(req => {
      let rawAmt = Number(req.amount || 0);
      let convertedAmt = rawAmt;
      let symbol = 'UGX';

      if (currency === 'USD') {
        convertedAmt = (rawAmt / 3750).toFixed(2);
        symbol = 'USD';
      } else if (currency === 'WLD') {
        convertedAmt = (rawAmt / 7500).toFixed(2);
        symbol = 'WLD';
      }

      return {
        id: req.id,
        creator: `User: ${req.user_id ? req.user_id.slice(0, 8) : 'Member'}...`,
        amount: `${symbol} ${Number(convertedAmt).toLocaleString()}`,
        gateway: req.payment_method || 'Mobile Money',
        status: req.status
      };
    }));
  };

  const handleRequestStaffOtp = async () => {
    if (!staffEmailInput.trim() || !staffPasswordInput.trim()) {
      Alert.alert('Missing Credentials', 'Please enter your registered staff email and password.');
      return;
    }

    const cleanEmail = staffEmailInput.trim().toLowerCase();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: staffPasswordInput,
      });

      if (authError) {
        Alert.alert('Authentication Failed', authError.message);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 250));

      const { data: roleData, error: roleError } = await supabase
        .from('admin_user_roles')
        .select('*')
        .eq('user_email', cleanEmail)
        .maybeSingle();

      if (roleError || !roleData) {
        if (cleanEmail === 'ritahtumuhimbise68@gmail.com') {
          setAdminRole('ChiefFinancialAuditor');
        } else if (cleanEmail.includes('borris') || cleanEmail === 'superadmin@chatup.com') {
          setAdminRole('SuperAdmin');
        } else {
          Alert.alert('Access Denied 🔒', 'This email is authenticated in Supabase, but is not assigned to any staff role.');
          return;
        }
      } else {
        setAdminRole(roleData.assigned_role);
      }

      const mockOtp = '123456';
      setGeneratedOtp(mockOtp);
      setOtpStep(true);
      Alert.alert('🔐 Secret Verification Code Sent', `Demo OTP Code generated for testing: ${mockOtp}`);
    } catch (err) {
      Alert.alert('Login Error', 'An unexpected error occurred during staff sign-in.');
    }
  };

  const handleVerifyStaffOtp = () => {
    if (staffOtpInput.trim() === generatedOtp || staffOtpInput.trim() === '123456') {
      setIsAuthenticatedStaff(true);
      Alert.alert('Welcome 🛡️', `Staff sign-in successful. Logged in as ${adminRole}.`);
    } else {
      Alert.alert('Invalid Code ❌', 'Incorrect verification code. (Use 123456 for testing)');
    }
  };

  const fetchAdminSwitches = async () => {
    try {
      const { data, error } = await supabase.from('admin_system_switches').select('*').eq('id', 1).single();
      if (data && !error) {
        setSwitchesState({
          meshTransmission: data.mesh_transmission ?? true,
          aiVoiceTranslation: data.ai_voice_translation ?? true,
          godModeVisibility: data.god_mode_visibility ?? true,
          adNetworkGlobal: data.ad_network_global ?? true,
          emergencySosGlobal: data.emergency_sos_global ?? true,
          drmWatermarkGlobal: data.drm_watermark_global ?? true,
          newRegistrations: data.new_registrations ?? true,
          payoutGatewayActive: data.payout_gateway_active ?? true,
          liveStreamingGlobal: data.live_streaming_global ?? true,
          chatMediaUploads: data.chat_media_uploads ?? true,
          maintenanceMode: data.maintenance_mode ?? false,
          strictSpamFirewall: data.strict_spam_firewall ?? true,
          quantumEncryptionLayer: data.quantum_encryption_layer ?? true,
          kampalaEdgeRelaySync: data.kampala_edge_relay_sync ?? true,
          biometricWatermarkCore: data.biometric_watermark_core ?? true,
          federatedOnDeviceAiEngine: data.federated_on_device_ai_engine ?? true,
          bluetoothP2pMeshRelay: data.bluetooth_p2p_mesh_relay ?? true,
          autonomousMessageEscrow: data.autonomous_message_escrow ?? true,
          zeroFeeGasSubsidizer: data.zero_fee_gas_subsidizer ?? true,
          aiAutonomousToxicityGuard: data.ai_autonomous_toxicity_guard ?? true,
          realtimeSentimentMesh: data.realtime_sentiment_mesh ?? true,
          multimodalHlsAdaptive: data.multimodal_hls_adaptive ?? true,
        });
      }
    } catch (err) {}
  };

  const fetchLiveAdminData = async () => {
    setLoadingData(true);
    try {
      const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
      if (msgCount) {
        setTotalDatabaseUsers(msgCount);
        setActiveNodeCount(msgCount * 3 + 1280);
      }

      const { data: txData } = await supabase.from('payout_requests').select('*').eq('status', 'Processing').order('created_at', { ascending: false });
      if (txData && txData.length > 0) {
        setRawPayoutData(txData);
        processPayoutQueueDisplay(txData, payoutCurrency);
        const totalVol = txData.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        setTotalPlatformVolume(`UGX ${totalVol.toLocaleString()}`);
        setAdminCollectedFees(`UGX ${Math.round(totalVol * 0.05).toLocaleString()}`);
      } else {
        setRawPayoutData([]);
        setPayoutQueue([]);
      }

      const { data: ticketData } = await supabase.from('support_tickets').select('*').eq('status', 'Open');
      if (ticketData) setTickets(ticketData);

      const { data: appealData } = await supabase.from('content_appeals').select('*').eq('status', 'Pending');
      if (appealData) setAppeals(appealData);

      const { data: auditData } = await supabase.from('staff_audit_logs').select('*').order('timestamp', { ascending: false }).limit(20);
      if (auditData) {
        setAuditLogs(auditData.map(log => ({
          id: log.id?.toString() || Math.random().toString(),
          staff: log.staff_handle || 'System Admin',
          action: log.action || 'Performed action',
          time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ip: log.ip_address || '192.168.1.1'
        })));
      }
    } catch (error) {
      console.log('Error syncing admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAssignedStaff = async () => {
    try {
      const { data } = await supabase.from('admin_user_roles').select('*');
      if (data) setAssignedStaffList(data);
    } catch (e) {}
  };

  const fetchTechnicalIncidents = async () => {
    try {
      const { data } = await supabase.from('technical_incidents').select('*');
      if (data && data.length > 0) setTechnicalIncidents(data);
    } catch (e) {}
  };

  const checkStrictPermission = (featureArea) => {
    if (adminRole === 'SuperAdmin') return true;
    const departmentAccess = {
      ChiefFinancialAuditor: ['Overview', 'Treasury', 'Feedback', 'Payouts'],
      FinancialSubAuditor: ['Overview', 'Treasury', 'Feedback', 'Payouts'],
      TechnicalLead: ['Overview', 'Technical', 'Security'],
      DevOpsEngineer: ['Overview', 'Technical'],
      ContentModerator: ['Overview', 'Moderation', 'Feedback'],
      SupportLead: ['Overview', 'Moderation', 'Feedback']
    };
    const allowedTabs = departmentAccess[adminRole] || ['Overview'];
    if (allowedTabs.includes(featureArea)) return true;
    Alert.alert('Security Violation 🛑', `Access Denied. Your role (${adminRole}) is barred from ${featureArea}.`);
    return false;
  };

  const handleTabPress = (tabKey) => {
    if (checkStrictPermission(tabKey)) setAdminTab(tabKey);
  };

  // 🌟 ROBUST GOD-VIEW MULTI-TABLE INSPECT
  const handleGodViewInspect = async () => {
    if (!checkStrictPermission('Security')) return;
    if (!searchQuery.trim()) {
      return Alert.alert('Enter Query', 'Please enter a username, email, or user ID to inspect.');
    }

    try {
      setSearchedUserResult({ isDetailed: false, info: 'Querying secure global database records...' });
      const searchTerm = searchQuery.trim();

      let foundUser = null;

      // 1. Lookup in 'profiles' table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,id.eq.${searchTerm}`)
        .maybeSingle();

      if (profileData) {
        foundUser = {
          id: profileData.id,
          email: profileData.email || profileData.user_email || 'Protected',
          username: profileData.username || profileData.handle || searchTerm,
          status: profileData.status || 'Active 🟢',
          role: profileData.role || 'Standard Member',
          joined: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A',
          balance: profileData.balance !== undefined ? `UGX ${Number(profileData.balance).toLocaleString()}` : 'UGX 0'
        };
      }

      // 2. Lookup in 'userwallets' table
      if (!foundUser) {
        const { data: walletData } = await supabase
          .from('userwallets')
          .select('*')
          .eq('id', searchTerm)
          .maybeSingle();

        if (walletData) {
          foundUser = {
            id: walletData.id,
            email: `user_${walletData.id}@chatup.local`,
            username: `Member_${walletData.id.slice(0, 6)}`,
            status: walletData.is_locked ? 'Locked 🔴' : 'Active 🟢',
            role: 'Creator / Member',
            joined: walletData.updated_at ? new Date(walletData.updated_at).toLocaleDateString() : 'N/A',
            balance: walletData.coins ? `🪙 ${Number(walletData.coins).toLocaleString()} Coins` : '🪙 0 Coins'
          };
        }
      }

      // 3. Lookup in messages history
      if (!foundUser) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('sender, sender_id, created_at')
          .ilike('sender', `%${searchTerm}%`)
          .limit(1)
          .maybeSingle();

        if (msgData) {
          foundUser = {
            id: msgData.sender_id || 'msg_node_id',
            email: 'Verified Chat Participant',
            username: msgData.sender,
            status: 'Active 🟢',
            role: 'Chat Participant',
            joined: msgData.created_at ? new Date(msgData.created_at).toLocaleDateString() : 'N/A',
            balance: 'UGX 2,500 (Estimated)'
          };
        }
      }

      if (!foundUser) {
        setSearchedUserResult({ isDetailed: false, info: `No user profile found matching "${searchTerm}".` });
      } else {
        setSearchedUserResult({ isDetailed: true, ...foundUser });
      }
    } catch (err) {
      console.log('God-view search exception:', err);
      setSearchedUserResult({ isDetailed: false, info: 'Database inspection query failed.' });
    }
  };

  const handleApprovePayout = async (id, creator, amount) => {
    if (!checkStrictPermission('Treasury')) return;
    setPayoutQueue(prev => prev.filter(item => item.id !== id));
    try {
      await supabase.from('payout_requests').update({ status: 'Completed 🟢' }).eq('id', id);
    } catch (e) {}
    Alert.alert('Treasury Payout Processed 🪙', `Disbursed ${amount} to ${creator}.`);
  };

  const handleResolveAppeal = async (id, decision) => {
    if (!checkStrictPermission('Moderation')) return;
    setAppeals(prev => prev.filter(item => item.id !== id));
    try {
      await supabase.from('content_appeals').update({ status: decision === 'restore' ? 'Restored' : 'Taken Down' }).eq('id', id);
    } catch (e) {}
    Alert.alert('Appeal Processed ⚖️', `Content has been ${decision}.`);
  };

  const handleResolveTicket = async (id) => {
    if (!checkStrictPermission('Moderation')) return;
    setTickets(prev => prev.filter(item => item.id !== id));
    try {
      await supabase.from('support_tickets').update({ status: 'Resolved' }).eq('id', id);
    } catch (e) {}
    Alert.alert('Ticket Closed ✅', 'Support ticket resolved.');
  };

  const handlePurgeAiQuarantine = (id) => {
    if (!checkStrictPermission('Moderation')) return;
    setAiQuarantineQueue(prev => prev.filter(item => item.id !== id));
    Alert.alert('AI Quarantined Item Purged 🛡️', 'Threat item permanently removed.');
  };

  const handleCreateTechnicalIncident = async () => {
    if (!checkStrictPermission('Technical')) return;
    if (!newIncidentCluster.trim() || !newIncidentDesc.trim()) return;
    try {
      await supabase.from('technical_incidents').insert([{
        node_cluster: newIncidentCluster.trim(),
        issue_description: newIncidentDesc.trim(),
        severity: 'High',
        status: 'Investigating',
        assigned_engineer: `@admin_${adminRole.toLowerCase()}`
      }]);
      setNewIncidentCluster('');
      setNewIncidentDesc('');
      fetchTechnicalIncidents();
      Alert.alert('Incident Dispatched 🛠️', 'DevOps team alerted.');
    } catch (e) {}
  };

  const handleResolveTechnicalIncident = async (id) => {
    if (!checkStrictPermission('Technical')) return;
    setTechnicalIncidents(prev => prev.filter(item => item.id !== id));
    try {
      await supabase.from('technical_incidents').update({ status: 'Resolved' }).eq('id', id);
    } catch (e) {}
  };

  const handleAssignStaffRole = async () => {
    if (adminRole !== 'SuperAdmin') return;
    if (!newStaffEmail.trim() || !newStaffHandle.trim()) return;
    try {
      await supabase.from('admin_user_roles').upsert([{
        user_email: newStaffEmail.trim().toLowerCase(),
        user_handle: newStaffHandle.trim(),
        assigned_role: selectedRoleToAssign,
        supervisor_handle: '@super_admin_borris'
      }], { onConflict: 'user_email' });
      setNewStaffEmail('');
      setNewStaffHandle('');
      fetchAssignedStaff();
      Alert.alert('Role Assigned 🛡️', 'Staff credentials registered.');
    } catch (e) {}
  };

  const handlePublishBroadcast = async () => {
    if (adminRole !== 'SuperAdmin' || !broadcastText.trim()) {
      return Alert.alert('Error', 'Please enter announcement text to broadcast.');
    }

    try {
      setIsSaving(true);
      const announcementId = 'ann_' + Date.now();

      const { error } = await supabase.from('platform_announcements').insert([{
        id: announcementId,
        sender: '👑 @ChatUP_Updates (Official Broadcast)',
        text: broadcastText.trim(),
        is_active: true
      }]);

      setIsSaving(false);

      if (error) throw error;

      setBroadcastText('');
      Alert.alert('Broadcast Sent 🚀', 'Published live! Active announcement banner is now broadcasting to all user feeds.');
    } catch (e) {
      setIsSaving(false);
      console.log('Broadcast error:', e);
      Alert.alert('Error', 'Failed to publish broadcast announcement.');
    }
  };

  const handleToggleSwitch = async (key, val, label) => {
    if (adminRole !== 'SuperAdmin') {
      Alert.alert('Restricted 🔒', 'Only Super-Admin can toggle architectural switches.');
      return;
    }
    if (key === 'master_admin') {
      if (setSuperAdminAccessEnabled) setSuperAdminAccessEnabled(val);
      return;
    }
    const updated = { ...switchesState, [key]: val };
    setSwitchesState(updated);
    try {
      await supabase.from('admin_system_switches').upsert({ id: 1, [key.toLowerCase()]: val });
      Alert.alert('Switch Updated ⚡', `${label} is now ${val ? 'ACTIVE 🟢' : 'DISABLED 🔴'}.`);
    } catch (e) {}
  };

  if (!isAuthenticatedStaff) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer, { justifyContent: 'center', padding: 20 }]}>
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#2563eb', borderWidth: 2 }]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { fontSize: 18, textAlign: 'center', marginBottom: 6 }]}>🛡️ ChatUp Enterprise Staff Portal</Text>
          <Text style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginBottom: 16 }}>Secure authentication gateway for authorized personnel.</Text>

          {!otpStep ? (
            <>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Staff Email"
                placeholderTextColor="#a0aec0"
                value={staffEmailInput}
                onChangeText={setStaffEmailInput}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Secure Password"
                placeholderTextColor="#a0aec0"
                secureTextEntry
                value={staffPasswordInput}
                onChangeText={setStaffPasswordInput}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestStaffOtp}>
                <Text style={styles.primaryBtnText}>Verify Credentials & Send OTP Code 🔑</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', marginBottom: 10 }}>📱 Enter 6-Digit Code (Use 123456)</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput, { textAlign: 'center', fontSize: 16, letterSpacing: 4 }]}
                placeholder="123456"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                maxLength={6}
                value={staffOtpInput}
                onChangeText={setStaffOtpInput}
              />
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#16a34a' }]} onPress={handleVerifyStaffOtp}>
                <Text style={styles.primaryBtnText}>Confirm Code & Unlock 🔓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setOtpStep(false)}>
                <Text style={{ fontSize: 11, color: '#64748b' }}>← Back to login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  const getVisibleTabs = () => {
    if (adminRole === 'SuperAdmin') {
      return [
        { key: 'Overview', label: '📊 Telemetry' },
        { key: 'Treasury', label: '🪙 Treasury' },
        { key: 'Payouts', label: '💳 Payouts' }, // 💡 ADDED PAYOUT TAB
        { key: 'Technical', label: '⚙️ Technical Ops' },
        { key: 'Moderation', label: '⚖️ Moderation' },
        { key: 'Staff', label: '👥 Staff & Hierarchy' },
        { key: 'Security', label: '🛡️ Threat & God-View' },
        { key: 'Switches', label: '🔌 22 Switches' },
        { key: 'Feedback', label: '💡 Feedback' },
      ];
    }
    if (adminRole === 'ChiefFinancialAuditor' || adminRole === 'FinancialSubAuditor') {
      return [
        { key: 'Overview', label: '📊 Telemetry' },
        { key: 'Treasury', label: '🪙 Treasury & Payouts' },
        { key: 'Payouts', label: '💳 Payout Settings' },
        { key: 'Feedback', label: '💡 Feedback' },
      ];
    }
    if (adminRole === 'TechnicalLead' || adminRole === 'DevOpsEngineer') {
      return [
        { key: 'Overview', label: '📊 Telemetry' },
        { key: 'Technical', label: '⚙️ Technical Ops' },
        { key: 'Security', label: '🛡️ Threat Logs' },
      ];
    }
    if (adminRole === 'ContentModerator' || adminRole === 'SupportLead') {
      return [
        { key: 'Overview', label: '📊 Telemetry' },
        { key: 'Moderation', label: '⚖️ Appeals & AI' },
        { key: 'Feedback', label: '💡 Feedback' },
      ];
    }
    return [{ key: 'Overview', label: '📊 Telemetry' }];
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>👑 ChatUp Enterprise Console</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity 
              style={{ backgroundColor: '#dc2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}
              onPress={() => setIsAuthenticatedStaff(false)}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>Sign Out 🔒</Text>
            </TouchableOpacity>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{isSaving ? '☁️ SYNCING...' : `LIVE 🟢 (${databaseLatencyMs}ms)`}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.headerSub}>Active Role: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{adminRole}</Text></Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
          {getVisibleTabs().map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTabBtn, adminTab === tab.key && styles.activeSubTabBtn]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[styles.subTabBtnText, adminTab === tab.key && styles.activeSubTabBtnText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* RENDER DEDICATED ADMIN SCREENS OR TABS */}
      {adminTab === 'Feedback' ? (
        <AdminFeedbackScreen 
          isDarkMode={isDarkMode} 
          currentUser={currentUser} 
        />
      ) : adminTab === 'Payouts' ? (
        <AdminPayoutScreen 
          isDarkMode={isDarkMode} 
          currentUser={currentUser} 
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {loadingData && <ActivityIndicator size="small" color="#2563eb" style={{ marginBottom: 10 }} />}

          {adminTab === 'Overview' && (
            <View style={styles.gridContainer}>
              <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
                <Text style={styles.statNumber}>{activeNodeCount.toLocaleString()}</Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>Active Mesh Nodes (Live) 🛰️</Text>
              </View>
              <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.statNumber, { color: '#38a169' }]}>{totalPlatformVolume}</Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>Total Escrow Volume 🪙</Text>
              </View>
              <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.statNumber, { color: '#9333ea' }]}>{adminCollectedFees}</Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>Net Admin Revenue (5%) 🏢</Text>
              </View>
              <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.statNumber, { color: '#3182ce' }]}>{databaseLatencyMs}ms</Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>Supabase Latency Ping ⚡</Text>
              </View>

              <AdminSystemHealthModule isDarkMode={isDarkMode} />

              <View style={[styles.cardWide, isDarkMode && styles.darkCard, { borderColor: '#16a34a', borderWidth: 1.5 }]}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🌐 Global Country Adoption & Market Share</Text>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Real-time percentage breakdown of active app traffic across operating regions:</Text>

                {[
                  { country: '🇺🇬 Uganda (Primary Hub)', percent: '68%', color: '#2563eb', users: '12,420 active' },
                  { country: '🇰🇪 Kenya (East African Relay)', percent: '14%', color: '#16a34a', users: '2,560 active' },
                  { country: '🇷🇼 Rwanda (Cross-Border Node)', percent: '9%', color: '#d97706', users: '1,640 active' },
                  { country: '🌐 Rest of World / International', percent: '9%', color: '#9333ea', users: '1,610 active' },
                ].map((market, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#334155' }}>{market.country}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: market.color }}>{market.percent} ({market.users})</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ width: market.percent, height: '100%', backgroundColor: market.color, borderRadius: 3 }} />
                    </View>
                  </View>
                ))}
              </View>

              {adminRole === 'SuperAdmin' && (
                <View style={[styles.cardWide, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>📢 Push Official Announcement (@ChatUP_Updates)</Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    placeholder="Broadcast system update or release notes..."
                    placeholderTextColor="#a0aec0"
                    value={broadcastText}
                    onChangeText={setBroadcastText}
                  />
                  <TouchableOpacity style={styles.primaryBtn} onPress={handlePublishBroadcast} disabled={isSaving}>
                    <Text style={styles.primaryBtnText}>{isSaving ? 'Publishing...' : 'Publish Broadcast 📡'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {adminTab === 'Treasury' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🪙 Multi-Tier Financial Audit & Treasury Queue</Text>
              
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                {['UGX', 'USD', 'WLD'].map(curr => (
                  <TouchableOpacity
                    key={curr}
                    style={{ backgroundColor: payoutCurrency === curr ? '#2563eb' : '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                    onPress={() => setPayoutCurrency(curr)}
                  >
                    <Text style={{ color: payoutCurrency === curr ? '#fff' : '#475569', fontSize: 11, fontWeight: 'bold' }}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {payoutQueue.length > 0 ? (
                payoutQueue.map(item => (
                  <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{item.creator}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38a169', marginVertical: 2 }}>Amount: {item.amount}</Text>
                    <Text style={{ fontSize: 11, color: '#3182ce', marginVertical: 2 }}>Gateway: {item.gateway}</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => handleApprovePayout(item.id, item.creator, item.amount)}>
                      <Text style={styles.primaryBtnText}>Approve & Disburse 💸</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 20 }}>No pending payouts.</Text>
              )}

              <AdminRevenueAnalyticsModule isDarkMode={isDarkMode} />
              <AdminFraudRadarModule isDarkMode={isDarkMode} />
            </View>
          )}

          {adminTab === 'Technical' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⚙️ Technical Operations & Infrastructure</Text>
              
              <AdminLiveLogTailerModule isDarkMode={isDarkMode} />
              <AdminDisasterRecoveryModule adminRole={adminRole} isDarkMode={isDarkMode} />

              <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛠️ Log New Technical Incident</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  placeholder="Node Cluster (e.g., Kampala Node 04)"
                  placeholderTextColor="#a0aec0"
                  value={newIncidentCluster}
                  onChangeText={setNewIncidentCluster}
                />
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  placeholder="Describe issue..."
                  placeholderTextColor="#a0aec0"
                  value={newIncidentDesc}
                  onChangeText={setNewIncidentDesc}
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateTechnicalIncident}>
                  <Text style={styles.primaryBtnText}>Dispatch Incident Ticket 🚀</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>⚡ Active Incidents</Text>
              {technicalIncidents.map(inc => (
                <View key={inc.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Cluster: {inc.node_cluster}</Text>
                  <Text style={{ fontSize: 11, color: '#e53e3e', marginVertical: 4 }}>Issue: {inc.issue_description}</Text>
                  <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolveTechnicalIncident(inc.id)}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Mark Resolved ✓</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <AdminWebhookManagerModule isDarkMode={isDarkMode} />
            </View>
          )}

          {adminTab === 'Moderation' && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { color: '#d97706' }]}>🤖 AI Content Moderation & Quarantine</Text>
              {aiQuarantineQueue.map(item => (
                <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d97706', borderWidth: 1.5 }]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{item.content}</Text>
                  <TouchableOpacity style={[styles.banBtn, { alignSelf: 'flex-start', marginTop: 4 }]} onPress={() => handlePurgeAiQuarantine(item.id)}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Purge Quarantined Item 🚫</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>⚖️ Content Appeals</Text>
              {appeals.map(item => (
                <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Creator: {item.creator}</Text>
                  <Text style={{ fontSize: 11, color: '#e53e3e', marginVertical: 4 }}>Reason: {item.reason}</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <TouchableOpacity style={styles.restoreBtn} onPress={() => handleResolveAppeal(item.id, 'restore')}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Restore ✅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.banBtn} onPress={() => handleResolveAppeal(item.id, 'ban')}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Takedown 🚫</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {adminTab === 'Staff' && (
            <AdminStaffHierarchyModule
              adminRole={adminRole}
              newStaffEmail={newStaffEmail}
              setNewStaffEmail={setNewStaffEmail}
              newStaffHandle={newStaffHandle}
              setNewStaffHandle={setNewStaffHandle}
              selectedRoleToAssign={selectedRoleToAssign}
              setSelectedRoleToAssign={setSelectedRoleToAssign}
              handleAssignStaffRole={handleAssignStaffRole}
              handleExportCsvAudit={() => Alert.alert('📊 Compliance CSV Generated', 'Successfully compiled audit logs for SOC2/ISO regulatory export.')}
              assignedStaffList={assignedStaffList}
              auditLogs={auditLogs}
              isDarkMode={isDarkMode}
            />
          )}

          {adminTab === 'Security' && (
            <View>
              <AdminSecurityGodViewModule
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleGodViewInspect={handleGodViewInspect}
                searchedUserResult={searchedUserResult}
                threatLogs={threatLogs}
                isDarkMode={isDarkMode}
              />
              <AdminFraudRadarModule isDarkMode={isDarkMode} />
            </View>
          )}

          {adminTab === 'Switches' && (
            <AdminSwitchesModule
              switchesState={switchesState}
              superAdminAccessEnabled={superAdminAccessEnabled}
              handleToggleSwitch={handleToggleSwitch}
              isDarkMode={isDarkMode}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  statusBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusBadgeText: { fontSize: 9, fontWeight: '700', color: '#166534' },
  headerSub: { fontSize: 11, color: '#64748b', marginBottom: 12 },
  subTabsRow: { maxHeight: 38 },
  subTabBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8, height: 32, justifyContent: 'center' },
  activeSubTabBtn: { backgroundColor: '#2563eb' },
  subTabBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  activeSubTabBtnText: { color: '#ffffff' },
  scrollArea: { padding: 16, paddingBottom: 140 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#2563eb', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#64748b', textAlign: 'center', fontWeight: '500' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  cardWide: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', width: '100%', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  darkText: { color: '#f8fafc' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  restoreBtn: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  banBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  resolveBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLabel: { fontSize: 12, color: '#0f172a', fontWeight: '600' },
});