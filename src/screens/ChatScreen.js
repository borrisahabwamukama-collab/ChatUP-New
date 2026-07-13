import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MOCK_MESSAGES } from '../data/mockData';

export default function ChatScreen() {
  const route = useRoute();
  const { chatId, name } = route.params;
  const [messages, setMessages] = useState(MOCK_MESSAGES[chatId] || []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const sendMessage = () => {
    if (input.trim() === '') return;

    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate other person typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg = {
        id: Date.now().toString() + 'r',
        text: 'Got it! 👍',
        sender: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 2000); // 2 second delay
  };

  const renderItem = ({ item }) => (
    <View style={[styles.msgBubble, item.sender === 'me'? styles.me : styles.other]}>
      <Text style={styles.msgText}>{item.text}</Text>
      <Text style={styles.msgTime}>{item.time}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios'? 'padding' : 'height'}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{name} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  msgBubble: { padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: '75%' },
  me: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  other: { backgroundColor: 'white', alignSelf: 'flex-start' },
  msgText: { fontSize: 16 },
  msgTime: { fontSize: 11, color: 'gray', alignSelf: 'flex-end', marginTop: 2 },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: 'white', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  sendBtn: { marginLeft: 8, backgroundColor: '#007AFF', padding: 10, borderRadius: 20 },
  sendText: { color: 'white', fontWeight: '600' },
  typingContainer: { paddingHorizontal: 15, paddingBottom: 4 },
  typingText: { fontSize: 12, fontStyle: 'italic', color: 'gray' },
});