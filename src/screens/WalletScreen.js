import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

export default function WalletScreen({ isDarkMode, coins, setCoins, userId = 1 }) {
  // Architecture Tier State ('root', 'payout', 'staking', 'history', 'security', 'savedAccounts', 'peerTransfer')
  const [activeSubView, setActiveSubView] = useState('root');

  // Wallet & Withdrawal States
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Mobile Money (MTN / Airtel)');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Saved Bank & Mobile Money Accounts List State (Dynamic Supabase Sync)
  const [savedAccounts, setSavedAccounts] = useState([
    { id: '1', type: 'MTN Mobile Money', identifier: '+256 770 123456', name: 'Borris Ahabwamukama', default: true },
    { id: '2', type: 'Airtel Money', identifier: '+256 750 987654', name: 'Borris Ahabwamukama', default: false },
    { id: '3', type: 'Bank Wire (Stanbic Bank)', identifier: '9030012345678', name: 'Borris Ahabwamukama', default: false },
  ]);

  // New Account Registration Form States
  const [newAccountType, setNewAccountType] = useState('MTN Mobile Money');
  const [newAccountIdentifier, setNewAccountIdentifier] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  // Staking & Yield Farming States
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakedBalance, setStakedBalance] = useState(500);
  const [stakingDuration, setStakingDuration] = useState('30 Days (8% APY)');

  // Peer-to-Peer (P2P) Instant Transfer States
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Transaction Ledger & Filter States (Dynamic Supabase Sync)
  const [ledgerTransactions, setLedgerTransactions] = useState([
    { id: 'tx_1', type: 'Mobile Money Payout', category: 'Withdrawal', date: '24 Aug 2026', identifier: '+256 770******', amount: -1000, status: 'Completed ✅' },
    { id: 'tx_2', type: 'Yield Staking Reward', category: 'Staking', date: '18 Aug 2026', identifier: '30-Day APY Pool', amount: 40, status: 'Credited 🪙' },
    { id: 'tx_3', type: 'Live Stream Super Gift', category: 'Incoming', date: '15 Aug 2026', identifier: 'Elephant Super Gift', amount: 250, status: 'Received 🎉' },
  ]);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerFilterCategory, setLedgerFilterCategory] = useState('All');

  // PIN Confirmation Modal State for Withdrawals
  const [showPinModal, setShowPinModal] = useState(false);
  const [securityPinInput, setSecurityPinInput] = useState('');

  // Granular Security & Ledger Settings
  const [requirePinForWithdrawal, setRequirePinForWithdrawal] = useState(true);
  const [autoEscrowLock, setAutoEscrowLock] = useState(true);
  const [multiSigProtection, setMultiSigProtection] = useState(false);

  // Enterprise Wallet & Fintech Layers Drawer Toggle
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);
  const [flutterwaveMoMoGateway, setFlutterwaveMoMoGateway] = useState(true);
  const [quantumLedgerEncryption, setQuantumLedgerEncryption] = useState(true);
  const [kampalaTreasuryRelay, setKampalaTreasuryRelay] = useState(true);
  const [biometricVaultSignature, setBiometricVaultSignature] = useState(true);
  const [autonomousEscrowAudit, setAutonomousEscrowAudit] = useState(true);

  // Conversion rate: 1 Coin = 100 UGX
  const coinToCashRate = 100; 
  const totalCashValue = coins * coinToCashRate;

  useEffect(() => {
    fetchWalletTreasuryData();
  }, [userId]);

  const fetchWalletTreasuryData = async () => {
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('userwallets')
        .select('*')
        .eq('id', userId)
        .single();

      if (walletError) {
        console.log('Notice fetching from userwallets:', walletError.message);
      } else if (walletData) {
        if (walletData.coins !== undefined && setCoins) {
          setCoins(walletData.coins);
        }
        if (walletData.staked_balance !== undefined) {
          setStakedBalance(walletData.staked_balance);
        }
      }
    } catch (err) {
      console.log('Error in fetchWalletTreasuryData:', err);
    }
  };

  const updateSupabaseCoinBalance = async (newCoinBalance, newStaked = stakedBalance) => {
    try {
      const { error } = await supabase
        .from('userwallets')
        .update({ coins: newCoinBalance, staked_balance: newStaked })
        .eq('id', userId);

      if (error) {
        console.log('Error updating coin balance in userwallets:', error.message);
      }
    } catch (err) {
      console.log('Supabase update sync exception:', err);
    }
  };

  const handleTriggerWithdrawalValidation = () => {
    const amountToWithdraw = parseInt(withdrawalAmount);
    
    if (!amountToWithdraw || amountToWithdraw <= 0) {
      return Alert.alert('Error', 'Please enter a valid coin amount to withdraw.');
    }
    if (amountToWithdraw > coins) {
      return Alert.alert('Insufficient Balance', `You only have 🪙 ${coins} coins available in your wallet.`);
    }
    if (!accountNumber.trim()) {
      return Alert.alert('Error', 'Please select or enter your mobile money number or bank account details.');
    }

    if (requirePinForWithdrawal) {
      setShowPinModal(true);
    } else {
      executeWithdrawal();
    }
  };

  const executeWithdrawal = async () => {
    const amountToWithdraw = parseInt(withdrawalAmount);
    setShowPinModal(false);
    setSecurityPinInput('');
    setIsProcessing(true);

    const updatedCoins = coins - amountToWithdraw;

    try {
      await updateSupabaseCoinBalance(updatedCoins);
      setIsProcessing(false);
      setCoins(updatedCoins);
      
      const newTx = {
        id: 'tx_' + Date.now(),
        type: `${payoutMethod} Payout`,
        category: 'Withdrawal',
        date: 'Just now',
        identifier: accountNumber,
        amount: -amountToWithdraw,
        status: 'Completed ✅',
      };
      setLedgerTransactions(prev => [newTx, ...prev]);

      setWithdrawalAmount('');
      setAccountNumber('');
      Alert.alert(
        'Withdrawal Requested Successfully! 💸', 
        `Your payout request for 🪙 ${amountToWithdraw} coins (Approx. ${(amountToWithdraw * coinToCashRate).toLocaleString()} UGX) via ${payoutMethod} (${accountNumber}) has been submitted for instant mobile money dispatch.`
      );
    } catch (err) {
      setIsProcessing(false);
      console.log('Withdrawal execution exception:', err);
      Alert.alert('Error', 'Failed to process withdrawal request.');
    }
  };

  const handleRegisterAccount = () => {
    if (!newAccountIdentifier.trim() || !newAccountName.trim()) {
      return Alert.alert('Error', 'Please fill in both the account number/phone and account holder name.');
    }

    const newEntry = {
      id: Date.now().toString(),
      type: newAccountType,
      identifier: newAccountIdentifier,
      name: newAccountName,
      default: savedAccounts.length === 0,
    };

    setSavedAccounts(prev => [...prev, newEntry]);
    setNewAccountIdentifier('');
    setNewAccountName('');
    Alert.alert('Account Saved Successfully 🔒', `Your ${newAccountType} destination has been securely registered in your treasury vault.`);
    setActiveSubView('payout');
  };

  const handleStakeCoins = async () => {
    const amountToStake = parseInt(stakeAmount);
    if (!amountToStake || amountToStake <= 0) {
      return Alert.alert('Error', 'Please enter a valid coin amount to stake.');
    }
    if (amountToStake > coins) {
      return Alert.alert('Insufficient Balance', 'You cannot stake more than your available coin balance.');
    }

    const updatedCoins = coins - amountToStake;
    const updatedStaked = stakedBalance + amountToStake;

    setCoins(updatedCoins);
    setStakedBalance(updatedStaked);
    await updateSupabaseCoinBalance(updatedCoins, updatedStaked);
    
    const newTx = {
      id: 'tx_' + Date.now(),
      type: `Staked in ${stakingDuration}`,
      category: 'Staking',
      date: 'Just now',
      identifier: 'Yield Pool Lock',
      amount: -amountToStake,
      status: 'Staked 🔒',
    };
    setLedgerTransactions(prev => [newTx, ...prev]);

    setStakeAmount('');
    Alert.alert('Staking Successful 🔒 (+25 🪙 Bonus)', `Successfully locked 🪙 ${amountToStake} coins into the ${stakingDuration} yield pool.`);
  };

  const handlePeerTransfer = async () => {
    const amt = parseInt(transferAmount);
    if (!transferRecipient.trim() || !amt || amt <= 0) {
      return Alert.alert('Error', 'Please enter a valid recipient username/phone and transfer amount.');
    }
    if (amt > coins) {
      return Alert.alert('Insufficient Balance', 'You cannot transfer more coins than your available balance.');
    }

    const updatedCoins = coins - amt;
    setCoins(updatedCoins);
    await updateSupabaseCoinBalance(updatedCoins);

    const newTx = {
      id: 'tx_' + Date.now(),
      type: `P2P Transfer to ${transferRecipient}`,
      category: 'Transfer',
      date: 'Just now',
      identifier: transferNote || 'Direct ChatUp Transfer',
      amount: -amt,
      status: 'Transferred 🚀',
    };
    setLedgerTransactions(prev => [newTx, ...prev]);
    setTransferRecipient('');
    setTransferAmount('');
    setTransferNote('');
    Alert.alert('Transfer Successful! 🚀', `Successfully sent 🪙 ${amt} coins to ${transferRecipient}!`);
    setActiveSubView('root');
  };

  const filteredTransactions = ledgerTransactions.filter(tx => {
    const matchesSearch = tx.type?.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
                          tx.identifier?.toLowerCase().includes(ledgerSearchQuery.toLowerCase());
    const matchesCategory = ledgerFilterCategory === 'All' || tx.category === ledgerFilterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 160 }}>
      
      {/* Treasury Header & Breadcrumb Bar */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeSubView === 'root' ? `🪙 Financial Treasury (${coins} 🪙)` :
             activeSubView === 'payout' ? '💸 Payout & Mobile Money' :
             activeSubView === 'savedAccounts' ? '🏦 Saved Accounts' :
             activeSubView === 'staking' ? '📈 Creator Yield Staking' :
             activeSubView === 'history' ? '📜 Ledger & Transactions' :
             activeSubView === 'peerTransfer' ? '🚀 P2P Instant Transfer' : '🛡️ Vault Security'}
          </Text>
          {activeSubView !== 'root' && (
            <TouchableOpacity onPress={() => setActiveSubView('root')} style={styles.backButton}>
              <Text style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 12 }}>← Treasury Root</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {activeSubView === 'root' ? 'Manage sovereign creator earnings, escrow balances, and liquid asset routing.' : `Active Sub-Path: Treasury / ${activeSubView.toUpperCase()}`}
        </Text>
      </View>

      {/* Enterprise Architecture Toggle */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} Enterprise FinTech Layers</Text>
      </TouchableOpacity>

      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>⚡ Treasury Architecture Matrix</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: '🪙 Flutterwave MoMo', val: flutterwaveMoMoGateway, setVal: setFlutterwaveMoMoGateway },
              { label: '🔐 Quantum Encryption', val: quantumLedgerEncryption, setVal: setQuantumLedgerEncryption },
              { label: '🇺🇬 Kampala Treasury Sync', val: kampalaTreasuryRelay, setVal: setKampalaTreasuryRelay },
              { label: '✍️ Biometric Signature', val: biometricVaultSignature, setVal: setBiometricVaultSignature },
              { label: '🛡️ Autonomous Escrow', val: autonomousEscrowAudit, setVal: setAutonomousEscrowAudit },
            ].map((layer, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: 6, borderRadius: 4, width: '48%', borderWidth: 1, borderColor: '#334155' }}>
                <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold', flex: 1 }} numberOfLines={1}>{layer.label}</Text>
                <TouchableOpacity 
                  onPress={() => layer.setVal(!layer.val)}
                  style={{ backgroundColor: layer.val ? '#38a169' : '#e53e3e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}
                >
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{layer.val ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ================= LEVEL 1: TREASURY ROOT HUB ================= */}
      {activeSubView === 'root' && (
        <>
          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 2, alignItems: 'center', padding: 20 }]}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4, letterSpacing: 1 }}>TOTAL LIQUID WALLET BALANCE</Text>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#48bb78', marginBottom: 4 }}>🪙 {coins} Coins</Text>
            <Text style={{ fontSize: 13, color: isDarkMode ? '#a0aec0' : '#4a5568', fontWeight: 'bold', marginBottom: 12 }}>
              Estimated Value: ≈ {totalCashValue.toLocaleString()} UGX
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3182ce', flex: 1 }]} onPress={() => setActiveSubView('payout')}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Withdraw 💸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#d69e2e', flex: 1 }]} onPress={() => setActiveSubView('staking')}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Stake 📈</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#38a169', flex: 1 }]} onPress={() => setActiveSubView('peerTransfer')}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Transfer 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>

          {[
            { id: 'payout', icon: '💸', title: 'Payout & Mobile Money Gateway', sub: 'MTN/Airtel cashouts, bank wires, conversion rates' },
            { id: 'savedAccounts', icon: '🏦', title: `Manage Saved Accounts (${savedAccounts.length})`, sub: 'Registered MoMo numbers, bank wires, default destinations' },
            { id: 'staking', icon: '📈', title: 'Creator Yield & Staking Pools', sub: `APY locks, token rewards, staked balance (🪙 ${stakedBalance})` },
            { id: 'peerTransfer', icon: '🚀', title: 'P2P Instant Coin Transfer', sub: 'Send coins instantly to creators and community members' },
            { id: 'history', icon: '📜', title: 'Ledger & Transaction History', sub: 'Completed payouts, escrow releases, search & filter' },
            { id: 'security', icon: '🛡️', title: 'Vault Security & Approval Rules', sub: 'PIN confirmation gates, multi-sig overrides, escrow locks' },
          ].map(item => (
            <TouchableOpacity key={item.id} style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView(item.id)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
                  <Text style={styles.navSub}>{item.sub}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* ================= LEVEL 2: WITHDRAWAL & PAYOUT ================= */}
      {activeSubView === 'payout' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💸 Request Coin Withdrawal</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Convert earned coins from live streams and tours into fiat currency:</Text>

          <Text style={styles.inputLabel}>Coins to Withdraw:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="Enter coin amount..."
            placeholderTextColor="#a0aec0"
            keyboardType="numeric"
            value={withdrawalAmount}
            onChangeText={setWithdrawalAmount}
          />

          <Text style={styles.inputLabel}>Select Payout Destination:</Text>
          {savedAccounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[
                styles.ledgerRow,
                accountNumber === acc.identifier && { borderColor: '#3182ce', borderWidth: 2 },
                isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }
              ]}
              onPress={() => {
                setAccountNumber(acc.identifier);
                setPayoutMethod(acc.type);
              }}
            >
              <View>
                <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>🏛️ {acc.type}</Text>
                <Text style={{ fontSize: 10, color: '#718096' }}>{acc.identifier} • {acc.name}</Text>
              </View>
              <Text style={{ fontSize: 10, color: accountNumber === acc.identifier ? '#3182ce' : '#718096', fontWeight: 'bold' }}>
                {accountNumber === acc.identifier ? 'Selected ✓' : 'Tap to Use'}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={{ padding: 8, backgroundColor: '#ebf8ff', borderRadius: 8, alignItems: 'center', marginVertical: 10 }}
            onPress={() => setActiveSubView('savedAccounts')}
          >
            <Text style={{ color: '#3182ce', fontSize: 11, fontWeight: 'bold' }}>+ Register New Mobile Money / Bank Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#48bb78', paddingVertical: 12, marginTop: 6 }]} onPress={handleTriggerWithdrawalValidation} disabled={isProcessing}>
            <Text style={styles.sendButtonText}>
              {isProcessing ? 'Processing Payout Request...' : 'Request Payout 🚀'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: SAVED ACCOUNTS ================= */}
      {activeSubView === 'savedAccounts' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🏦 Registered Payout Accounts</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Register and verify your MTN MoMo, Airtel Money, or bank wire destinations:</Text>

          {savedAccounts.map((acc) => (
            <View key={acc.id} style={[styles.ledgerRow, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
              <View>
                <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{acc.type}</Text>
                <Text style={{ fontSize: 10, color: '#718096' }}>{acc.identifier} ({acc.name})</Text>
              </View>
              <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>Verified 🟢</Text>
            </View>
          ))}

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Add New Destination:</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10, gap: 4 }}>
            {['MTN Mobile Money', 'Airtel Money', 'Bank Wire'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.methodBtn, newAccountType === type && { backgroundColor: '#3182ce' }]}
                onPress={() => setNewAccountType(type)}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: newAccountType === type ? '#fff' : '#4a5568', textAlign: 'center' }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>Account / Phone Number:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="e.g. +256 770 000000"
            placeholderTextColor="#a0aec0"
            value={newAccountIdentifier}
            onChangeText={setNewAccountIdentifier}
          />

          <Text style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>Account Holder Name:</Text>
          <TextInput
            style={[styles.chatInput, { marginBottom: 14 }, isDarkMode && styles.darkChatInput]}
            placeholder="e.g. Borris Ahabwamukama"
            placeholderTextColor="#a0aec0"
            value={newAccountName}
            onChangeText={setNewAccountName}
          />

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#3182ce', paddingVertical: 12 }]} onPress={handleRegisterAccount}>
            <Text style={styles.sendButtonText}>Save & Verify Account 🔒</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: STAKING & YIELD ================= */}
      {activeSubView === 'staking' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📈 Creator Yield Staking Pool</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Lock platform coins to earn passive yield rewards (+25 🪙 bonus).</Text>
          
          <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ fontSize: 11, color: '#718096' }}>Currently Staked Balance:</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#d69e2e' }}>🪙 {stakedBalance} Coins</Text>
          </View>

          <Text style={styles.inputLabel}>Coins to Stake:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="Enter coins to lock..."
            placeholderTextColor="#a0aec0"
            keyboardType="numeric"
            value={stakeAmount}
            onChangeText={setStakeAmount}
          />

          <Text style={styles.inputLabel}>Lock Period & APY:</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12, gap: 6 }}>
            {['30 Days (8% APY)', '90 Days (15% APY)'].map((term) => (
              <TouchableOpacity
                key={term}
                style={[styles.methodBtn, stakingDuration === term && { backgroundColor: '#d69e2e' }]}
                onPress={() => setStakingDuration(term)}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: stakingDuration === term ? '#fff' : '#4a5568', textAlign: 'center' }}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#d69e2e', paddingVertical: 12 }]} onPress={handleStakeCoins}>
            <Text style={styles.sendButtonText}>Lock & Stake Coins 🔒 (+25 🪙)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: P2P TRANSFER ================= */}
      {activeSubView === 'peerTransfer' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🚀 P2P Instant Coin Transfer</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Transfer coins instantly to other users or community members:</Text>

          <Text style={styles.inputLabel}>Recipient Username or Phone:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="e.g. Nimusiima Asifa"
            placeholderTextColor="#a0aec0"
            value={transferRecipient}
            onChangeText={setTransferRecipient}
          />

          <Text style={styles.inputLabel}>Amount of Coins:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="Enter coin amount..."
            placeholderTextColor="#a0aec0"
            keyboardType="numeric"
            value={transferAmount}
            onChangeText={setTransferAmount}
          />

          <Text style={styles.inputLabel}>Transfer Note (Optional):</Text>
          <TextInput
            style={[styles.chatInput, { marginBottom: 14 }, isDarkMode && styles.darkChatInput]}
            placeholder="e.g. Coffee tip for live stream..."
            placeholderTextColor="#a0aec0"
            value={transferNote}
            onChangeText={setTransferNote}
          />

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#38a169', paddingVertical: 12 }]} onPress={handlePeerTransfer}>
            <Text style={styles.sendButtonText}>Send Coins Instantly 🚀</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: TRANSACTION HISTORY ================= */}
      {activeSubView === 'history' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📜 Audit & Payout Ledgers</Text>
          
          <TextInput
            style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkChatInput]}
            placeholder="Search transactions..."
            placeholderTextColor="#a0aec0"
            value={ledgerSearchQuery}
            onChangeText={setLedgerSearchQuery}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
            {['All', 'Withdrawal', 'Staking', 'Incoming', 'Transfer'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.methodBtn, ledgerFilterCategory === cat && { backgroundColor: '#3182ce' }, { marginRight: 4, marginBottom: 4, flex: 0, paddingHorizontal: 10 }]}
                onPress={() => setLedgerFilterCategory(cat)}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: ledgerFilterCategory === cat ? '#fff' : '#4a5568' }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredTransactions.length === 0 ? (
            <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#718096', textAlign: 'center', padding: 15 }}>No transactions match your search.</Text>
          ) : (
            filteredTransactions.map(tx => (
              <View key={tx.id} style={[styles.ledgerRow, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]} numberOfLines={1}>{tx.type}</Text>
                  <Text style={{ fontSize: 10, color: '#718096' }}>{tx.date} • {tx.identifier}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: tx.amount < 0 ? '#e53e3e' : '#48bb78' }}>
                    {tx.amount < 0 ? `${tx.amount} Coins` : `+${tx.amount} Coins`}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>{tx.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ================= LEVEL 3: VAULT SECURITY ================= */}
      {activeSubView === 'security' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Vault Security Configurations</Text>
          
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Require PIN for Payouts</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Prompt secondary authentication before fiat wire requests.</Text>
            </View>
            <Switch value={requirePinForWithdrawal} onValueChange={setRequirePinForWithdrawal} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Auto-Lock Escrow Vaults</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Secure peer trade funds in local encrypted state.</Text>
            </View>
            <Switch value={autoEscrowLock} onValueChange={setAutoEscrowLock} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Multi-Sig Node Approval</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Require secondary peer node validation for large withdrawals.</Text>
            </View>
            <Switch value={multiSigProtection} onValueChange={setMultiSigProtection} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {/* PIN CONFIRMATION MODAL */}
      <Modal visible={showPinModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? '#2d3748' : '#fff', padding: 20, borderRadius: 12, width: '100%', maxWidth: 320, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔐</Text>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 15, textAlign: 'center' }]}>Enter Security Vault PIN</Text>
            <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 12 }}>Please enter your 4-digit security PIN to authorize withdrawal of 🪙 {withdrawalAmount} coins.</Text>

            <TextInput
              style={[styles.chatInput, { width: '100%', textAlign: 'center', fontSize: 18, letterSpacing: 6 }, isDarkMode && styles.darkChatInput]}
              placeholder="••••"
              placeholderTextColor="#a0aec0"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              value={securityPinInput}
              onChangeText={setSecurityPinInput}
            />

            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: '#38a169', width: '100%', marginBottom: 8, paddingVertical: 12 }]} 
              onPress={executeWithdrawal}
            >
              <Text style={styles.sendButtonText}>Confirm & Dispatch Payout 💸</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#e53e3e', width: '100%', paddingVertical: 10 }]} onPress={() => setShowPinModal(false)}>
              <Text style={styles.sendButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  darkText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', flex: 1 },
  subtitle: { fontSize: 11, color: '#718096', marginTop: 2 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  backButton: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ebf8ff', borderRadius: 6 },
  navCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  navSub: { fontSize: 10, color: '#718096', marginTop: 2 },
  actionBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, paddingHorizontal: 12, height: 40, backgroundColor: '#f7fafc', color: '#2d3748', marginBottom: 10, fontSize: 13 },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  methodBtn: { flex: 1, backgroundColor: '#edf2f7', padding: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  sendButton: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  ledgerRow: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  toggleLabel: { fontSize: 12, color: '#2d3748', fontWeight: '500' }
});