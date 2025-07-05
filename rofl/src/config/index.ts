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
    name: 'Ethereum Sepolia',
    rpc: 'https://eth-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 11155111,
    domain: 0,
    contracts: {
      deposit: '0x5e103637810e96b83205d418d060616382071e28',
      usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    }
  },
  baseSepolia: {
    name: 'Base Sepolia',
    rpc: 'https://base-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 84532,
    domain: 6,
    contracts: {
      deposit: '0x714247e799aa19bd75ea55dac2d1dde7641a0321',
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    }
  },
  arbSepolia: {
    name: 'Arbitrum Sepolia',
    rpc: 'https://arb-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 421614,
    domain: 3,
    contracts: {
      deposit: '0x071c3142147e9275acde36e5a669c8130f314c29',
      usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    }
  },
  avalanche: {
    name: 'Avalanche Fuji',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    domain: 1,
    contracts: {
      usdc: '0x5425890298aed601595a70AB815c96711a31Bc65',
      tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
      messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
    }
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