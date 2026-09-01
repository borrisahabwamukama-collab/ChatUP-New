import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function InteractiveGamesHub({ coins, setCoins }) {
  const [activeTab, setActiveTab] = useState('trivia'); // 'trivia' | 'predictor'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const triviaQuestion = {
    question: "Which river is the longest in Uganda and flows out through Lake Albert?",
    options: ["River Nile", "River Kafu", "River Katonga", "River Aswa"],
    correctIndex: 0,
  };

  const handleTriviaGuess = (index) => {
    if (hasVoted) return;
    setSelectedAnswer(index);
    setHasVoted(true);

    if (index === triviaQuestion.correctIndex) {
      setCoins(prev => prev + 50);
      Alert.alert('Correct! 🎉', 'You won 50 coins for answering correctly in the community chat!');
    } else {
      Alert.alert('Incorrect ❌', 'Better luck next time! Keep participating in group trivia.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'trivia' && styles.activeTab]}
          onPress={() => setActiveTab('trivia')}
        >
          <Text style={[styles.tabText, activeTab === 'trivia' && styles.activeText]}>💬 In-Chat Trivia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'predictor' && styles.activeTab]}
          onPress={() => setActiveTab('predictor')}
        >
          <Text style={[styles.tabText, activeTab === 'predictor' && styles.activeText]}>🔴 Live Stream Predictor</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'trivia' && (
        <View style={styles.card}>
          <Text style={styles.badge}>LIVE CHAT MINI-GAME</Text>
          <Text style={styles.questionText}>{triviaQuestion.question}</Text>

          {triviaQuestion.options.map((option, index) => {
            let btnStyle = styles.optionBtn;
            if (hasVoted) {
              if (index === triviaQuestion.correctIndex) btnStyle = [styles.optionBtn, styles.correctOpt];
              else if (index === selectedAnswer) btnStyle = [styles.optionBtn, styles.wrongOpt];
            }

            return (
              <TouchableOpacity
                key={index}
                style={btnStyle}
                onPress={() => handleTriviaGuess(index)}
                disabled={hasVoted}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {hasVoted && (
            <TouchableOpacity 
              style={styles.resetBtn} 
              onPress={() => { setHasVoted(false); setSelectedAnswer(null); }}
            >
              <Text style={styles.resetText}>Next Question 🔄</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTab === 'predictor' && (
        <View style={styles.card}>
          <Text style={styles.badge}>LIVE BROADCAST PREDICTOR</Text>
          <Text style={styles.questionText}>Will the Sunday service guest speaker finish preaching before 1:00 PM?</Text>

          <View style={styles.predictorRow}>
            <TouchableOpacity 
              style={styles.predYesBtn} 
              onPress={() => {
                setCoins(prev => prev + 100);
                Alert.alert('Prediction Locked 🌟', 'You wagered on YES! Win pool rewards if correct.');
              }}
            >
              <Text style={styles.predBtnText}>YES 👍</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.predNoBtn} 
              onPress={() => {
                setCoins(prev => prev + 100);
                Alert.alert('Prediction Locked 🌟', 'You wagered on NO! Win pool rewards if correct.');
              }}
            >
              <Text style={styles.predBtnText}>NO 👎</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    lineHeight: 22,
  },
  optionBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  correctOpt: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  wrongOpt: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  resetBtn: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  predictorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  predYesBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  predNoBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 6,
  },
  predBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});