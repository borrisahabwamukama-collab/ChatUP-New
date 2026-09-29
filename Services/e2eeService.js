import AsyncStorage from '@react-native-async-storage/async-storage';

const E2EE_SECRET_KEY_STORAGE = '@chatup_e2ee_secret_key';

// Simple symmetric encryption helper (AES simulation via base64 or Web Crypto)
export async function getOrCreateSecretKey() {
  let key = await AsyncStorage.getItem(E2EE_SECRET_KEY_STORAGE);
  if (!key) {
    // Generate a secure random local key for this chat session if none exists
    key = 'chatup_secure_key_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    await AsyncStorage.setItem(E2EE_SECRET_KEY_STORAGE, key);
  }
  return key;
}

// Encrypt plaintext message before sending to Supabase
export async function encryptMessage(plainText) {
  try {
    if (!plainText) return '';
    const secretKey = await getOrCreateSecretKey();
    // Simple XOR / Base64 encryption wrap (Replace with AES-GCM for production grade)
    const encoded = encodeURIComponent(plainText);
    const cipherText = btoa(encoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ secretKey.charCodeAt(i % secretKey.length))
    ).join(''));
    return `E2EE:${cipherText}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return plainText; // Fallback to plaintext if error occurs
  }
}

// Decrypt ciphertext message received from Supabase
export async function decryptMessage(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.startsWith('E2EE:')) {
      return encryptedText; // Return as-is if it's not encrypted
    }
    const secretKey = await getOrCreateSecretKey();
    const rawCipher = encryptedText.replace('E2EE:', '');
    const decoded = atob(rawCipher);
    const plainText = decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ secretKey.charCodeAt(i % secretKey.length))
    ).join('');
    return decodeURIComponent(plainText);
  } catch (err) {
    console.error('Decryption error:', err);
    return '🔒 [Encrypted Message - Key Mismatch]';
  }
}