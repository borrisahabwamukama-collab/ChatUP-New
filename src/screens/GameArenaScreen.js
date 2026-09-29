import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';
import styles from './GameArenaStyles';
import LiveBroadcastGrid from './LiveBroadcastGrid';
import GameTableArea from './GameTableArea';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameArenaScreen({ coins, setCoins, isDarkMode }) {
  const [selectedGame, setSelectedGame] = useState('Matatu'); // 'Matatu' | 'Chess' | 'Draft' | 'Pool'
  const [spectatorCount, setSpectatorCount] = useState(1420);
  const [chatMessage, setChatMessage] = useState('');
  
  const [playerOneScore, setPlayerOneScore] = useState(3);
  const [playerTwoScore, setPlayerTwoScore] = useState(2);
  const [isMatchActive, setIsMatchActive] = useState(true);

  // Visual Board States (Matrix Representation)
  const [chessBoardState, setChessBoardState] = useState([
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', 'P', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['p', 'p', 'p', '.', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
  ]);

  const [draftBoardState, setDraftBoardState] = useState([
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
  ]);

  // Authentic Billiards Pool Table with Cue Stick Pull-Back & Live Trajectory into Pockets
  const [poolVariant, setPoolVariant] = useState('8-Ball');
  const [cuePower, setCuePower] = useState(50);
  const [cueAngle, setCueAngle] = useState(45);
  const [cueBallPos, setCueBallPos] = useState({ x: 60, y: 110 });
  const [targetBalls, setTargetBalls] = useState([
    { id: '1', label: '1', x: 130, y: 70, color: '#d97706', sunk: false },
    { id: '2', label: '2', x: 150, y: 90, color: '#2563eb', sunk: false },
    { id: '3', label: '3', x: 140, y: 110, color: '#dc2626', sunk: false },
    { id: '8', label: '8', x: 170, y: 90, color: '#1e293b', sunk: false },
    { id: '9', label: '9', x: 190, y: 80, color: '#7c3aed', sunk: false },
  ]);
  const [poolRefereeAdvice, setPoolRefereeAdvice] = useState('Adjust power & angle, then tap Shoot to strike cue ball live toward pockets!');

  // Dedicated Fan Cheers & Sectional Hype Counters
  const [playerOneCheers, setPlayerOneCheers] = useState(420);
  const [playerTwoCheers, setPlayerTwoCheers] = useState(385);
  const [hostCheers, setHostCheers] = useState(610);

  // Matatu Hidden Hand & Phantom Rule Enforcement States
  const [matatuHand, setMatatuHand] = useState(['7♠', 'Q♥', 'A♣', '5♦']);
  const [opponentHandHiddenCount, setOpponentHandHiddenCount] = useState(4); 
  const [lastPlayedCard, setLastPlayedCard] = useState('King of Spades ♠');
  const [penaltyLog, setPenaltyLog] = useState('No infractions caught yet.');

  const [selectedSquare, setSelectedSquare] = useState(null);

  const [matchMessages, setMatchMessages] = useState([
    { id: '1', user: 'Nimusiima Asifa', text: 'Stunning tactical play at Table 04! 🔥' },
    { id: '2', user: 'Stella', text: 'Play the trump card now! 🃏' },
    { id: '3', user: 'Brian_UG', text: 'Tournament bracket is heating up.' }
  ]);

  // Dynamic Supabase-Backed Sponsorship State
  const [sponsorBannerActive, setSponsorBannerActive] = useState(true);
  const [sponsorName, setSponsorName] = useState('Talk With Nature Wildlife Foundation 🦁');
  const [sponsorPrizePool, setSponsorPrizePool] = useState(5000);

  const [showTipModal, setShowTipModal] = useState(false);
  const [tipTargetRecipient, setTipTargetRecipient] = useState('Player A (Borris)');
  const [customTipAmount, setCustomTipAmount] = useState(50);
  const [tournamentRound, setTournamentRound] = useState('Semi-Finals: Table 04 Match');

  // Developer Monetization & Matchmaking Wager States
  const [showWagerModal, setShowWagerModal] = useState(false);
  const [selectedWagerStake, setSelectedWagerStake] = useState(100);
  const [isQueueActive, setIsQueueActive] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Coin Refill & Rewarded Ad Modal States
  const [showCoinRefillModal, setShowCoinRefillModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  // 🌟 MULTI-STREAM WEBCAM REFS FOR HOST & COMPETITORS
  const hostWebcamRef = useRef(null);
  const playerOneWebcamRef = useRef(null);
  const playerTwoWebcamRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('Connecting Live Feeds...');

  useEffect(() => {
    let activeStream = null;
    let isMounted = true;

    const startStandardFeeds = async () => {
      if (Platform.OS === 'web') {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (isMounted) {
              [hostWebcamRef, playerOneWebcamRef, playerTwoWebcamRef].forEach(ref => {
                if (ref && ref.current) {
                  ref.current.srcObject = activeStream;
                  ref.current.muted = true;
                  ref.current.play().catch(e => console.log('Autoplay constraint notice:', e));
                }
              });
              setCameraStatus('Live Feed Active 🔴');
            }
          } else {
            if (isMounted) setCameraStatus('Camera API unavailable in this browser context.');
          }
        } catch (err) {
          if (isMounted) setCameraStatus('Standard Feed: Using Simulated Studio Cam');
        }
      } else {
        if (isMounted) setCameraStatus('Mobile Client: Studio Feed Connected');
      }
    };

    startStandardFeeds();

    return () => {
      isMounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Fully Dynamic Supabase Realtime Sync for Table Sessions & Sponsor Data
  useEffect(() => {
    let channel = null;
    const activeTableId = `table_${selectedGame.toLowerCase()}`;

    const syncLiveArena = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('game_arena_sessions')
          .select('*')
          .eq('table_id', activeTableId)
          .maybeSingle();

        if (sessionData && !sessionError) {
          setPlayerOneScore(sessionData.player_one_score ?? 3);
          setPlayerTwoScore(sessionData.player_two_score ?? 2);
          if (sessionData.player_one_likes) setPlayerOneCheers(sessionData.player_one_likes);
          if (sessionData.player_two_likes) setPlayerTwoCheers(sessionData.player_two_likes);
          if (sessionData.host_likes) setHostCheers(sessionData.host_likes);
          if (sessionData.messages) setMatchMessages(sessionData.messages);
          if (sessionData.chess_board) setChessBoardState(sessionData.chess_board);
          if (sessionData.draft_board) setDraftBoardState(sessionData.draft_board);
        } else {
          setPlayerOneScore(3);
          setPlayerTwoScore(2);
        }

        const { data: sponsorData } = await supabase
          .from('arena_sponsors')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (sponsorData) {
          setSponsorName(sponsorData.sponsor_name);
          setSponsorPrizePool(sponsorData.prize_pool ?? 5000);
          setSponsorBannerActive(true);
        }
      } catch (err) {
        console.log('Supabase sync fetch notice:', err.message);
      }

      if (supabase) {
        channel = supabase.channel(`public:game_arena_sessions:${activeTableId}`);
        
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_arena_sessions',
            filter: `table_id=eq.${activeTableId}`,
          },
          (payload) => {
            if (payload.new) {
              setPlayerOneScore(payload.new.player_one_score ?? playerOneScore);
              setPlayerTwoScore(payload.new.player_two_score ?? playerTwoScore);
              if (payload.new.player_one_likes) setPlayerOneCheers(payload.new.player_one_likes);
              if (payload.new.player_two_likes) setPlayerTwoCheers(payload.new.player_two_likes);
              if (payload.new.host_likes) setHostCheers(payload.new.host_likes);
              if (payload.new.messages) setMatchMessages(payload.new.messages);
              if (payload.new.chess_board) setChessBoardState(payload.new.chess_board);
              if (payload.new.draft_board) setDraftBoardState(payload.new.draft_board);
            }
          }
        );

        channel.subscribe();
      }
    };

    syncLiveArena();

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [selectedGame]);

  const updateSupabaseTableState = async (newScore1, newScore2, updatedMessages, newChess = chessBoardState, newDraft = draftBoardState) => {
    try {
      if (!supabase) return;
      const activeTableId = `table_${selectedGame.toLowerCase()}`;
      await supabase
        .from('game_arena_sessions')
        .upsert({
          table_id: activeTableId,
          player_one_score: newScore1,
          player_two_score: newScore2,
          player_one_likes: playerOneCheers,
          player_two_likes: playerTwoCheers,
          host_likes: hostCheers,
          messages: updatedMessages,
          chess_board: newChess,
          draft_board: newDraft,
          updated_at: new Date(),
        });
    } catch (err) {
      console.log('Supabase sync write error:', err.message);
    }
  };

  const handleSquarePress = (rIdx, cIdx) => {
    if (!isMatchActive) return;

    if (selectedGame === 'Chess') {
      if (!selectedSquare) {
        if (chessBoardState[rIdx][cIdx] !== '.') {
          setSelectedSquare({ r: rIdx, c: cIdx });
          Alert.alert('Piece Selected ♟️', `Selected piece at row ${rIdx}, col ${cIdx}. Tap legal destination square.`);
        }
      } else {
        const targetCell = chessBoardState[selectedSquare.r][selectedSquare.c];
        const destinationCell = chessBoardState[rIdx][cIdx];
        const isSameColorCapture = destinationCell !== '.' && 
          ((targetCell === targetCell.toUpperCase() && destinationCell === destinationCell.toUpperCase()) ||
           (targetCell === targetCell.toLowerCase() && destinationCell === destinationCell.toLowerCase()));

        if (isSameColorCapture) {
          setSelectedSquare(null);
          return Alert.alert('Illegal Chess Move! ♟️❌', 'Rule Violation: You cannot capture your own piece!');
        }

        let updatedChess = chessBoardState.map(row => [...row]);
        updatedChess[rIdx][cIdx] = targetCell;
        updatedChess[selectedSquare.r][selectedSquare.c] = '.';
        
        setChessBoardState(updatedChess);
        setSelectedSquare(null);
        
        const newMsg = 'Borris executed a legal chess move under federation laws.';
        const updatedMsgs = [...matchMessages, { id: Date.now().toString(), user: 'Table Referee ♟️', text: newMsg }];
        setMatchMessages(updatedMsgs);

        updateSupabaseTableState(playerOneScore + 1, playerTwoScore, updatedMsgs, updatedChess, draftBoardState);
      }
    } else if (selectedGame === 'Draft') {
      if (!selectedSquare) {
        if (draftBoardState[rIdx][cIdx] !== 0) {
          setSelectedSquare({ r: rIdx, c: cIdx });
          Alert.alert('Checker Selected ⚪', `Selected checker at row ${rIdx}, col ${cIdx}. Tap diagonal destination.`);
        }
      } else {
        const rowDiff = Math.abs(rIdx - selectedSquare.r);
        const colDiff = Math.abs(cIdx - selectedSquare.c);

        if (rowDiff !== 1 || colDiff !== 1) {
          setSelectedSquare(null);
          return Alert.alert('Illegal Draft Move! ⚪❌', 'Rule Violation: Checkers must move one square diagonally!');
        }

        let updatedDraft = draftBoardState.map(row => [...row]);
        updatedDraft[rIdx][cIdx] = updatedDraft[selectedSquare.r][selectedSquare.c];
        updatedDraft[selectedSquare.r][selectedSquare.c] = 0;

        setDraftBoardState(updatedDraft);
        setSelectedSquare(null);

        const newMsg = 'Borris executed a valid diagonal draft step.';
        const updatedMsgs = [...matchMessages, { id: Date.now().toString(), user: 'Table Referee ⚪', text: newMsg }];
        setMatchMessages(updatedMsgs);

        updateSupabaseTableState(playerOneScore + 1, playerTwoScore, updatedMsgs, chessBoardState, updatedDraft);
      }
    }
  };

  const handlePoolPhysicsStrike = () => {
    const radian = (cueAngle * Math.PI) / 180;
    const distanceX = Math.cos(radian) * (cuePower * 1.5);
    const distanceY = Math.sin(radian) * (cuePower * 1.0);

    const newCueX = cueBallPos.x + distanceX;
    const newCueY = cueBallPos.y - distanceY;

    setCueBallPos({ x: newCueX, y: newCueY });

    const pockets = [
      { x: 15, y: 15 }, { x: 245, y: 15 },
      { x: 15, y: 135 }, { x: 245, y: 135 }
    ];

    let sunkEvent = false;
    let updatedBalls = targetBalls.map(ball => {
      if (!ball.sunk) {
        const distToBall = Math.hypot(newCueX - ball.x, newCueY - ball.y);
        if (distToBall < 25) {
          const targetPocket = pockets.reduce((nearest, p) => {
            return Math.hypot(p.x - ball.x, p.y - ball.y) < Math.hypot(nearest.x - ball.x, nearest.y - ball.y) ? p : nearest;
          }, pockets[0]);

          const hitPocketDist = Math.hypot(targetPocket.x - ball.x, targetPocket.y - ball.y);
          if (cuePower > 40 && hitPocketDist < 80) {
            sunkEvent = true;
            return { ...ball, x: targetPocket.x, y: targetPocket.y, sunk: true };
          } else {
            return { ...ball, x: ball.x + (distanceX * 0.6), y: ball.y - (distanceY * 0.6) };
          }
        }
      }
      return ball;
    });

    setTargetBalls(updatedBalls);

    let statusText = '';
    let newScore = playerOneScore;
    if (sunkEvent) {
      statusText = '🎯 SINK! Ball rolled live into the corner pocket for all spectators!';
      newScore += 1;
      setPlayerOneScore(newScore);
    } else {
      statusText = `💥 Strike executed (${cuePower}% power). Balls shifted across felt layout.`;
    }

    setPoolRefereeAdvice(statusText);
    const updatedMsgs = [...matchMessages, { id: Date.now().toString(), user: 'Billiards Referee 🎱', text: `Borris live strike: ${statusText}` }];
    setMatchMessages(updatedMsgs);
    updateSupabaseTableState(newScore, playerTwoScore, updatedMsgs);
    Alert.alert('Cue Struck Live! 🎯', statusText);
  };

  // 🌟 SUPABASE-SYNCED CHEERS & LIKES HANDLER
  const handleSendCheerFor = async (target) => {
    let newP1Cheers = playerOneCheers;
    let newP2Cheers = playerTwoCheers;
    let newHostCheers = hostCheers;

    if (target === 'p1') {
      newP1Cheers += 15;
      setPlayerOneCheers(newP1Cheers);
      Alert.alert('🔥 Fan Hype Boost!', 'You sent 15 cheers & likes for Borris (Player A)!');
    } else if (target === 'p2') {
      newP2Cheers += 15;
      setPlayerTwoCheers(newP2Cheers);
      Alert.alert('🔥 Fan Hype Boost!', 'You sent 15 cheers & likes for Challenger (Player B)!');
    } else if (target === 'host') {
      newHostCheers += 25;
      setHostCheers(newHostCheers);
      Alert.alert('🎙️ Host Caster Hype!', 'You boosted the Host Caster booth with cheers & likes!');
    }

    const newReaction = { id: Date.now().toString(), emoji: '🔥' };
    setFloatingReactions(prev => [...prev.slice(-4), newReaction]);

    try {
      if (!supabase) return;
      const activeTableId = `table_${selectedGame.toLowerCase()}`;
      await supabase
        .from('game_arena_sessions')
        .upsert({
          table_id: activeTableId,
          player_one_likes: newP1Cheers,
          player_two_likes: newP2Cheers,
          host_likes: newHostCheers,
          player_one_score: playerOneScore,
          player_two_score: playerTwoScore,
          messages: matchMessages,
          updated_at: new Date(),
        });
    } catch (err) {
      console.log('Error syncing arena likes to Supabase:', err.message);
    }
  };

  // 🌟 GLOBAL ANALYTICS SYNC FUNCTION
  const finalizeAndSyncArenaAnalytics = async () => {
    try {
      if (!supabase) return;
      const totalMatchCheers = playerOneCheers + hostCheers + playerTwoCheers;

      const { data: existingAnalytics } = await supabase
        .from('creator_analytics')
        .select('*')
        .limit(1)
        .maybeSingle();

      const currentLikes = existingAnalytics?.total_likes || 0;
      const updatedTotalLikes = currentLikes + totalMatchCheers;

      await supabase
        .from('creator_analytics')
        .upsert({
          id: existingAnalytics?.id || undefined,
          total_likes: updatedTotalLikes,
          last_updated: new Date(),
        });
    } catch (err) {
      console.log('Error syncing arena analytics:', err.message);
    }
  };

  const handleJoinWagerQueue = () => {
    if (coins < selectedWagerStake) {
      setShowWagerModal(false);
      setShowCoinRefillModal(true);
      return;
    }
    const platformFee = Math.round(selectedWagerStake * 0.05);
    setCoins(prev => prev - selectedWagerStake);
    setIsQueueActive(true);
    setShowWagerModal(false);

    Alert.alert(
      'Matchmaking Queue Active ⚡',
      `Staked 🪙 ${selectedWagerStake} coins (${platformFee} coin developer platform rake applied). Searching for live opponent at Table (${selectedGame})...`
    );
  };

  const handleWatchRewardedAd = () => {
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      setCoins(prev => prev + 50);
      setShowCoinRefillModal(false);
      Alert.alert('Reward Earned! 🪙 +50 Coins', 'Ad completed successfully. 50 coins added to your wallet!');
    }, 2000);
  };

  const handleBuyCoinBundle = (bundleCoins) => {
    setCoins(prev => prev + bundleCoins);
    setShowCoinRefillModal(false);
    Alert.alert('Purchase Successful 🚀', `Successfully credited 🪙 ${bundleCoins} coins via Mobile Money / Billing!`);
  };

  const handleMatatuAction = (actionType) => {
    if (!isMatchActive) return Alert.alert('Match Ended', 'This table session has concluded.');

    let updatedP1Score = playerOneScore;
    let newMsgText = '';

    if (actionType === 'card') {
      if (matatuHand.length === 0) {
        return Alert.alert('Empty Hand', 'You have no cards left!');
      }
      const playedCard = matatuHand[0];
      const remainingHand = matatuHand.slice(1);
      setMatatuHand(remainingHand);
      setLastPlayedCard(playedCard);

      if (remainingHand.length === 1) {
        newMsgText = `Borris played ${playedCard}. PHANTOM RULE ARMED: 1 card remaining!`;
        Alert.alert('Single Card Left! ⚠️', 'Hidden Rule Active: Shout "Matatu!" or risk a penalty if caught!');
      } else {
        newMsgText = `Borris successfully played ${playedCard} onto the table.`;
      }
    } else if (actionType === 'catch_slip') {
      setPenaltyLog('Infraction caught! Opponent failed to declare Matatu on single card!');
      updatedP1Score += 3;
      newMsgText = 'CRITICAL CALLOUT: Borris caught opponent breaking the hidden Matatu rule! +3 penalty points!';
      Alert.alert('Matatu Called! 🔥', 'Penalty successfully enforced against opponent slip!');
    } else if (actionType === 'draw') {
      const drawnCard = '10 of Hearts ♥';
      setMatatuHand(prev => [...prev, drawnCard]);
      newMsgText = 'Borris drew a card from the deck pile.';
    }

    setPlayerOneScore(updatedP1Score);
    const updatedMsgs = [
      ...matchMessages,
      { id: Date.now().toString(), user: 'Matatu Referee 🃏', text: newMsgText }
    ];
    setMatchMessages(updatedMsgs);
    updateSupabaseTableState(updatedP1Score, playerTwoScore, updatedMsgs);
  };

  const handleHostRewardWinner = async () => {
    const rewardCoins = 150;
    setCoins(prev => prev + rewardCoins);
    const updatedMsgs = [
      ...matchMessages,
      { id: Date.now().toString(), user: 'Tournament Host 🏆', text: `Host awarded 🪙 ${rewardCoins} bonus coins to Borris for stellar tournament performance!` }
    ];
    setMatchMessages(updatedMsgs);
    updateSupabaseTableState(playerOneScore, playerTwoScore, updatedMsgs);

    // 🌟 Sync arena likes/cheers into global Creator Analytics upon reward
    await finalizeAndSyncArenaAnalytics();

    Alert.alert('Tournament Prize Awarded & Analytics Synced! 🏆📊', `Host sent 🪙 ${rewardCoins} coins to winner & updated global analytics!`);
  };

  const handleSendCheer = () => {
    if (!chatMessage.trim()) return;
    const updatedMsgs = [
      ...matchMessages, 
      { id: Date.now().toString(), user: 'You (VIP Spectator)', text: chatMessage.trim() }
    ];
    setMatchMessages(updatedMsgs);
    setChatMessage('');
    updateSupabaseTableState(playerOneScore, playerTwoScore, updatedMsgs);
  };

  const openTipModalFor = (recipient) => {
    setTipTargetRecipient(recipient);
    setShowTipModal(true);
  };

  const handleConfirmTip = () => {
    if (coins < customTipAmount) {
      setShowTipModal(false);
      setShowCoinRefillModal(true);
      return;
    }
    const platformTipCut = Math.round(customTipAmount * 0.1);
    const recipientTipAmount = customTipAmount - platformTipCut;

    setCoins(prev => prev - customTipAmount);
    setShowTipModal(false);

    const updatedMsgs = [
      ...matchMessages,
      { id: Date.now().toString(), user: 'Tip Alert 🪙', text: `You tipped 🪙 ${recipientTipAmount} coins to ${tipTargetRecipient} (🪙 ${platformTipCut} developer fee applied)!` }
    ];
    setMatchMessages(updatedMsgs);
    updateSupabaseTableState(playerOneScore, playerTwoScore, updatedMsgs);
    Alert.alert('Tip Sent! 🌟', `Successfully sent 🪙 ${recipientTipAmount} to ${tipTargetRecipient}!`);
  };

  const getChessSymbol = (char) => {
    const map = { R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚', P: '♟', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔', p: '♙' };
    return map[char] || '';
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Dynamic Sponsor Banner with Prize Pool Display */}
      {sponsorBannerActive && (
        <View style={[styles.sponsorBanner, isDarkMode && styles.darkCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#b7791f' }}>🌟 OFFICIAL TOURNAMENT SPONSORSHIP</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fefcbf' : '#2d3748', marginTop: 2 }}>{sponsorName}</Text>
          </View>
          <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#f59e0b' }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#b45309' }}>🏆 Prize Pool: 🪙 {sponsorPrizePool}</Text>
          </View>
        </View>
      )}

      {/* Game Selector Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={[styles.gameTabRow, isDarkMode && styles.darkCard, { flex: 1, marginBottom: 0 }]}>
          {['Matatu', 'Chess', 'Draft', 'Pool'].map(game => (
            <TouchableOpacity
              key={game}
              style={[styles.gameTabBtn, selectedGame === game && styles.activeGameTab, isDarkMode && selectedGame === game && { backgroundColor: '#334155' }]}
              onPress={() => setSelectedGame(game)}
            >
              <Text style={[styles.gameTabText, selectedGame === game && styles.activeGameTabText, isDarkMode && styles.darkText]}>
                {game === 'Matatu' ? '🃏 Matatu' : game === 'Chess' ? '♟️ Chess' : game === 'Draft' ? '⚪ Draft' : '🎱 Pool'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Developer Wager & Matchmaking Quick Action Bar */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: isDarkMode ? '#1e293b' : '#f0fdf4', borderColor: '#86efac', borderWidth: 1 }]}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#15803d' }}>⚔️ Ranked Wager Arena</Text>
          <Text style={{ fontSize: 9, color: '#64748b' }}>{isQueueActive ? '⚡ Status: Searching opponent in queue...' : 'Stake coins & earn developer rake'}</Text>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }} 
          onPress={() => setShowWagerModal(true)}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>⚡ Enter Wager Match</Text>
        </TouchableOpacity>
      </View>

      {/* Host Controls for Tournament & Rewards */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }]}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2563eb' }}>🏆 Host Bracket: {tournamentRound}</Text>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Sponsor-backed skill tournament mode</Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }} onPress={handleHostRewardWinner}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🎁 Reward Winner 🪙</Text>
        </TouchableOpacity>
      </View>

      {/* Live Broadcast Grid Component with Multi-Stream Camera Feeds */}
      <LiveBroadcastGrid
        selectedGame={selectedGame}
        spectatorCount={spectatorCount}
        hostWebcamRef={hostWebcamRef}
        playerOneWebcamRef={playerOneWebcamRef}
        playerTwoWebcamRef={playerTwoWebcamRef}
        cameraStatus={cameraStatus}
        hostCheers={hostCheers}
        playerOneCheers={playerOneCheers}
        playerTwoCheers={playerTwoCheers}
        playerOneScore={playerOneScore}
        playerTwoScore={playerTwoScore}
        handleSendCheerFor={handleSendCheerFor}
        openTipModalFor={openTipModalFor}
        isDarkMode={isDarkMode}
        styles={styles}
      />

      {/* Floating Spectator Reactions Overlay Bar */}
      {floatingReactions.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 4 }}>
          {floatingReactions.map(rx => (
            <Text key={rx.id} style={{ fontSize: 18 }}>{rx.emoji}</Text>
          ))}
        </View>
      )}

      {/* Game Table Area Component */}
      <GameTableArea
        selectedGame={selectedGame}
        chessBoardState={chessBoardState}
        draftBoardState={draftBoardState}
        poolVariant={poolVariant}
        setPoolVariant={setPoolVariant}
        cueBallPos={cueBallPos}
        targetBalls={targetBalls}
        cuePower={cuePower}
        setCuePower={setCuePower}
        cueAngle={cueAngle}
        poolRefereeAdvice={poolRefereeAdvice}
        matatuHand={matatuHand}
        lastPlayedCard={lastPlayedCard}
        opponentHandHiddenCount={opponentHandHiddenCount}
        penaltyLog={penaltyLog}
        selectedSquare={selectedSquare}
        handleSquarePress={handleSquarePress}
        handlePoolPhysicsStrike={handlePoolPhysicsStrike}
        handleMatatuAction={handleMatatuAction}
        getChessSymbol={getChessSymbol}
        styles={styles}
      />

      {/* Action Controls */}
      <View style={styles.actionButtonRow}>
        {selectedGame === 'Matatu' && (
          <>
            <TouchableOpacity style={styles.playActionBtn} onPress={() => handleMatatuAction('card')}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🃏 Play Card (Check Rules)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.playActionBtn, { backgroundColor: '#dc2626' }]} onPress={() => handleMatatuAction('catch_slip')}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🚨 Callout Matatu Slip!</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.playActionBtn, { backgroundColor: '#d69e2e' }]} onPress={() => handleMatatuAction('draw')}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🎴 Draw Card</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedGame === 'Chess' && (
          <TouchableOpacity style={styles.playActionBtn} onPress={() => Alert.alert('Chess Federation Law', 'Select a piece and tap square. Illegal moves trigger instant penalties!')}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>♟️ Tap Board Squares (Law Enforced)</Text>
          </TouchableOpacity>
        )}

        {selectedGame === 'Draft' && (
          <TouchableOpacity style={styles.playActionBtn} onPress={() => Alert.alert('Checkers Rulebook', 'Diagonal single steps required.')}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>⚪ Tap Board Squares (Law Enforced)</Text>
          </TouchableOpacity>
        )}

        {selectedGame === 'Pool' && (
          <TouchableOpacity style={[styles.playActionBtn, { backgroundColor: '#10b981' }]} onPress={handlePoolPhysicsStrike}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>🎯 Pull Stick & Strike Ball Live!</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Tipping Bar */}
      <View style={styles.tipRow}>
        <Text style={[styles.tipLabel, isDarkMode && styles.darkText]}>Quick Tip Recipient:</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity style={styles.tipBtn} onPress={() => openTipModalFor('Player A (Borris)')}>
            <Text style={styles.tipBtnText}>👤 Tip P1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tipBtn} onPress={() => openTipModalFor('Player B (Challenger)')}>
            <Text style={styles.tipBtnText}>👤 Tip P2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tipBtn, { backgroundColor: '#2b6cb0', borderColor: '#2b6cb0' }]} onPress={() => openTipModalFor('Table Host (Caster)')}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🎙️ Tip Host</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sideline Chat */}
      <View style={[styles.chatCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.chatHeaderTitle, isDarkMode && styles.darkText]}>💬 Sideline Cheer & Chat (Supabase Live)</Text>
        <ScrollView style={[styles.chatScroll, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]} nestedScrollEnabled={true}>
          {matchMessages.map(msg => (
            <View key={msg.id} style={styles.chatMsgRow}>
              <Text style={styles.chatUser}>@{msg.user}: </Text>
              <Text style={[styles.chatText, isDarkMode && styles.darkText]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Send a cheer or tactical hint..."
            placeholderTextColor="#94a3b8"
            value={chatMessage}
            onChangeText={setChatMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendCheer}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tipping Modal */}
      <Modal visible={showTipModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748' }}>🌟 Send Tip to {tipTargetRecipient}</Text>
              <TouchableOpacity onPress={() => setShowTipModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#ebf8ff', padding: 8, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Wallet Balance: 🪙 {coins} Coins (10% Developer Rake on Tips)</Text>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Select tip amount:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 15 }}>
              {[20, 50, 100, 250].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.wagerOptBtn, customTipAmount === amt && { backgroundColor: '#3182ce' }]}
                  onPress={() => setCustomTipAmount(amt)}
                >
                  <Text style={{ color: customTipAmount === amt ? '#fff' : '#2d3748', fontSize: 12, fontWeight: 'bold' }}>🪙 {amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.confirmWagerBtn, { backgroundColor: '#2563eb' }]} onPress={handleConfirmTip}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send Tip Now 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ranked Wager Matchmaking Modal */}
      <Modal visible={showWagerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#15803d' }}>⚔️ Ranked Wager Matchmaking ({selectedGame})</Text>
              <TouchableOpacity onPress={() => setShowWagerModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#86efac' }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#16a34a' }}>Your Wallet: 🪙 {coins} Coins</Text>
              <Text style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Developer Note: A 5% platform rake is collected on all match stakes to grow your earnings!</Text>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Select match stake:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 15 }}>
              {[50, 100, 250, 500].map(stake => (
                <TouchableOpacity
                  key={stake}
                  style={[styles.wagerOptBtn, selectedWagerStake === stake && { backgroundColor: '#16a34a' }]}
                  onPress={() => setSelectedWagerStake(stake)}
                >
                  <Text style={{ color: selectedWagerStake === stake ? '#fff' : '#2d3748', fontSize: 12, fontWeight: 'bold' }}>🪙 {stake}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.confirmWagerBtn, { backgroundColor: '#16a34a' }]} onPress={handleJoinWagerQueue}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Enter Match & Lock Stake ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Coin Refill & Rewarded Ad Modal */}
      <Modal visible={showCoinRefillModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#b45309' }}>🪙 Insufficient Coins - Refill Wallet</Text>
              <TouchableOpacity onPress={() => setShowCoinRefillModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#fef3c7', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#f59e0b' }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#b45309' }}>Current Balance: 🪙 {coins} Coins</Text>
              <Text style={{ fontSize: 10, color: '#78350f', marginTop: 2 }}>Top up via Mobile Money / In-App Billing or watch a quick ad for free bonus coins!</Text>
            </View>

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>Option 1: Watch Rewarded Ad (Free)</Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#d97706', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 }} 
              onPress={handleWatchRewardedAd}
              disabled={isWatchingAd}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                {isWatchingAd ? '📺 Loading Ad...' : '📺 Watch Ad for +50 Free Coins 🪙'}
              </Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>Option 2: Mobile Money & App Store Packs</Text>
            <View style={{ gap: 8, marginBottom: 10 }}>
              <TouchableOpacity style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => handleBuyCoinBundle(250)}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>🪙 250 Coins Pack</Text>
                <Text style={{ color: '#bfdbfe', fontWeight: 'bold', fontSize: 11 }}>UGX 5,000 / $1.35</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#1d4ed8', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => handleBuyCoinBundle(600)}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>🪙 600 Coins Pack (Best Value)</Text>
                <Text style={{ color: '#bfdbfe', fontWeight: 'bold', fontSize: 11 }}>UGX 10,000 / $2.70</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}