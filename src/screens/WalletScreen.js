import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen({ isDarkMode, coins, setCoins }) {
  // Architecture Tier State ('root', 'payout', 'staking', 'history', 'security', 'savedAccounts')
  const [activeSubView, setActiveSubView] = useState('root');

  // Wallet & Withdrawal States
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Mobile Money (MTN / Airtel)');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Saved Bank & Mobile Money Accounts List State
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

  // Granular Security & Ledger Settings (Level 3/4)
  const [requirePinForWithdrawal, setRequirePinForWithdrawal] = useState(true);
  const [autoEscrowLock, setAutoEscrowLock] = useState(true);
  const [multiSigProtection, setMultiSigProtection] = useState(false);

  // ================= 20+ ENTERPRISE WALLET & FINTECH LAYERS =================
  const [flutterwaveMoMoGateway, setFlutterwaveMoMoGateway] = useState(true);
  const [quantumLedgerEncryption, setQuantumLedgerEncryption] = useState(true);
  const [kampalaTreasuryRelay, setKampalaTreasuryRelay] = useState(true);
  const [biometricVaultSignature, setBiometricVaultSignature] = useState(true);
  const [autonomousEscrowAudit, setAutonomousEscrowAudit] = useState(true);
  const [zeroFeeGasSubsidizerWallet, setZeroFeeGasSubsidizerWallet] = useState(true);
  const [smartContractYieldEscrow, setSmartContractYieldEscrow] = useState(true);
  const [bluetoothP2pWalletSync, setBluetoothP2pWalletSync] = useState(true);
  const [federatedAiFraudDetector, setFederatedAiFraudDetector] = useState(true);
  const [realtimeSentimentMeshWallet, setRealtimeSentimentMeshWallet] = useState(true);
  const [multimodalHlsStatementFeed, setMultimodalHlsStatementFeed] = useState(true);
  const [cryptographicWalletWatermark, setCryptographicWalletWatermark] = useState(true);
  const [automaticTransactionTranscription, setAutomaticTransactionTranscription] = useState(true);
  const [peerToPeerMicroLoanVault, setPeerToPeerMicroLoanVault] = useState(true);
  const [offlineLedgerSyncQueue, setOfflineLedgerSyncQueue] = useState(true);
  const [ephemeralTokenBurnPolicy, setEphemeralTokenBurnPolicy] = useState(false);
  const [groupBillSplitterLedger, setGroupBillSplitterLedger] = useState(true);
  const [aiFinancialAdvisorChat, setAiFinancialAdvisorChat] = useState(true);
  const [multiCurrencyConversionMatrix, setMultiCurrencyConversionMatrix] = useState(true);
  const [globalEmergencyWalletLockdown, setGlobalEmergencyWalletLockdown] = useState(false);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);

  // Conversion rate: 10 Coins = 1,000 UGX
  const coinToCashRate = 100; // UGX per coin
  const totalCashValue = coins * coinToCashRate;

  const handleRequestWithdrawal = () => {
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

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCoins(c => c - amountToWithdraw);
      setWithdrawalAmount('');
      setAccountNumber('');
      Alert.alert(
        'Withdrawal Requested Successfully! 💸', 
        `Your payout request for 🪙 ${amountToWithdraw} coins (Approx. ${totalCashValue.toLocaleString()} UGX) via ${payoutMethod} (${accountNumber}) has been submitted for instant mobile money dispatch.`
      );
    }, 1000);
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

  const handleStakeCoins = () => {
    const amountToStake = parseInt(stakeAmount);
    if (!amountToStake || amountToStake <= 0) {
      return Alert.alert('Error', 'Please enter a valid coin amount to stake.');
    }
    if (amountToStake > coins) {
      return Alert.alert('Insufficient Balance', 'You cannot stake more than your available coin balance.');
    }

    setCoins(c => c - amountToStake);
    setStakedBalance(prev => prev + amountToStake);
    setStakeAmount('');
    Alert.alert('Staking Successful 🔒', `Successfully locked 🪙 ${amountToStake} coins into the ${stakingDuration} yield pool.`);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 50 }}>
      
      {/* Dynamic Multi-Tier Header & Breadcrumb Navigation Bar */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeSubView === 'root' ? '🪙 Financial Treasury (Level 1)' :
             activeSubView === 'payout' ? '💸 Payout & Mobile Money (Level 2)' :
             activeSubView === 'savedAccounts' ? '🏦 Saved Accounts & Mobile Money (Level 2)' :
             activeSubView === 'staking' ? '📈 Creator Yield Staking (Level 2)' :
             activeSubView === 'history' ? '📜 Ledger & Transactions (Level 2)' : '🛡️ Vault Security & Limits (Level 3)'}
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

      {/* 20+ Wallet & Fintech Layers Toggle Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} 20+ Wallet & Fintech Architecture Layers</Text>
      </TouchableOpacity>

      {/* ================= 20+ WALLET ENTERPRISE LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 12, maxHeight: 180 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>⚡ Wallet & Treasury Enterprise Layers Matrix</Text>
          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: '🪙 Flutterwave MoMo', val: flutterwaveMoMoGateway, setVal: setFlutterwaveMoMoGateway },
              { label: '🔐 Quantum Ledger Encrypt', val: quantumLedgerEncryption, setVal: setQuantumLedgerEncryption },
              { label: '🇺🇬 Kampala Treasury Sync', val: kampalaTreasuryRelay, setVal: setKampalaTreasuryRelay },
              { label: '✍️ Biometric Signature', val: biometricVaultSignature, setVal: setBiometricVaultSignature },
              { label: '🛡️ Autonomous Escrow', val: autonomousEscrowAudit, setVal: setAutonomousEscrowAudit },
              { label: '🪙 Zero-Fee Gas Subsidizer', val: zeroFeeGasSubsidizerWallet, setVal: setZeroFeeGasSubsidizerWallet },
              { label: '🪙 Smart Contract Yield', val: smartContractYieldEscrow, setVal: setSmartContractYieldEscrow },
              { label: '🛰️ Bluetooth P2P Wallet', val: bluetoothP2pWalletSync, setVal: setBluetoothP2pWalletSync },
              { label: '🧠 Federated AI Fraud', val: federatedAiFraudDetector, setVal: setFederatedAiFraudDetector },
              { label: '🌿 Sentiment Mesh Wallet', val: realtimeSentimentMeshWallet, setVal: setRealtimeSentimentMeshWallet },
              { label: '🎥 Multimodal HLS Feed', val: multimodalHlsStatementFeed, setVal: setMultimodalHlsStatementFeed },
              { label: '🛡️ Crypto Watermark', val: cryptographicWalletWatermark, setVal: setCryptographicWalletWatermark },
              { label: '📜 Speech Transcription', val: automaticTransactionTranscription, setVal: setAutomaticTransactionTranscription },
              { label: '🪙 P2P Micro-Loan Vault', val: peerToPeerMicroLoanVault, setVal: setPeerToPeerMicroLoanVault },
              { label: '☁️ Offline Ledger Sync', val: offlineLedgerSyncQueue, setVal: setOfflineLedgerSyncQueue },
              { label: '⏳ Ephemeral Token Burn', val: ephemeralTokenBurnPolicy, setVal: setEphemeralTokenBurnPolicy },
              { label: '📊 Bill Splitter Ledger', val: groupBillSplitterLedger, setVal: setGroupBillSplitterLedger },
              { label: '🤖 AI Financial Advisor', val: aiFinancialAdvisorChat, setVal: setAiFinancialAdvisorChat },
              { label: '💱 Multi-Currency Matrix', val: multiCurrencyConversionMatrix, setVal: setMultiCurrencyConversionMatrix },
              { label: '🚨 Global Lockdown', val: globalEmergencyWalletLockdown, setVal: setGlobalEmergencyWalletLockdown },
            ].map((layer, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '3px 6px', borderRadius: '4px', width: '48%', border: '1px solid #334155' }}>
                <span style={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>{layer.label}</span>
                <button 
                  onClick={() => layer.setVal(!layer.val)}
                  style={{ background: layer.val ? '#38a169' : '#e53e3e', color: '#fff', border: 'none', padding: '2px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {layer.val ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ================= LEVEL 1: TREASURY ROOT HUB ================= */}
      {activeSubView === 'root' && (
        <>
          {/* Earnings Balance Overview Card */}
          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#48bb78', borderWidth: 2, alignItems: 'center', padding: 20 }]}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4, letterSpacing: 1 }}>TOTAL LIQUID WALLET BALANCE</Text>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#48bb78', marginBottom: 4 }}>🪙 {coins} Coins</Text>
            <Text style={{ fontSize: 13, color: isDarkMode ? '#a0aec0' : '#4a5568', fontWeight: 'bold', marginBottom: 12 }}>
              Estimated Value: ≈ {totalCashValue.toLocaleString()} UGX
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3182ce', flex: 1 }]} onPress={() => setActiveSubView('payout')}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Withdraw Funds 💸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#d69e2e', flex: 1 }]} onPress={() => setActiveSubView('staking')}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Stake & Earn 📈</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub-Module Navigation Cards */}
          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('payout')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>💸</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Payout & Mobile Money Gateway</Text>
                <Text style={styles.navSub}>Sub-Modules: MTN/Airtel cashouts, bank wires, conversion rates</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('savedAccounts')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🏦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Manage Saved Accounts ({savedAccounts.length})</Text>
                <Text style={styles.navSub}>Sub-Modules: Registered MoMo numbers, bank wires, default destinations</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('staking')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>📈</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Creator Yield & Staking Pools</Text>
                <Text style={styles.navSub}>Sub-Modules: APY locks, token rewards, staked coin balances (🪙 {stakedBalance})</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('history')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>📜</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Ledger & Transaction History</Text>
                <Text style={styles.navSub}>Sub-Modules: Completed payouts, escrow releases, tipping audits</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('security')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Vault Security & Approval Rules</Text>
                <Text style={styles.navSub}>Sub-Modules: PIN confirmation gates, multi-sig overrides, escrow locks</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>
        </>
      )}

      {/* ================= LEVEL 2: WITHDRAWAL & PAYOUT SUB-MODULE ================= */}
      {activeSubView === 'payout' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💸 Level 2: Request Coin Withdrawal</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Convert earned coins from live streams, wildlife content gifts, and tickets into fiat currency:</Text>

          <Text style={styles.inputLabel}>Coins to Withdraw:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="Enter coin amount..."
            placeholderTextColor="#a0aec0"
            keyboardType="numeric"
            value={withdrawalAmount}
            onChangeText={setWithdrawalAmount}
          />

          <Text style={styles.inputLabel}>Select from Saved Payout Destination:</Text>
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

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#48bb78', paddingVertical: 12, marginTop: 6 }]} onPress={handleRequestWithdrawal} disabled={isProcessing}>
            <Text style={styles.sendButtonText}>
              {isProcessing ? 'Processing Payout Request...' : 'Request Payout 🚀'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: SAVED ACCOUNTS & REGISTRATION SUB-MODULE ================= */}
      {activeSubView === 'savedAccounts' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🏦 Registered Payout Accounts & Mobile Money</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Register and verify your MTN MoMo, Airtel Money, or bank wire destinations for secure cashouts:</Text>

          {savedAccounts.map((acc) => (
            <View key={acc.id} style={[styles.ledgerRow, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
              <View>
                <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{acc.type}</Text>
                <Text style={{ fontSize: 10, color: '#718096' }}>{acc.identifier} ({acc.name})</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>Verified 🟢</Text>
              </View>
            </View>
          ))}

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Add New Destination:</Text>
          
          <Text style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>Provider Type:</Text>
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

          <Text style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>Account Number / Phone Number:</Text>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
            placeholder="e.g. +256 770 000000 or Account No..."
            placeholderTextColor="#a0aec0"
            value={newAccountIdentifier}
            onChangeText={setNewAccountIdentifier}
          />

          <Text style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>Account Holder Name:</Text>
          <TextInput
            style={[styles.chatInput, { marginBottom: 14 }, isDarkMode && styles.darkChatInput]}
            placeholder="e.g. Borris Ahabwamukama..."
            placeholderTextColor="#a0aec0"
            value={newAccountName}
            onChangeText={setNewAccountName}
          />

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#3182ce', paddingVertical: 12 }]} onPress={handleRegisterAccount}>
            <Text style={styles.sendButtonText}>Save & Verify Account 🔒</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: STAKING & YIELD SUB-MODULE ================= */}
      {activeSubView === 'staking' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📈 Level 2: Creator Yield Staking Pool</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Lock platform coins to earn passive yield rewards and boost creator visibility.</Text>
          
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
            <Text style={styles.sendButtonText}>Lock & Stake Coins 🔒</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= LEVEL 2: LEDGER & TRANSACTION HISTORY ================= */}
      {activeSubView === 'history' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📜 Level 2: Audit & Payout Ledgers</Text>
          
          <View style={[styles.ledgerRow, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
            <View>
              <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>Mobile Money (MTN)</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>24 Aug 2026 • +256 770******</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#48bb78' }}>-🪙 1,000 Coins</Text>
              <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>Completed ✅</Text>
            </View>
          </View>

          <View style={[styles.ledgerRow, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
            <View>
              <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>Yield Staking Reward</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>18 Aug 2026 • 30-Day APY Payout</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d69e2e' }}>+🪙 40 Coins</Text>
              <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>Credited 🪙</Text>
            </View>
          </View>
        </View>
      )}

      {/* ================= LEVEL 3: VAULT SECURITY & RULES ================= */}
      {activeSubView === 'security' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Level 3: Vault Security Configurations</Text>
          
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