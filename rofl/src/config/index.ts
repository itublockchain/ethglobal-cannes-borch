import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sapphire Test Network configuration
export const SAPPHIRE_TESTNET_RPC = 'https://testnet.sapphire.oasis.dev';
export const CONTRACT_ADDRESS = '0xf4066Cf51f13d4F0B9FF8009F61D21BbB31d19a6';
export const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Rain.xyz API configuration
export const RAIN_API_CONFIG = {
  API_BASE: 'https://api.rain.xyz',
  AUTH_TOKEN: process.env.RAIN_AUTH_TOKEN || '',
  SESSION_COOKIE: process.env.RAIN_SESSION_COOKIE || '',
  CSRF_TOKEN: process.env.RAIN_CSRF_TOKEN || '',
  CARDHOLDER_ID: process.env.RAIN_CARDHOLDER_ID || '',
  CARDHOLDER_USER_ID: process.env.RAIN_CARDHOLDER_USER_ID || '',
  FIRST_NAME: process.env.RAIN_FIRST_NAME || '',
  LAST_NAME: process.env.RAIN_LAST_NAME || '',
};

// Event listener configuration
export const EVENT_CONFIG = {
  POLL_INTERVAL_MS: 3000, // 3 seconds (faster)
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 5000,
  MAX_BLOCK_RANGE: 1000,
  MAX_PROCESSED_TX_HASHES: 10000,
}; 