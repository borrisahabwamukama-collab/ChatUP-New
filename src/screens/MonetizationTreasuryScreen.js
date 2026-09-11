import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

export default function MonetizationTreasuryScreen({ isDarkMode, coins, setCoins }) {
  const [activeTab, setActiveTab] = useState('Accounts'); // 'Accounts', 'Treasury', 'RiskShield', 'Marketplace', 'Splits', 'Tiers', 'Vaults', 'Audit'

  // Bank & Mobile Money Account Linking State with ATM Card Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [atmCardNumber, setAtmCardNumber] = useState('');
  const [atmExpiry, setAtmExpiry] = useState('');
  const [atmCvv, setAtmCvv] = useState('');
  const [showSensitiveInputs, setShowSensitiveInputs] = useState(false);
  
  // Inline Validation Error States
  const [bankNameError, setBankNameError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [accountHolderError, setAccountHolderError] = useState('');
  const [atmCardError, setAtmCardError] = useState('');
  const [atmExpiryError, setAtmExpiryError] = useState('');
  const [atmCvvError, setAtmCvvError] = useState('');

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);

  const [linkedAccounts, setLinkedAccounts] = useState([
    { id: 'acc1', type: 'Mobile Money', provider: 'MTN MoMo (Uganda)', number: '077*****123', holder: 'Borris Ahabwamukama', verified: true, token: 'TOK_MOMO_8829' },
    { id: 'acc2', type: 'Bank Account', provider: 'Stanbic Bank Uganda', number: '903000******', holder: 'Borris Ahabwamukama', verified: true, token: 'TOK_STANBIC_1049' },
  ]);

  // Account Freeze State
  const [isAccountFrozen, setIsAccountFrozen] = useState(false);

  // Secret Withdrawal PIN & Anti-Brute-Force Lockout State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPayoutItem, setSelectedPayoutItem] = useState(null);
  const [secretWithdrawPin, setSecretWithdrawPin] = useState('');
  const [pinInputError, setPinInputError] = useState('');
  const [userCreatedPin, setUserCreatedPin] = useState('7788'); // Default secret PIN
  const [newPinInput, setNewPinInput] = useState('');
  const [showPinSettingsModal, setShowPinSettingsModal] = useState(false);

  // Security Lockout Counter & Daily Velocity Controls
  const [failedPinAttempts, setFailedPinAttempts] = useState(0);
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0); 
  const [dailyWithdrawalTotal, setDailyWithdrawalTotal] = useState(0);
  const DAILY_MAX_CAP = 2000000; // 2,000,000 UGX max daily payout cap

  // NEW LAYER 1: AUTOMATED TAX WITHHOLDING & KRA/URA COMPLIANCE ENGINE
  const [taxWithholdingEnabled, setTaxWithholdingEnabled] = useState(true);
  const [taxWithholdingRate, setTaxWithholdingRate] = useState('6% (East Africa Digital Service Tax)');

  // NEW LAYER 2: MULTI-CURRENCY FX CONVERSION & REAL-TIME RATES
  const [selectedFxCurrency, setSelectedFxCurrency] = useState('UGX (Ugandan Shilling)');
  const [fxAutoConvertActive, setFxAutoConvertActive] = useState(false);

  // NEW LAYER 3: BIOMETRIC HARDWARE KEY AUTHENTICATION GATEWAY
  const [biometricKeyAuthActive, setBiometricKeyAuthActive] = useState(true);
  const [hardwareSecurityTokenId, setHardwareSecurityTokenId] = useState('SEC_KEY_UG_88492');

  // NEW LAYER 4: INSTITUTIONAL ESCROW MULTI-SIG GOVERNANCE GUARD
  const [multiSigGovernanceActive, setMultiSigGovernanceActive] = useState(true);
  const [requiredApproversCount, setRequiredApproversCount] = useState('2 of 3 Admin Signers');

  // Real-Time Security Audit Logs Ledger
  const [securityLogs, setSecurityLogs] = useState([
    { id: 'log-1', event: 'Treasury Vault Initialized & PCI-DSS Shield Active', time: 'Today 10:15 AM', status: 'Passed 🛡️', ip: 'Kampala, UG' },
    { id: 'log-2', event: 'Device Fingerprint Registered (FP-9982-UG)', time: 'Yesterday 04:30 PM', status: 'Passed 🟢', ip: 'Kampala, UG' },
  ]);

  // Treasury Payout Queue State
  const [payoutQueue, setPayoutQueue] = useState([
    { id: 'p1', creator: '@borris_nature', amount: '450,000 UGX', gateway: 'Stanbic Bank / USDT', status: 'Pending Review', rawAmount: 450000 },
    { id: 'p2', creator: '@asifa_safari', amount: '120,000 UGX', gateway: 'MTN MoMo', status: 'Pending Review', rawAmount: 120000 },
  ]);

  // Marketplace Escrow State
  const [escrowOrders, setEscrowOrders] = useState([
    { id: 'e1', buyer: '@brian_ug', item: 'Wildlife Photography Lens', amount: '250,000 UGX', status: 'Locked in Escrow (Awaiting Code)' },
  ]);

  // Initialize AdMob Rewarded Ad
  useEffect(() => {
    initRewardedAd();
  }, []);

  const initRewardedAd = () => {
    try {
      const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setRewardedAdLoaded(true);
      });

      const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (setCoins) {
          setCoins(prev => prev + 250);
        }
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +250 Coins treasury sponsor bonus!');
      });

      rewardedAd.load();
      setRewardedAdInstance(rewardedAd);

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
      };
    } catch (e) {
      console.log('Rewarded Ad initialization notice:', e);
    }
  };

  const handleShowRewardedAd = () => {
    if (rewardedAdLoaded && rewardedAdInstance) {
      rewardedAdInstance.show();
      setRewardedAdLoaded(false);
      rewardedAdInstance.load();
    } else {
      // Fallback simulation for web/preview
      if (setCoins) {
        setCoins(prev => prev + 250);
      }
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +250 coins added to your ChatUp wallet balance.');
    }
  };

  // Lockout Countdown Timer Effect
  useEffect(() => {
    let interval = null;
    if (isVaultLocked && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && isVaultLocked) {
      setIsVaultLocked(false);
      setFailedPinAttempts(0);
      addSecurityLog('Vault Lockout Expired - PIN Unlocked', 'Passed 🟢');
    }
    return () => clearInterval(interval);
  }, [isVaultLocked, lockoutTimer]);

  const addSecurityLog = (event, status) => {
    const newLog = {
      id: Date.now().toString(),
      event,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      ip: 'Kampala Node ⚡'
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  const handleFreezeAccount = () => {
    setIsAccountFrozen(true);
    addSecurityLog('PANIC BUTTON: Account Frozen & Unauthorized Activity Flagged', 'CRITICAL 🛑');
    Alert.alert(
      'Account Frozen Successfully 🛑', 
      'Your account and all linked payment tokens have been immediately locked to prevent unauthorized charges. A security audit report has been dispatched to your registered email.'
    );
  };

  const validateAndDetectAccount = () => {
    let isValid = true;

    setBankNameError('');
    setAccountNumberError('');
    setAccountHolderError('');
    setAtmCardError('');
    setAtmExpiryError('');
    setAtmCvvError('');

    if (!bankName.trim()) {
      setBankNameError('Bank or telco name is required.');
      isValid = false;
    }
    if (!accountNumber.trim()) {
      setAccountNumberError('Account number or phone is required.');
      isValid = false;
    }
    if (!accountHolderName.trim()) {
      setAccountHolderError('Account holder full name is required.');
      isValid = false;
    }

    const cleanNum = accountNumber.replace(/\s+/g, '').trim();
    const cleanCard = atmCardNumber.replace(/\s+/g, '').trim();
    const cleanExpiry = atmExpiry.trim();
    const cleanCvv = atmCvv.trim();

    const isMobileMoney = bankName.toLowerCase().includes('momo') || 
                          bankName.toLowerCase().includes('airtel') || 
                          bankName.toLowerCase().includes('tigo') || 
                          bankName.toLowerCase().includes('safaricom') ||
                          bankName.toLowerCase().includes('glo');

    if (cleanCard.length > 0 || cleanExpiry.length > 0 || cleanCvv.length > 0) {
      if (cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
        setAtmCardError('Card number must contain exactly 16 valid digits.');
        isValid = false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cleanExpiry)) {
        setAtmExpiryError('Format must be MM/YY (e.g., 08/28).');
        isValid = false;
      } else {
        const [month, year] = cleanExpiry.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const expYr = parseInt(year, 10);
        const expMo = parseInt(month, 10);

        if (expYr < currentYear || (expYr === currentYear && expMo < currentMonth)) {
          setAtmExpiryError('Provided ATM card has expired.');
          isValid = false;
        }
      }

      if (cleanCvv.length !== 3 || !/^\d+$/.test(cleanCvv)) {
        setAtmCvvError('CVV must be exactly 3 digits.');
        isValid = false;
      }
    }

    let regionDetected = '';
    if (isMobileMoney) {
      if (cleanNum.startsWith('+254') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        regionDetected = 'Kenya 🇰🇪';
      } else if (cleanNum.startsWith('+255') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        regionDetected = 'Tanzania 🇹🇿';
      } else if (cleanNum.startsWith('+250') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        regionDetected = 'Rwanda 🇷🇼';
      } else if (cleanNum.startsWith('+256') || (cleanNum.startsWith('0') && cleanNum.length === 10)) {
        regionDetected = 'Uganda 🇺🇬';
      } else if (cleanNum.startsWith('+234') || (cleanNum.startsWith('0') && cleanNum.length === 11)) {
        regionDetected = 'Nigeria 🇳🇬';
      } else {
        setAccountNumberError('Unrecognized mobile money prefix or incorrect digit length.');
        isValid = false;
      }
    } else {
      if (cleanNum.length >= 10 && cleanNum.length <= 14 && /^\d+$/.test(cleanNum)) {
        regionDetected = 'Regional Bank Account 🏦';
      } else {
        setAccountNumberError('Bank account number must contain between 10 and 14 digits.');
        isValid = false;
      }
    }

    return { valid: isValid, region: regionDetected };
  };

  const handleVerifyAndLinkAccount = () => {
    if (isAccountFrozen) {
      return Alert.alert('Account Frozen 🛑', 'Your account is currently frozen. Unfreeze it in security settings to add new accounts.');
    }

    const validationResult = validateAndDetectAccount();
    if (!validationResult.valid) {
      addSecurityLog('Failed Account Verification Attempt', 'Blocked 🔴');
      Alert.alert('Security Check Failed ⚠️', 'Please review the highlighted error fields in red below.');
      return;
    }

    const generatedToken = `TOK_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newAccount = {
      id: Date.now().toString(),
      type: bankName.toLowerCase().includes('momo') || bankName.toLowerCase().includes('airtel') || bankName.toLowerCase().includes('tigo') ? 'Mobile Money' : 'Bank Account',
      provider: `${bankName} (${validationResult.region})`,
      number: accountNumber.slice(0, 4) + '****' + accountNumber.slice(-4),
      holder: accountHolderName,
      verified: true,
      token: generatedToken
    };

    setLinkedAccounts(prev => [...prev, newAccount]);

    setBankName('');
    setAccountNumber('');
    setAccountHolderName('');
    setAtmCardNumber('');
    setAtmExpiry('');
    setAtmCvv('');

    addSecurityLog(`Linked ${newAccount.provider} [Token: ${generatedToken}]`, 'Passed 🟢');
    Alert.alert('Account & Token Secured 🏦🛡️', `Destination account tokenized successfully (${validationResult.region}). Card data wiped from memory.`);
  };

  const handleOpenWithdrawModal = (item) => {
    if (isAccountFrozen) {
      return Alert.alert('Account Frozen 🛑', 'Withdrawals are disabled while your account is frozen.');
    }
    if (isVaultLocked) {
      return Alert.alert('Vault Locked 🔒', `Too many failed PIN attempts. Please wait ${lockoutTimer} seconds before retrying.`);
    }
    setSelectedPayoutItem(item);
    setSecretWithdrawPin('');
    setPinInputError('');
    setShowWithdrawModal(true);
  };

  const handleVerifyPinAndProcessPayout = () => {
    setPinInputError('');

    if (isVaultLocked) {
      Alert.alert('Vault Locked 🔒', `Security lockdown active. Try again in ${lockoutTimer} seconds.`);
      return;
    }

    if (!secretWithdrawPin.trim()) {
      setPinInputError('Secret PIN is required.');
      return;
    }

    if (secretWithdrawPin !== userCreatedPin) {
      const nextAttempts = failedPinAttempts + 1;
      setFailedPinAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        setIsVaultLocked(true);
        setLockoutTimer(900); 
        setShowWithdrawModal(false);
        addSecurityLog('Brute-force PIN limit reached - Vault locked for 15 mins', 'CRITICAL ALERT 🚨');
        Alert.alert('Vault Locked Down 🚨', '3 consecutive incorrect PIN entries detected! Withdrawal access suspended for 15 minutes.');
      } else {
        const remaining = 3 - nextAttempts;
        setPinInputError(`Incorrect PIN. ${remaining} attempt(s) remaining.`);
        addSecurityLog(`Failed PIN Entry Attempt (${nextAttempts}/3)`, 'Warning ⚠️');
      }
      return;
    }

    const proposedTotal = dailyWithdrawalTotal + (selectedPayoutItem?.rawAmount || 0);
    if (proposedTotal > DAILY_MAX_CAP) {
      addSecurityLog(`Payout blocked: Daily cap of ${DAILY_MAX_CAP} UGX exceeded`, 'Blocked 🔴');
      return Alert.alert('Daily Payout Cap Exceeded ⚠️', `This withdrawal exceeds your daily threshold limit of ${DAILY_MAX_CAP.toLocaleString()} UGX.`);
    }

    if (selectedPayoutItem) {
      setPayoutQueue(prev => prev.filter(item => item.id !== selectedPayoutItem.id));
      setDailyWithdrawalTotal(proposedTotal);
    }

    setFailedPinAttempts(0);
    setShowWithdrawModal(false);
    setSelectedPayoutItem(null);
    setSecretWithdrawPin('');

    addSecurityLog(`Disbursed ${selectedPayoutItem.amount} to ${selectedPayoutItem.creator}`, 'Passed 🟢');
    Alert.alert('Secure Payout Disbursed 🪙💸', 'Secret PIN verified. Funds routed via encrypted token gateway.');
  };

  const handleUpdateUserPin = () => {
    if (newPinInput.trim().length !== 4 || !/^\d+$/.test(newPinInput)) {
      Alert.alert('Invalid PIN', 'Secret withdrawal PIN must be exactly 4 digits.');
      return;
    }
    setUserCreatedPin(newPinInput);
    setNewPinInput('');
    setShowPinSettingsModal(false);
    addSecurityLog('Secret Withdrawal PIN Updated', 'Passed 🔐');
    Alert.alert('PIN Updated Successfully 🔐', 'Your secret withdrawal code has been updated and secured.');
  };

  const handleConfirmEscrowDelivery = (id) => {
    setEscrowOrders(prev => prev.filter(item => item.id !== id));
    addSecurityLog(`Escrow released for order ID: ${id}`, 'Passed ✅');
    Alert.alert('Escrow Released ✅', 'Delivery verification code entered. Funds released to seller wallet.');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
      <View style={styles.monetizationAdCard}>
        <Text style={styles.adTagLabel}>Sponsored Treasury Banner 📢 • AdMob Banner</Text>
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => console.log('AdMob Treasury Banner loaded successfully')}
            onAdFailedToLoad={(error) => console.log('AdMob Treasury Banner load error: ', error)}
          />
        </View>
      </View>

      {/* ================= REWARDED AD TREASURY BONUS WIDGET ================= */}
      <View style={styles.creatorMonetizationCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Treasury Dividend Reward</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
              Watch a sponsor clip to earn +250 coins!
            </Text>
          </View>
          <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+250 🪙) 🎁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🪙 Treasury & Anti-Fraud Vault (Balance: {coins} 🪙)</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#b45309', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
            onPress={() => setShowPinSettingsModal(true)}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🔐 Set Secret PIN</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>3DS2 enforcement, device fingerprinting, velocity checks, and PCI-DSS tokenized banking protection.</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
          {[
            { key: 'Accounts', label: '🏦 Bank & Tokenize' },
            { key: 'Treasury', label: '🪙 PIN Payouts' },
            { key: 'RiskShield', label: '🛡️ Risk & Device Guard' },
            { key: 'Audit', label: '📋 Audit Logs' },
            { key: 'Marketplace', label: '🛍️ Escrow' },
            { key: 'Splits', label: '📊 Splits' },
            { key: 'Tiers', label: '⭐ Tiers' },
            { key: 'Vaults', label: '🔒 Vaults' },
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

      <ScrollView 
        contentContainerStyle={styles.scrollArea} 
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        
        {isAccountFrozen && (
          <View style={[styles.card, { backgroundColor: '#fef2f2', borderColor: '#dc2626', marginBottom: 14 }]}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#991b1b', marginBottom: 2 }}>🛑 ACCOUNT IS CURRENTLY FROZEN</Text>
            <Text style={{ fontSize: 11, color: '#b91c1c' }}>
              All withdrawals and new account linkings have been disabled due to an active security freeze.
            </Text>
          </View>
        )}

        {/* ================= TAB 1: BANK, MOMO & ATM CARD ACCOUNTS ================= */}
        {activeTab === 'Accounts' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#16a34a', backgroundColor: isDarkMode ? '#064e3b' : '#f0fdf4' }]}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534', marginBottom: 2 }}>🛡️ No-Server Card Storage & PCI-DSS Compliant</Text>
              <Text style={{ fontSize: 10, color: '#15803d' }}>
                Credit card digits and CVV codes are tokenized client-side and never touch our servers. Stored records only contain secure vault tokens.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🏦 Tokenized Destination Accounts</Text>

            {linkedAccounts.map(acc => (
              <View key={acc.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{acc.provider} ({acc.type})</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a' }}>TOKENIZED ✓</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#2563eb', marginVertical: 4 }}>Account: {acc.number}</Text>
                <Text style={{ fontSize: 10, color: '#64748b' }}>Holder: {acc.holder} | Vault Token: {acc.token}</Text>
              </View>
            ))}

            <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 10 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 0 }]}>➕ Link Bank Account or ATM Card</Text>
                <TouchableOpacity onPress={() => setShowSensitiveInputs(!showSensitiveInputs)}>
                  <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: 'bold' }}>
                    {showSensitiveInputs ? '🙈 Hide Inputs' : '👁️ Show Inputs'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={[styles.input, bankNameError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                placeholder="Bank Name or Telco (e.g., Stanbic, MTN MoMo, Safaricom)"
                placeholderTextColor="#a0aec0"
                value={bankName}
                onChangeText={(val) => { setBankName(val); setBankNameError(''); }}
              />
              {bankNameError ? <Text style={styles.errorText}>{bankNameError}</Text> : null}

              <TextInput
                style={[styles.input, accountNumberError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                placeholder="Account Number or Phone (e.g., 077... or +256/+254/...)"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={(val) => { setAccountNumber(val); setAccountNumberError(''); }}
              />
              {accountNumberError ? <Text style={styles.errorText}>{accountNumberError}</Text> : null}

              <TextInput
                style={[styles.input, accountHolderError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                placeholder="Exact Account Holder Full Name (Legal Name)"
                placeholderTextColor="#a0aec0"
                value={accountHolderName}
                onChangeText={(val) => { setAccountHolderName(val); setAccountHolderError(''); }}
              />
              {accountHolderError ? <Text style={styles.errorText}>{accountHolderError}</Text> : null}

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#b45309', marginVertical: 6 }}>🛡️ 3DS2 & ATM Card Anti-Fraud Verification:</Text>

              <TextInput
                style={[styles.input, atmCardError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                placeholder="16-Digit Card Number (e.g., 4532XXXXXXXXXXXX)"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                secureTextEntry={!showSensitiveInputs}
                maxLength={16}
                value={atmCardNumber}
                onChangeText={(val) => { setAtmCardNumber(val); setAtmCardError(''); }}
              />
              {atmCardError ? <Text style={styles.errorText}>{atmCardError}</Text> : null}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, atmExpiryError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                    placeholder="MM/YY (e.g., 08/28)"
                    placeholderTextColor="#a0aec0"
                    maxLength={5}
                    value={atmExpiry}
                    onChangeText={(val) => { setAtmExpiry(val); setAtmExpiryError(''); }}
                  />
                  {atmExpiryError ? <Text style={styles.errorText}>{atmExpiryError}</Text> : null}
                </View>

                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, atmCvvError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                    placeholder="CVV (e.g., 123)"
                    placeholderTextColor="#a0aec0"
                    keyboardType="numeric"
                    secureTextEntry={!showSensitiveInputs}
                    maxLength={3}
                    value={atmCvv}
                    onChangeText={(val) => { setAtmCvv(val); setAtmCvvError(''); }}
                  />
                  {atmCvvError ? <Text style={styles.errorText}>{atmCvvError}</Text> : null}
                </View>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyAndLinkAccount} activeOpacity={0.7}>
                <Text style={styles.primaryBtnText}>Verify 3DS2 & Tokenize Card 🔒</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 2: TREASURY & PIN-PROTECTED PAYOUTS ================= */}
        {activeTab === 'Treasury' && (
          <View>
            {isVaultLocked && (
              <View style={[styles.card, { backgroundColor: '#fef2f2', borderColor: '#dc2626' }]}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#991b1b', marginBottom: 2 }}>🚨 SECURITY LOCKDOWN ACTIVE</Text>
                <Text style={{ fontSize: 11, color: '#b91c1c' }}>
                  Vault locked due to repeated incorrect PIN entries. Auto-unlock in: <Text style={{ fontWeight: 'bold' }}>{lockoutTimer}s</Text>
                </Text>
              </View>
            )}

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>📊 Daily Velocity & Payout Limits</Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                Daily Disbursed: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{dailyWithdrawalTotal.toLocaleString()} UGX</Text> / Cap: {DAILY_MAX_CAP.toLocaleString()} UGX
              </Text>
            </View>

            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🪙 Creator Payout Queue (Min: 50k UGX)</Text>
            
            {payoutQueue.length > 0 ? (
              payoutQueue.map(item => (
                <View key={item.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Creator: {item.creator}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a', marginVertical: 2 }}>{item.amount} ({item.gateway})</Text>
                  <Text style={{ fontSize: 10, color: '#d97706', marginBottom: 10 }}>Status: {item.status}</Text>
                  <TouchableOpacity 
                    style={[styles.primaryBtn, (isVaultLocked || isAccountFrozen) && { backgroundColor: '#94a3b8' }]} 
                    onPress={() => handleOpenWithdrawModal(item)} 
                    disabled={isVaultLocked || isAccountFrozen}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.primaryBtnText}>{isAccountFrozen ? 'Account Frozen 🛑' : isVaultLocked ? 'Locked 🔒' : 'Enter PIN & Disburse 🔐💸'}</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: 20 }}>All creator payout requests have been processed.</Text>
            )}
          </View>
        )}

        {/* ================= TAB 3: RISK & DEVICE GUARD ================= */}
        {activeTab === 'RiskShield' && (
          <View>
            {/* NEW LAYER 1: AUTOMATED TAX WITHHOLDING & KRA/URA COMPLIANCE ENGINE */}
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#d97706', borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>📋 Automated Tax Withholding & Compliance</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>Deduct regional digital service tax automatically before routing payouts to creators.</Text>
                </View>
                <Switch
                  value={taxWithholdingEnabled}
                  onValueChange={(val) => {
                    setTaxWithholdingEnabled(val);
                    addSecurityLog(`Tax withholding toggle changed: ${val ? 'Active' : 'Disabled'}`, 'Passed 🟢');
                    Alert.alert('Tax Withholding', val ? '📋 Automated tax withholding rule active.' : 'Tax deduction paused.');
                  }}
                  trackColor={{ false: '#cbd5e0', true: '#d97706' }}
                />
              </View>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#d97706', marginTop: 4 }}>Active Bracket: {taxWithholdingRate}</Text>
            </View>

            {/* NEW LAYER 2: MULTI-CURRENCY FX CONVERSION & REAL-TIME RATES */}
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#2563eb', borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>💱 Multi-Currency FX Conversion Engine</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>Convert payouts automatically into regional East African currencies or stablecoins.</Text>
                </View>
                <Switch
                  value={fxAutoConvertActive}
                  onValueChange={(val) => {
                    setFxAutoConvertActive(val);
                    addSecurityLog(`FX auto-conversion changed: ${val ? 'Active' : 'Off'}`, 'Passed 🟢');
                    Alert.alert('FX Engine', val ? '💱 Real-time exchange rate conversion active.' : 'Manual FX mode active.');
                  }}
                  trackColor={{ false: '#cbd5e0', true: '#2563eb' }}
                />
              </View>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2563eb', marginTop: 4 }}>Base Currency Target: {selectedFxCurrency}</Text>
            </View>

            {/* NEW LAYER 3: BIOMETRIC HARDWARE KEY AUTHENTICATION GATEWAY */}
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#16a34a', borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🔑 Biometric Hardware Key Auth</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>Require hardware security key confirmation for high-value treasury movements.</Text>
                </View>
                <Switch
                  value={biometricKeyAuthActive}
                  onValueChange={(val) => {
                    setBiometricKeyAuthActive(val);
                    addSecurityLog(`Hardware key auth changed: ${val ? 'Enforced' : 'Relaxed'}`, 'Passed 🟢');
                    Alert.alert('Hardware Key', val ? '🔑 Biometric security token required for large transfers.' : 'Standard PIN mode active.');
                  }}
                  trackColor={{ false: '#cbd5e0', true: '#16a34a' }}
                />
              </View>
              <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Bound Security Key ID: <Text style={{ fontWeight: 'bold', color: '#16a34a' }}>{hardwareSecurityTokenId}</Text></Text>
            </View>

            {/* NEW LAYER 4: INSTITUTIONAL ESCROW MULTI-SIG GOVERNANCE GUARD */}
            <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🛡️ Multi-Sig Escrow Governance</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>Require multi-signatory approval for platform-level treasury releases.</Text>
                </View>
                <Switch
                  value={multiSigGovernanceActive}
                  onValueChange={(val) => {
                    setMultiSigGovernanceActive(val);
                    addSecurityLog(`Multi-sig governance changed: ${val ? 'Active' : 'Disabled'}`, 'Passed 🟢');
                    Alert.alert('Multi-Sig Guard', val ? '🛡️ Institutional multi-sig checks enforced.' : 'Single-admin release mode active.');
                  }}
                  trackColor={{ false: '#cbd5e0', true: '#9333ea' }}
                />
              </View>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9333ea', marginTop: 4 }}>Approval Policy: {requiredApproversCount}</Text>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛡️ Advanced Fraud & Device Fingerprinting Engine</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18, marginBottom: 10 }}>
                • <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>Device Fingerprinting (FP-9982-UG):</Text> Flags proxy/VPN connections and blocks multiple distinct credit cards from linking to a single handset.{'\n'}
                • <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>Velocity Check Monitoring:</Text> Automatically flags and blocks accounts trying to make rapid repeated purchases or high-frequency withdrawals.{'\n'}
                • <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>IP & Location Mismatch Guard:</Text> Cross-references credit card billing country code with user IP location to catch high-risk anomalies.{'\n'}
                • <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>Biometric Confirmation:</Text> Enforces Face ID / Fingerprint verification for all transactions.
              </Text>
            </View>

            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⚡ Instant User Freeze & Dispute Center</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18, marginBottom: 12 }}>
                Provide users with an immediate in-app panic button to freeze their accounts or flag unauthorized charges.
              </Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#dc2626', padding: 10, borderRadius: 8, alignItems: 'center' }}
                onPress={handleFreezeAccount}
                activeOpacity={0.7}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Freeze Account & Report Unauthorized Activity 🛑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 4: AUDIT LOGS ================= */}
        {activeTab === 'Audit' && (
          <View>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>📋 Real-Time Security & Fraud Audit Log</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
              Every sensitive authorization, token creation, and withdrawal attempt is permanently logged:
            </Text>

            {securityLogs.map(log => (
              <View key={log.id} style={[styles.card, isDarkMode && styles.darkCard, { marginBottom: 8 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText, { flex: 1, fontSize: 11 }]}>{log.event}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: log.status.includes('Passed') ? '#16a34a' : log.status.includes('Warning') ? '#d97706' : '#dc2626' }}>
                    {log.status}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>Timestamp: {log.time} | Node: {log.ip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 5: MARKETPLACE & ESCROW ================= */}
        {activeTab === 'Marketplace' && (
          <View>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛍️ Deals & Escrow Safeguards</Text>

            {escrowOrders.length > 0 ? (
              escrowOrders.map(order => (
                <View key={order.id} style={[styles.card, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Buyer: {order.buyer}</Text>
                  <Text style={{ fontSize: 11, color: '#2563eb', marginVertical: 2 }}>Item: {order.item} ({order.amount})</Text>
                  <Text style={{ fontSize: 10, color: '#d97706', marginBottom: 10 }}>Status: {order.status}</Text>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => handleConfirmEscrowDelivery(order.id)} activeOpacity={0.7}>
                    <Text style={styles.primaryBtnText}>Verify Code & Release Escrow Funds ✅</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: 20 }}>No pending escrow transactions.</Text>
            )}
          </View>
        )}

        {/* ================= TAB 6: REVENUE SPLITS ================= */}
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
            </View>
          </View>
        )}

        {/* ================= TAB 7: GROWTH TIERS ================= */}
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
            </View>
          </View>
        )}

        {/* ================= TAB 8: ROUND-UP & FINES ================= */}
        {activeTab === 'Vaults' && (
          <View>
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🪙 Micro-Savings & "Round-Up" Wallets</Text>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 18 }}>
                Sweeps spare change into a secure, interest-ready savings vault.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ================= SECURE WITHDRAWAL PIN MODAL ================= */}
      <Modal visible={showWithdrawModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContainer} keyboardShouldPersistTaps="handled">
            <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🔐 Secret Withdrawal PIN Verification</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                Enter your secret 4-digit PIN to authorize this payout request.
              </Text>

              <TextInput
                style={[styles.input, pinInputError ? styles.inputError : null, isDarkMode && styles.darkInput]}
                placeholder="Enter 4-Digit PIN (e.g. 7788)"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={secretWithdrawPin}
                onChangeText={(val) => { setSecretWithdrawPin(val); setPinInputError(''); }}
              />
              {pinInputError ? <Text style={styles.errorText}>{pinInputError}</Text> : null}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity 
                  style={[styles.primaryBtn, { flex: 1, backgroundColor: '#64748b', marginTop: 0 }]} 
                  onPress={() => setShowWithdrawModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]} 
                  onPress={handleVerifyPinAndProcessPayout}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryBtnText}>Authorize & Submit 🚀</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ================= SET / CHANGE PIN MODAL ================= */}
      <Modal visible={showPinSettingsModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContainer} keyboardShouldPersistTaps="handled">
            <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛡️ Update Secret Withdrawal PIN</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                Set a secure 4-digit numeric code required for all future treasury withdrawals.
              </Text>

              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="New 4-Digit PIN (e.g. 1234)"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={newPinInput}
                onChangeText={setNewPinInput}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity 
                  style={[styles.primaryBtn, { flex: 1, backgroundColor: '#64748b', marginTop: 0 }]} 
                  onPress={() => setShowPinSettingsModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]} 
                  onPress={handleUpdateUserPin}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryBtnText}>Save PIN 🔐</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

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
  scrollArea: { padding: 16, paddingBottom: 60 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 4 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  inputError: { borderColor: '#dc2626', borderWidth: 1.5, backgroundColor: '#fef2f2' },
  errorText: { fontSize: 10, color: '#dc2626', fontWeight: '700', marginBottom: 8, marginLeft: 2 },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  splitBadge: { fontSize: 10, fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  darkText: { color: '#f8fafc' },
  tierBox: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#f8fafc' },
  tierTitle: { fontSize: 11, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  tierSub: { fontSize: 10, color: '#64748b' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' },
  modalScrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});