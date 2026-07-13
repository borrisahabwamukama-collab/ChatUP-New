// Mock data for ChatUp app

export const MOCK_CHATS = [
  { 
    id: '1', 
    name: 'Alice', 
    lastMessage: 'See you tomorrow!', 
    time: '10:30 AM', 
    unread: 2, 
    isGroup: false, 
    avatar: 'A', 
    isTyping: false 
  },
  { 
    id: '2', 
    name: 'Bob', 
    lastMessage: 'Got it 👍', 
    time: 'Yesterday', 
    unread: 0, 
    isGroup: false, 
    avatar: 'B', 
    isTyping: false 
  },
  { 
    id: '3', 
    name: 'Dev Team', 
    lastMessage: 'John: Pushing to main', 
    time: '09:15 AM', 
    unread: 5, 
    isGroup: true, 
    avatar: 'D', 
    isTyping: false 
  },
  { 
    id: '4', 
    name: 'Mom', 
    lastMessage: 'Call me when you are free', 
    time: '08:45 AM', 
    unread: 1, 
    isGroup: false, 
    avatar: 'M', 
    isTyping: false 
  },
];

export const MOCK_MESSAGES = {
  '1': [
    { id: 'm1', text: 'Hey, are we still on for coffee?', sender: 'other', time: '10:28 AM' },
    { id: 'm2', text: 'Yes! 3pm at the usual place', sender: 'me', time: '10:29 AM' },
    { id: 'm3', text: 'Perfect, see you then', sender: 'other', time: '10:30 AM' },
  ],
  '2': [
    { id: 'm4', text: 'Did you check the PR?', sender: 'other', time: 'Yesterday' },
    { id: 'm5', text: 'Yeah looks good to me', sender: 'me', time: 'Yesterday' },
    { id: 'm6', text: 'Got it 👍', sender: 'other', time: 'Yesterday' },
  ],
  '3': [
    { id: 'm7', text: 'Meeting at 11', sender: 'other', time: '09:00 AM' },
    { id: 'm8', text: 'John: Pushing to main', sender: 'other', time: '09:15 AM' },
    { id: 'm9', text: 'Sarah: I will review it', sender: 'other', time: '09:16 AM' },
  ],
  '4': [
    { id: 'm10', text: 'Did you eat lunch?', sender: 'other', time: '08:40 AM' },
    { id: 'm11', text: 'Yes mom, had rice', sender: 'me', time: '08:42 AM' },
    { id: 'm12', text: 'Call me when you are free', sender: 'other', time: '08:45 AM' },
  ],
};