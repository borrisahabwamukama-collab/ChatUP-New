import { supabase } from './supabaseClient';

// Flutterwave Standard Payout Endpoint (Transfer API)
const FLW_ENDPOINT = 'https://api.flutterwave.com/v3/transfers';
const FLW_SECRET_KEY = 'FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxx-X'; // Replace with your Flutterwave Test/Live Secret Key

export async function processFlutterwavePayout({ accountNumber, bankCode, amount, recipientName, currency = 'UGX' }) {
  try {
    const payload = {
      account_bank: bankCode, // e.g., 'MPS' for MTN Mobile Money or bank code
      account_number: accountNumber,
      amount: amount,
      currency: currency,
      narration: 'ChatUp Creator Payout',
      beneficiary_name: recipientName,
      debit_currency: currency
    };

    const response = await fetch(FLW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success') {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.message || 'Transfer failed' };
    }
  } catch (err) {
    console.error('Flutterwave Network Error:', err);
    return { success: false, error: err.message };
  }
}