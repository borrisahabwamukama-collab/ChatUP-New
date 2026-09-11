// Mock data for ChatUp app - Dynamic State Manager

export const getInitialChats = (coins = 1500) => [
  { 
    id: '1', 
    name: 'Alice', 
    lastMessage: 'See you tomorrow!', 
    time: '10:30 AM', 
    unread: 2, 
    isGroup: false, 
    avatar: 'A', 
    isTyping: false,
    secureEnclaveLocked: false,
  },
  { 
    id: '2', 
    name: 'Bob', 
    lastMessage: 'Got it 👍', 
    time: 'Yesterday', 
    unread: 0, 
    isGroup: false, 
    avatar: 'B', 
    isTyping: false,
    secureEnclaveLocked: false,
  },
  { 
    id: '3', 
    name: 'Dev Team', 
    lastMessage: 'John: Pushing to main', 
    time: '09:15 AM', 
    unread: 5, 
    isGroup: true, 
    avatar: 'D', 
    isTyping: false,
    secureEnclaveLocked: true,
  },
  { 
    id: '4', 
    name: 'Nimusiima Asifa', 
    lastMessage: 'Let us coordinate the Kampala wildlife tour logistics 🌿🐘', 
    time: '08:45 AM', 
    unread: 1, 
    isGroup: false, 
    avatar: 'N', 
    isTyping: true,
    secureEnclaveLocked: false,
  },
];

export const getInitialMessages = () => ({
  '1': [
    { id: 'm1', text: 'Hey, are we still on for coffee?', sender: 'other', time: '10:28 AM', status: 'read' },
    { id: 'm2', text: 'Yes! 3pm at the usual place', sender: 'me', time: '10:29 AM', status: 'read' },
    { id: 'm3', text: 'Perfect, see you then', sender: 'other', time: '10:30 AM', status: 'read' },
  ],
  '2': [
    { id: 'm4', text: 'Did you check the PR?', sender: 'other', time: 'Yesterday', status: 'read' },
    { id: 'm5', text: 'Yeah looks good to me', sender: 'me', time: 'Yesterday', status: 'read' },
    { id: 'm6', text: 'Got it 👍', sender: 'other', time: 'Yesterday', status: 'read' },
  ],
  '3': [
    { id: 'm7', text: 'Meeting at 11', sender: 'other', time: '09:00 AM', status: 'read' },
    { id: 'm8', text: 'John: Pushing to main', sender: 'other', time: '09:15 AM', status: 'read' },
    { id: 'm9', text: 'Sarah: I will review it', sender: 'other', time: '09:16 AM', status: 'read' },
  ],
  '4': [
    { id: 'm10', text: 'Did you check the mobile money gateway balance?', sender: 'other', time: '08:40 AM', status: 'read' },
    { id: 'm11', text: 'Yes Asifa, Supabase connection is stable.', sender: 'me', time: '08:42 AM', status: 'read' },
    { id: 'm12', text: 'Let us coordinate the Kampala wildlife tour logistics 🌿🐘', sender: 'other', time: '08:45 AM', status: 'read' },
  ],
});

// Dynamic simulated live message generator for real-time chat testing
export const getRandomIncomingMessage = () => {
  const incomingPool = [
    "Checking in from the Kampala node! 📡",
    "Supabase webhook synced successfully. 💻",
    "Let's review the ChatUp architecture notes later today.",
    "Did you capture the wildlife footage for YouTube? 🦁",
    "Sent 🪙 5,000 via in-chat mobile money gateway 💸"
  ];
  return incomingPool[Math.floor(Math.random() * incomingPool.length)];
};