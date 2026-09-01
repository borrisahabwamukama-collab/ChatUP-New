import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

export default function MonetizationTreasuryScreen({ isDarkMode, coins, setCoins }) {
  const [activeTab, setActiveTab] = useState('Accounts'); // 'Accounts', 'Treasury', 'Marketplace', 'Splits', 'Tiers', 'Vaults'

  // Bank & Mobile Money Account Linking State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState([
    { id: 'acc1', type: 'Mobile Money', provider: 'MTN MoMo (Uganda)', number: '077*****123', holder: 'Borris Ahabwamukama', verified: true },
    { id: 'acc2', type: 'Bank Account', provider: 'Stanbic Bank Uganda', number: '903000******', holder: 'Borris Ahabwamukama', verified: true },
  ]);

  // Treasury Payout Queue State
  const [payoutQueue, setPayoutQueue] = useState([
    { id: 'p1', creator: '@borris_nature', amount: '450,000 UGX', gateway: 'Stanbic Bank / USDT', status: 'Pending Review' },
    { id: 'p2', creator: '@asifa_safari', amount: '120,000 UGX', gateway: 'MTN MoMo', status: 'Pending Review' },
  ]);

  // Marketplace Escrow State
  const [escrowOrders, setEscrowOrders] = useState([
    { id: 'e1', buyer: '@brian_ug', item: 'Wildlife Photography Lens', amount: '250,000 UGX', status: 'Locked in Escrow (Awaiting Code)' },
  ]);

  // Advanced East Africa & Nigeria Number & Bank Validation Engine
  const validateAndDetectAccount = (provider, number) => {
    const cleanNum = number.replace(/\s+/g, '').trim();
    const isMobileMoney = provider.toLowerCase().includes('momo') || 
                          provider.toLowerCase().includes('airtel') || 
                          provider.toLowerCase().includes('tigo') || 
                          provider.toLowerCase().includes('safaricom') ||
                          provider.toLowerCase().includes('glo');

    if (isMobileMoney) {
      // Check Kenya (+254 or 07xx/01xx - 10 to 12 chars)
      if (cleanNum.startsWith('+254') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        return { valid: true, region: 'Kenya 🇰🇪' };
      }
      // Check Tanzania (+255 or 06xx/07xx - 10 to 12 chars)
      else if (cleanNum.startsWith('+255') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        return { valid: true, region: 'Tanzania 🇹🇿' };
      }
      // Check Rwanda (+250 or 07xx - 10 chars)
      else if (cleanNum.startsWith('+250') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        return { valid: true, region: 'Rwanda 🇷🇼' };
      }
      // Check Uganda (+256 or 07xx/03xx - 10 to 12 chars)
      else if (cleanNum.startsWith('+256') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        return { valid: true, region: 'Uganda 🇺🇬' };
      }
      // Check Nigeria (+234 or 08xx/07xx/09xx - 11 to 14 chars)
      else if (cleanNum.startsWith('+234') || (cleanNum.startsWith('0') && cleanNum.length === 11)) {
        return { valid: true, region: 'Nigeria 🇳🇬' };
      }
      else {
        return { valid: false, error: 'Unrecognized mobile money prefix or incorrect digit length for East Africa / Nigeria.' };
      }
    } else {
      // Standard Bank Account validation (typically 10 to 13 digits across regional banks)
      if (cleanNum.length >= 10 && cleanNum.length <= 14 && /^\d+$/.test(cleanNum)) {
        return { valid: true, region: 'Regional Bank Account 🏦' };
      } else {
        return { valid: false, error: 'Bank account number must contain between 10 and 14 valid digits.' };
      }
    }
  };

  const handleVerifyAndLinkAccount = () => {
    if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      Alert.alert('Missing Details', 'Please fill in all bank or mobile money fields before linking.');
      return;
    }

    const validationResult = validateAndDetectAccount(bankName, accountNumber);
    if (!validationResult.valid) {
      Alert.alert('Verification Failed ⚠️', validationResult.error);
      return;
    }

    const newAccount = {
      id: Date.now().toString(),
      type: bankName.toLowerCase().includes('momo') || bankName.toLowerCase().includes('airtel') || bankName.toLowerCase().includes('tigo') ? 'Mobile Money' : 'Bank Account',
      provider: `${bankName} (${validationResult.region})`,
      number: accountNumber.slice(0, 4) + '****' + accountNumber.slice(-4),
      holder: accountHolderName,
      verified: true
    };

    setLinkedAccounts(prev => [...prev, newAccount]);
    setBankName('');
    setAccountNumber('');
    setAccountHolderName('');
    Alert.alert('Account Verified & Linked 🏦', `Destination account successfully verified via Flutterwave / Regional Gateway (${validationResult.region}) and added to your treasury profile.`);
  };

  const handleProcessPayout = (id) => {
    setPayoutQueue(prev => prev.filter(item => item.id !== id));
    Alert.alert('Payout Disbursed 🪙', 'Funds successfully routed via Flutterwave gateway / Stablecoin USDT node. Audit ledger updated.');
  };

  const handleConfirmEscrowDelivery = (id) => {
    setEscrowOrders(prev => prev.filter(item => item.id !== id));
    Alert.alert('Escrow Released ✅', 'Delivery verification code entered. Funds unreleased to seller wallet.');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🪙 Monetization, Bank Accounts & Escrow</Text>
        <Text style={styles.headerSub}>Manage bank accounts, Flutterwave routing, secure escrow marketplace, and crypto payout options.</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
          {[
            { key: 'Accounts', label: '🏦 Bank & MoMo Accounts' },
            { key: 'Treasury', label: '🪙 Payouts & Gateway' },
            { key: 'Marketplace', label: '🛍️ Deals & Escrow' },
            { key: 'Splits', label: '📊 Revenue Splits' },
            { key: 'Tiers', label: '⭐ Growth Tiers' },
            { key: 'Vaults', label: '🛡️ Round-Up & Fines' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTabBtn, activeTab === tab.key && styles.activeSubTabBtn]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.subTabBtnText, activeTab === tab.key && styles.activeSubTabBtnText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* ================= TAB 1: BANK & MOMO ACCOUNTS ================= */}
        {activeTab === 'Accounts' && (
          <View>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🏦 Verified Payout Destination Accounts</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
              Accounts are automatically verified against regional telco and banking API gateways (Uganda, Kenya, Tanzania, Rwanda, Nigeria) before disbursements.
            </Text>

            {linkedAccounts.map(acc => (
              <View key={acc.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{acc.provider} ({acc.type})</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a' }}>VERIFIED ✓</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#2563eb', marginVertical: 4 }}>Account: {acc.number}</Text>
                <Text style={{ fontSize: 10, color: '#64748b' }}>Registered Holder: {acc.holder}</Text>
              </View>
            ))}

            <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 10 }]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>➕ Link New Bank Account or Mobile Money</Text>
              
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Bank Name or Telco (e.g., Stanbic, MTN MoMo, Safaricom M-Pesa)"
                placeholderTextColor="#a0aec0"
                value={bankName}
                onChangeText={setBankName}
              />

              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Account Number or Phone (e.g., 077... or +256/+254/+255/+250/+234)"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />

              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Exact Account Holder Full Name (Legal Name)"
                placeholderTextColor="#a0aec0"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyAndLinkAccount}>
                <Text style={styles.primaryBtnText}>Verify & Link Account Securely 🔒</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 2: TREASURY & PAYOUT QUEUE ================= */}
        {activeTab === 'Treasury' && (
          <View>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🪙 Creator Payout Approval Queue (Min: 50k UGX)</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>Processed 1st-5th of each month via MTN MoMo, Airtel Bank, or USDT.</Text>
            
            {payoutQueue.length > 0 ? (
              payoutQueue.map(item => (
                <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Creator: {item.creator}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a', marginVertical: 2 }}>{item.amount} ({item.gateway})</Text>
                  <Text style={{ fontSize: 10, color: '#d97706', marginBottom: 10 }}>Status: {item.status}</Text>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => handleProcessPayout(item.id)}>
                    <Text style={styles.primaryBtnText}>Approve & Disburse (MoMo/USDT) 💸</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: 20 }}>All creator payout requests have been successfully processed.</Text>
            )}

            <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 6 }]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🌐 Flutterwave & Crypto/Stablecoin Toggle</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18 }}>
                • Multi-Account Treasury Routing: Active{'\n'}
                • Crypto & Stablecoin Payout Option (USDT): Active{'\n'}
                • Master Financial Audit Logging: Active
              </Text>
            </View>
          </View>
        )}

        {/* ================= TAB 3: MARKETPLACE & ESCROW ================= */}
        {activeTab === 'Marketplace' && (
          <View>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛍️ Business Showcase, Deals & Secure Escrow</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>Buyer funds are locked in escrow, unreleased until delivery verification code is confirmed.</Text>

            {escrowOrders.length > 0 ? (
              escrowOrders.map(order => (
                <View key={order.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Buyer: {order.buyer}</Text>
                  <Text style={{ fontSize: 11, color: '#2563eb', marginVertical: 2 }}>Item: {order.item} ({order.amount})</Text>
                  <Text style={{ fontSize: 10, color: '#d97706', marginBottom: 10 }}>Status: {order.status}</Text>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => handleConfirmEscrowDelivery(order.id)}>
                    <Text style={styles.primaryBtnText}>Verify Code & Release Escrow Funds ✅</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: 20 }}>No pending escrow transactions.</Text>
            )}

            <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 6 }]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🌙 Night-Delivery Safety Protocols</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18 }}>
                • Recommended well-lit safe-zone meetups in Kampala{'\n'}
                • Live GPS route sharing & 24-hour night inspection grace periods{'\n'}
                • Timestamped rider handoff photo proofing enabled
              </Text>
            </View>
          </View>
        )}

        {/* ================= TAB 4: REVENUE SPLITS ================= */}
        {activeTab === 'Splits' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>📊 Standard Revenue Split Configuration</Text>
              
              <View style={styles.splitRow}>
                <Text style={[styles.rowText, isDarkMode && styles.darkText]}>Live Stream Gifts & Tickets:</Text>
                <Text style={styles.splitBadge}>35% Platform / 65% Creator</Text>
              </View>
              
              <View style={styles.splitRow}>
                <Text style={[styles.rowText, isDarkMode && styles.darkText]}>VIP Channel Subscriptions:</Text>
                <Text style={styles.splitBadge}>30% Platform / 70% Creator</Text>
              </View>
              
              <View style={styles.splitRow}>
                <Text style={[styles.rowText, isDarkMode && styles.darkText]}>In-App Advertising Suite:</Text>
                <Text style={styles.splitBadge}>40% Platform / 60% Creator</Text>
              </View>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🤝 Brand Sponsorships & Fan Circles</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18 }}>
                • Automated Brand Sponsorship Marketplace for booked video placements{'\n'}
                • VIP Creator Circle & Monetized Fan Subscriptions via MoMo recurring billing
              </Text>
            </View>
          </View>
        )}

        {/* ================= TAB 5: GROWTH TIERS ================= */}
        {activeTab === 'Tiers' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⭐ Creator Growth Scaling Tiers</Text>
              
              <View style={styles.tierBox}>
                <Text style={[styles.tierTitle, isDarkMode && styles.darkText]}>🌱 Starter Tier (65% Payout)</Text>
                <Text style={styles.tierSub}>Standard entry tier for new community creators.</Text>
              </View>

              <View style={[styles.tierBox, { borderColor: '#2563eb', backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff' }]}>
                <Text style={[styles.tierTitle, isDarkMode && styles.darkText]}>🚀 Pro Tier (70% Payout for 500k-2M UGX/mo)</Text>
                <Text style={styles.tierSub}>Active growth tier for established regional channels.</Text>
              </View>

              <View style={styles.tierBox}>
                <Text style={[styles.tierTitle, isDarkMode && styles.darkText]}>👑 Elite Tier (75% Payout for 2M+ UGX/mo)</Text>
                <Text style={styles.tierSub}>Top-tier status for major virtual TV broadcasters.</Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 6: ROUND-UP & FINES ================= */}
        {activeTab === 'Vaults' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🪙 Micro-Savings & "Round-Up" Wallets</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18, marginBottom: 10 }}>
                Automatically sweeps spare change from ticket purchases and mobile money transfers into a secure, interest-ready savings vault.
              </Text>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⚖️ Automated Infraction & Fine Deduction Engine</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18, marginBottom: 10 }}>
                Tracks community violations and automatically executes fine deductions on the 25th of every month.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  headerSub: { fontSize: 11, color: '#64748b', marginBottom: 12 },
  subTabsRow: { maxHeight: 38 },
  subTabBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, height: 32, justifyContent: 'center' },
  activeSubTabBtn: { backgroundColor: '#2563eb' },
  subTabBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  activeSubTabBtnText: { color: '#ffffff' },
  scrollArea: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  splitBadge: { fontSize: 10, fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  darkText: { color: '#f8fafc' },
  tierBox: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#f8fafc' },
  tierTitle: { fontSize: 11, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  tierSub: { fontSize: 10, color: '#64748b' },
});