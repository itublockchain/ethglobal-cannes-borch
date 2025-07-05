import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sapphire Test Network configuration
export const SAPPHIRE_TESTNET_RPC = 'https://testnet.sapphire.oasis.dev';
export const CONTRACT_ADDRESS = '0x2eD20138F1C03b29939f01B4989e6e7927E3920a';
export const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Event listener configuration
export const EVENT_CONFIG = {
  POLL_INTERVAL_MS: 3000, // 3 seconds (faster)
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 5000,
  MAX_BLOCK_RANGE: 1000,
  MAX_PROCESSED_TX_HASHES: 10000,
}; 