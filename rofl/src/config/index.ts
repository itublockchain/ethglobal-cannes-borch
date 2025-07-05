import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Multi-network configuration
export const NETWORK_CONFIGS = {
  sapphire: {
    name: 'Sapphire Testnet',
    rpc: 'https://testnet.sapphire.oasis.dev',
    chainId: 23295,
    contracts: {
      groupManager: '0xf4066Cf51f13d4F0B9FF8009F61D21BbB31d19a6'
    }
  },
  sepolia: {
    name: 'Sepolia',
    rpc: 'https://eth-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 11155111,
    contracts: {
      deposit: '0xacb2d949855dedbe72cc65d6030f3b1390748077',
      usdc: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    },
    cctpDomain: 0
  },
  baseSepolia: {
    name: 'Base Sepolia',
    rpc: 'https://base-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 84532,
    contracts: {
      deposit: '0x5ca0208564f7838e5416b7b061002407896cdd41',
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    },
    cctpDomain: 6
  },
  arbSepolia: {
    name: 'Arbitrum Sepolia',
    rpc: 'https://arb-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 421614,
    contracts: {
      deposit: '0x2cde5431ba814b8ef713554630490ca495d9bbd9',
      usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    },
    cctpDomain: 3
  }
} as const;

// Event listener configuration
export const EVENT_CONFIG = {
  POLL_INTERVAL_MS: 3000, // 3 seconds (faster)
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 5000,
  MAX_BLOCK_RANGE: 1000,
  MAX_PROCESSED_TX_HASHES: 10000,
};

// Backward compatibility - şu anki GroupEventListener için
export const SAPPHIRE_TESTNET_RPC = NETWORK_CONFIGS.sapphire.rpc;
export const CONTRACT_ADDRESS = NETWORK_CONFIGS.sapphire.contracts.groupManager;
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

// CCTP Configuration
export const CCTP_CONFIG = {
  TARGET_NETWORK: 'baseSepolia', // USDC'lerin toplanacağı hedef ağ
  MIN_TRANSFER_AMOUNT: '1000000', // 1 USDC (6 decimals)
  MAX_FEE: '5000', // 0.005 USDC
  MIN_FINALITY_THRESHOLD: 2000, // Standard Transfer (finalized)
  ATTESTATION_API_URL: 'https://iris-api-sandbox.circle.com/v2/messages',
  ATTESTATION_POLL_INTERVAL: 5000, // 5 saniye
  ATTESTATION_TIMEOUT: 600000, // 10 dakika
} as const; 