import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';

export default function DiscoveryCommentsModal({
  visible,
  onClose,
  isDarkMode,
  currentPostComments,
  newCommentText,
  setNewCommentText,
  handleAddComment,
  handleLikeComment,
  handleLikeReply,
  replyingToCommentId,
  setReplyingToCommentId,
  handleInsertFormatting,
}) {
  // Interactive Comment Poll State
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollChoice1, setPollChoice1] = useState('Bwindi Impenetrable');
  const [pollChoice2, setPollChoice2] = useState('Queen Elizabeth Park');
  const [pollChoice3, setPollChoice3] = useState('Murchison Falls');
  
  // Tracks user votes: { commentId: selectedOptionIndex }
  const [userVotes, setUserVotes] = useState({});
  // Tracks vote counts per option: { commentId: { 0: count, 1: count, 2: count } }
  const [pollVoteCounts, setPollVoteCounts] = useState({});

  const handlePostCommentWithPoll = () => {
    if (isPollMode && pollQuestion.trim()) {
      const choices = [pollChoice1, pollChoice2, pollChoice3].filter(c => c.trim().length > 0);
      const formattedPollText = `📊 [INTERACTIVE POLL]: ${pollQuestion.trim()}\n` + 
        choices.map((opt, idx) => `  ${idx + 1}. ${opt}`).join('\n');
      
      handleAddComment(formattedPollText);
      setPollQuestion('');
      setIsPollMode(false);
    } else {
      handleAddComment(newCommentText);
    }
  };

  const handleVoteChoice = (commentId, choiceIndex) => {
    const currentVote = userVotes[commentId];
    
    setUserVotes(prev => ({ ...prev, [commentId]: choiceIndex }));
    
    setPollVoteCounts(prev => {
      const commentVotes = prev[commentId] || { 0: 0, 1: 0, 2: 0 };
      if (currentVote !== undefined && currentVote !== choiceIndex) {
        commentVotes[currentVote] = Math.max(0, commentVotes[currentVote] - 1);
      }
      if (currentVote !== choiceIndex) {
        commentVotes[choiceIndex] = (commentVotes[choiceIndex] || 0) + 1;
      }
      return { ...prev, [commentId]: commentVotes };
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={[styles.modalContent, isDarkMode && styles.darkCard, { height: '88%' }]} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>💬 Professional Discussion & Interactive Polls</Text>
                <Text style={{ fontSize: 9, color: '#718096' }}>Peer-reviewed discourse, research notes & community voting.</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, marginBottom: 8 }} showsVerticalScrollIndicator={true}>
              {currentPostComments.length > 0 ? (
                currentPostComments.map(comment => {
                  const isPoll = comment.text && comment.text.includes('[INTERACTIVE POLL]');
                  
                  // Extract poll choices if it's a poll comment
                  let pollTitle = comment.text;
                  let extractedChoices = ['Option A', 'Option B', 'Option C'];
                  if (isPoll) {
                    const parts = comment.text.split('\n');
                    pollTitle = parts[0];
                    extractedChoices = parts.slice(1).map(line => line.replace(/^\s*\d+\.\s*/, '').trim());
                  }

                  const counts = pollVoteCounts[comment.id] || { 0: 0, 1: 0, 2: 0 };
                  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

                  return (
                    <View key={comment.id} style={styles.commentThreadBlock}>
                      <View style={[styles.parentCommentCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{comment.user}</Text>
                            <View style={styles.expertBadge}>
                              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#2b6cb0' }}>🛡️ Field Expert</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 9, color: '#a0aec0' }}>{comment.time}</Text>
                        </View>

                        <Text style={{ fontSize: 11, color: isDarkMode ? '#fff' : '#2d3748', marginTop: 4, lineHeight: 15 }}>
                          {isPoll ? pollTitle : comment.text}
                        </Text>
                        
                        {/* Interactive Poll Voting UI */}
                        {isPoll && (
                          <View style={styles.pollContainer}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 6 }}>
                              📊 Community Poll ({totalVotes} total votes) — Tap to vote:
                            </Text>
                            {extractedChoices.map((choiceLabel, choiceIdx) => {
                              const hasVoted = userVotes[comment.id] === choiceIdx;
                              const choiceVotes = counts[choiceIdx] || 0;
                              const adjustedTotal = totalVotes + 3; 
                              const adjustedChoiceVotes = choiceVotes + 1;
                              const percentage = totalVotes > 0 ? Math.round((adjustedChoiceVotes / adjustedTotal) * 100) : 0;

                              return (
                                <TouchableOpacity 
                                  key={choiceIdx} 
                                  style={[styles.pollOptionBtn, hasVoted && styles.votedPollOption]}
                                  onPress={() => handleVoteChoice(comment.id, choiceIdx)}
                                >
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={[styles.pollOptionText, hasVoted && { color: '#fff', fontWeight: 'bold' }]}>
                                      {hasVoted ? '✅ ' : '⭕ '} {choiceLabel}
                                    </Text>
                                    <Text style={[styles.pollStatsText, hasVoted && { color: '#fff' }]}>
                                      {choiceVotes} votes ({totalVotes > 0 ? `${percentage}%` : '0%'})
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}

                        <View style={styles.commentActionFooter}>
                          <TouchableOpacity onPress={() => handleLikeComment(comment.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                            <Text style={{ fontSize: 11, marginRight: 3 }}>❤️</Text>
                            <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>{comment.likes}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setReplyingToCommentId(comment.id)}>
                            <Text style={{ fontSize: 10, color: '#3182ce', fontWeight: 'bold' }}>Reply ({comment.replies?.length || 0})</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {comment.replies && comment.replies.length > 0 && (
                        <View style={styles.nestedRepliesContainer}>
                          {comment.replies.map(reply => (
                            <View key={reply.id} style={[styles.replyCard, isDarkMode && { backgroundColor: '#2d3748', borderColor: '#4a5568' }]}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3182ce' }}>↳ {reply.user}</Text>
                                <Text style={{ fontSize: 8, color: '#a0aec0' }}>{reply.time}</Text>
                              </View>
                              <Text style={{ fontSize: 10, color: isDarkMode ? '#fff' : '#2d3748', marginTop: 2, lineHeight: 14 }}>{reply.text}</Text>
                              <TouchableOpacity onPress={() => handleLikeReply(comment.id, reply.id)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Text style={{ fontSize: 10, marginRight: 2 }}>❤️</Text>
                                <Text style={{ fontSize: 9, color: '#718096' }}>{reply.likes}</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 20 }}>No research notes yet. Initiate professional field discourse!</Text>
              )}
            </ScrollView>

            {replyingToCommentId && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ebf8ff', padding: 6, borderRadius: 6, marginBottom: 6 }}>
                <Text style={{ fontSize: 10, color: '#2b6cb0', fontWeight: 'bold' }}>Replying professionally in thread...</Text>
                <TouchableOpacity onPress={() => setReplyingToCommentId(null)}>
                  <Text style={{ fontSize: 10, color: '#e53e3e', fontWeight: 'bold' }}>Cancel Reply</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Poll Creation Builder Box */}
            <View style={styles.pollToggleBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>📊 Create Interactive Voting Poll</Text>
                <Switch value={isPollMode} onValueChange={setIsPollMode} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
              </View>
              {isPollMode && (
                <View style={{ marginTop: 6 }}>
                  <TextInput
                    style={[styles.pollInput, isDarkMode && styles.darkText]}
                    placeholder="Poll Question (e.g. Next Tour Location?)"
                    placeholderTextColor="#a0aec0"
                    value={pollQuestion}
                    onChangeText={setPollQuestion}
                  />
                  <TextInput
                    style={[styles.pollInput, isDarkMode && styles.darkText, { marginTop: 4 }]}
                    placeholder="Choice 1"
                    placeholderTextColor="#a0aec0"
                    value={pollChoice1}
                    onChangeText={setPollChoice1}
                  />
                  <TextInput
                    style={[styles.pollInput, isDarkMode && styles.darkText, { marginTop: 4 }]}
                    placeholder="Choice 2"
                    placeholderTextColor="#a0aec0"
                    value={pollChoice2}
                    onChangeText={setPollChoice2}
                  />
                  <TextInput
                    style={[styles.pollInput, isDarkMode && styles.darkText, { marginTop: 4 }]}
                    placeholder="Choice 3"
                    placeholderTextColor="#a0aec0"
                    value={pollChoice3}
                    onChangeText={setPollChoice3}
                  />
                </View>
              )}
            </View>

            {/* QUICK RESEARCH TAGS BAR */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              {[
                { label: '💡 Insight', prefix: '[💡 Insight]: ' },
                { label: '🔍 Observation', prefix: '[🔍 Observation]: ' },
                { label: '❓ Question', prefix: '[❓ Question]: ' },
                { label: '⚠️ Alert', prefix: '[⚠️ Conservation Alert]: ' }
              ].map(tag => (
                <TouchableOpacity 
                  key={tag.label} 
                  style={styles.researchTagPill}
                  onPress={() => setNewCommentText(prev => prev ? `${prev} ${tag.prefix}` : tag.prefix)}
                >
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#2b6cb0' }}>{tag.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FORMATTING TOOLBAR */}
            <View style={{ flexDirection: 'row', backgroundColor: isDarkMode ? '#1a202c' : '#edf2f7', padding: 4, borderRadius: 6, marginBottom: 6, justifyContent: 'space-around' }}>
              <TouchableOpacity onPress={() => handleInsertFormatting('newline')} style={styles.formatBtn}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#4a5568' }}>↩️ Enter Line</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleInsertFormatting('bullet')} style={styles.formatBtn}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#4a5568' }}>• Bullet List</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleInsertFormatting('list')} style={styles.formatBtn}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#4a5568' }}>1. Number List</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6, alignItems: 'center' }}>
              {['❤️', '🔥', '👏', '🚀', '🐘', '✨', '⚽', '💯', '🦁', '🎉'].map(emoji => (
                <TouchableOpacity key={emoji} style={{ marginRight: 12 }} onPress={() => setNewCommentText(prev => prev + emoji)}>
                  <Text style={{ fontSize: 22 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 8 }}>
              <TextInput
                style={[styles.commentInputBox, isDarkMode && styles.darkText]}
                placeholder={isPollMode ? "Configure your choices above..." : (replyingToCommentId ? "Write a professional field reply..." : "Add professional field observation or note...")}
                placeholderTextColor="#a0aec0"
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline={true}
              />
              <TouchableOpacity style={styles.sendCommentBtn} onPress={isPollMode ? handlePostCommentWithPoll : () => handleAddComment(newCommentText)}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{isPollMode ? 'Post Poll' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, width: '100%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  modalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  commentThreadBlock: { marginBottom: 12 },
  parentCommentCard: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  expertBadge: { backgroundColor: '#ebf8ff', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: '#bee3f8' },
  nestedRepliesContainer: { marginLeft: 16, marginTop: 6, borderLeftWidth: 2, borderLeftColor: '#3182ce', paddingLeft: 8 },
  replyCard: { backgroundColor: '#edf2f7', padding: 8, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  commentActionFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  researchTagPill: { backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#bee3f8' },
  commentInputBox: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, minHeight: 34, maxHeight: 80, fontSize: 11, paddingTop: 8 },
  sendCommentBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  formatBtn: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4 },
  pollToggleBox: { backgroundColor: '#ebf8ff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#bee3f8', marginBottom: 6 },
  pollInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, paddingHorizontal: 8, height: 28, fontSize: 11 },
  pollContainer: { marginTop: 8, backgroundColor: '#f7fafc', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  pollOptionBtn: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e0', marginVertical: 3 },
  votedPollOption: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  pollOptionText: { fontSize: 11, color: '#2d3748' },
  pollStatsText: { fontSize: 10, color: '#718096', fontWeight: 'bold' },
});