import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export default function GameTableArea({
  selectedGame,
  chessBoardState,
  draftBoardState,
  poolVariant,
  setPoolVariant,
  cueBallPos,
  targetBalls,
  cuePower,
  setCuePower,
  cueAngle,
  poolRefereeAdvice,
  matatuHand,
  lastPlayedCard,
  opponentHandHiddenCount,
  penaltyLog,
  selectedSquare,
  handleSquarePress,
  handlePoolPhysicsStrike,
  handleMatatuAction,
  getChessSymbol,
  styles // <-- Ensure styles is accepted here as a prop
}) {
  return (
    <View style={styles.centralGameTable}>
      <View style={styles.tableHeaderRow}>
        <Text style={{ color: '#6ee7b7', fontSize: 11, fontWeight: 'bold' }}>🌿 Strict Rules Arena: {selectedGame}</Text>
        <Text style={{ color: '#cbd5e1', fontSize: 10 }}>{selectedGame === 'Pool' ? '🎱 Live Cue Stick & Pocket Physics' : '🛰️ Matrix Law Enforced'}</Text>
      </View>

      {/* CHESS PHYSICAL BOARD RENDERER */}
      {selectedGame === 'Chess' && (
        <View style={styles.physicalBoardContainer}>
          {chessBoardState.map((row, rIdx) => (
            <View key={rIdx} style={styles.boardRow}>
              {row.map((cell, cIdx) => {
                const isDark = (rIdx + cIdx) % 2 === 1;
                const isSelected = selectedSquare?.r === rIdx && selectedSquare?.c === cIdx;
                return (
                  <TouchableOpacity 
                    key={cIdx} 
                    style={[styles.boardSquare, isDark ? styles.darkSquare : styles.lightSquare, isSelected && { backgroundColor: '#fde047' }]}
                    onPress={() => handleSquarePress(rIdx, cIdx)}
                  >
                    <Text style={[styles.pieceText, (rIdx < 2) ? { color: '#f8fafc' } : { color: '#0f172a' }]}>
                      {getChessSymbol(cell)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* DRAFT CHECKERS PHYSICAL BOARD RENDERER */}
      {selectedGame === 'Draft' && (
        <View style={styles.physicalBoardContainer}>
          {draftBoardState.map((row, rIdx) => (
            <View key={rIdx} style={styles.boardRow}>
              {row.map((cell, cIdx) => {
                const isDark = (rIdx + cIdx) % 2 === 1;
                const isSelected = selectedSquare?.r === rIdx && selectedSquare?.c === cIdx;
                return (
                  <TouchableOpacity 
                    key={cIdx} 
                    style={[styles.boardSquare, isDark ? styles.darkSquare : styles.lightSquare, isSelected && { backgroundColor: '#fde047' }]}
                    onPress={() => handleSquarePress(rIdx, cIdx)}
                  >
                    {cell === 1 && <View style={styles.draftRedPiece} />}
                    {cell === 2 && <View style={styles.draftDarkPiece} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* AUTHENTIC LIVE POOL TABLE WITH CUE STICK & POCKET PHYSICS */}
      {selectedGame === 'Pool' && (
        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 4 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
            {['8-Ball', '9-Ball'].map(variant => (
              <TouchableOpacity 
                key={variant} 
                style={[styles.tipBtn, poolVariant === variant && { backgroundColor: '#10b981', borderColor: '#10b981' }]}
                onPress={() => setPoolVariant(variant)}
              >
                <Text style={[styles.tipBtnText, poolVariant === variant && { color: '#fff' }]}>{variant}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Felt Surface with 4 Corner Pockets */}
          <View style={styles.poolFeltContainer}>
            <View style={[styles.pocketMarker, { top: 4, left: 4 }]} />
            <View style={[styles.pocketMarker, { top: 4, right: 4 }]} />
            <View style={[styles.pocketMarker, { bottom: 4, left: 4 }]} />
            <View style={[styles.pocketMarker, { bottom: 4, right: 4 }]} />

            {/* Cue Ball */}
            <View style={[styles.poolBallItem, { left: cueBallPos.x, top: cueBallPos.y, backgroundColor: '#f8fafc' }]}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#000' }}>Cue</Text>
            </View>

            {/* Target Balls */}
            {targetBalls.map(ball => !ball.sunk && (
              <View key={ball.id} style={[styles.poolBallItem, { left: ball.x, top: ball.y, backgroundColor: ball.color }]}>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: ball.color === '#f8fafc' ? '#000' : '#fff' }}>{ball.label}</Text>
              </View>
            ))}

            {/* Pull-Back Cue Stick Visual */}
            <View style={[styles.cueStickVisual, { transform: [{ translateX: -cuePower }, { rotate: `${-cueAngle}deg` }] }]} />
          </View>

          {/* Power Slider Control */}
          <View style={{ width: '100%', paddingHorizontal: 10, marginTop: 6 }}>
            <Text style={{ color: '#fef08a', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>🎯 Cue Pull-Back Power: {cuePower}% | Angle: {cueAngle}°</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 4 }}>
              {[25, 50, 75, 100].map(pwr => (
                <TouchableOpacity 
                  key={pwr} 
                  style={[styles.tipBtn, cuePower === pwr && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]}
                  onPress={() => setCuePower(pwr)}
                >
                  <Text style={[styles.tipBtnText, cuePower === pwr && { color: '#fff' }]}>{pwr}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={{ color: '#cbd5e1', fontSize: 9, fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>🤖 Referee Guidance: {poolRefereeAdvice}</Text>
        </View>
      )}

      {/* MATATU HIDDEN HAND & PHANTOM RULE TABLE */}
      {selectedGame === 'Matatu' && (
        <View style={styles.gameTableContent}>
          <Text style={{ color: '#fef08a', fontSize: 10, marginBottom: 4, textAlign: 'center', fontWeight: 'bold' }}>🃏 Centerpile Active Discard: {lastPlayedCard}</Text>
          <Text style={{ color: '#cbd5e1', fontSize: 9, marginBottom: 8, textAlign: 'center' }}>🔒 Opponent Hand: {opponentHandHiddenCount} cards (Hidden from you)</Text>
          
          <Text style={{ color: '#6ee7b7', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Your Private Hand (Hidden from Opponent):</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            {matatuHand.length > 0 ? (
              matatuHand.map((card, idx) => (
                <View key={idx} style={styles.matatuCardItem}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>{card}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#fff', fontSize: 10 }}>Hand Empty! Matatu Won!</Text>
            )}
          </View>
          <Text style={{ color: '#fca5a5', fontSize: 9, fontStyle: 'italic' }}>⚠️ Phantom Rule Monitor: {penaltyLog}</Text>
        </View>
      )}
    </View>
  );
}