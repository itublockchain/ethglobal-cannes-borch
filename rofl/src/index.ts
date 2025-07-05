// Export all modules
export * from './types';
export * from './config';
export * from './contracts/abi';
export * from './services/GroupEventListener';
export * from './services/DepositEventListener';
export * from './services/MultiNetworkEventListener';
export * from './services/RainAPIService';
export * from './utils/cardGenerator';
export * from './test-deposit';

// Start the application
import('./main'); 