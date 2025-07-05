import { ethers } from 'ethers';
import { NETWORK_CONFIGS } from './config';
import { CctpService } from './services/CctpService';

// Burn transaction hash'i buraya girin
const BURN_TX_HASH = '0x8b7d8562958e6b4b5f5818465fe6c088ca48ab1bf4ad0fd3a3ae9ee966a726bc';

async function completeBurnTransaction() {
  try {
    console.log('🔥 Completing burn transaction...');
    console.log(`📄 Burn TX: ${BURN_TX_HASH}`);
    
    // Sepolia provider (burn işleminin yapıldığı network)
    const sepoliaProvider = new ethers.JsonRpcProvider(NETWORK_CONFIGS.sepolia.rpc);
    
    // Base Sepolia provider (mint işleminin yapılacağı network)
    const baseSepoliaProvider = new ethers.JsonRpcProvider(NETWORK_CONFIGS.baseSepolia.rpc);
    
    // CCTP service
    const cctpService = new CctpService();
    
    // Burn transaction'ını kontrol et
    console.log('🔍 Checking burn transaction status...');
    const burnTx = await sepoliaProvider.getTransaction(BURN_TX_HASH);
    
    if (!burnTx) {
      console.log('❌ Burn transaction not found!');
      return;
    }
    
    if (!burnTx.blockNumber) {
      console.log('⏳ Burn transaction not yet mined. Waiting...');
      return;
    }
    
    console.log('✅ Burn transaction found and mined');
    console.log(`📦 Block number: ${burnTx.blockNumber}`);
    
    // Attestation al (Sepolia domain = 0)
    console.log('🔍 Retrieving attestation...');
    const attestation = await cctpService.getAttestation(BURN_TX_HASH, NETWORK_CONFIGS.sepolia.cctpDomain);
    
    if (!attestation) {
      console.log('❌ Could not retrieve attestation');
      return;
    }
    
    console.log('✅ Attestation retrieved successfully');
    
    // Mint işlemini Base Sepolia'da yap
    console.log('💰 Minting USDC on Base Sepolia...');
    const mintTxHash = await cctpService.mintUsdc('baseSepolia', attestation);
    
    if (mintTxHash) {
      console.log('✅ CCTP transfer completed successfully!');
      console.log(`🎯 Mint TX: ${mintTxHash}`);
      
      // Balance kontrolü
      console.log('💰 Checking final balance...');
      const balance = await cctpService.getUsdcBalance('baseSepolia');
      console.log(`💰 Base Sepolia USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
    } else {
      console.log('❌ Mint transaction failed');
    }
    
  } catch (error) {
    console.error('❌ Error completing burn transaction:', error);
  }
}

// Script'i çalıştır
completeBurnTransaction()
  .then(() => {
    console.log('🎉 Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 