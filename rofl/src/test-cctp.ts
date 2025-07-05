import { ethers } from 'ethers';
import { CctpService } from './services/CctpService';
import { NETWORK_CONFIGS } from './config';

async function testCctpService(): Promise<void> {
  console.log('🧪 Testing CCTP Service...');
  console.log('===========================');
  
  const cctpService = new CctpService();
  
  // Test 1: Bakiye kontrolleri
  console.log('\n1️⃣ Testing balance checks...');
  const networks = ['sepolia', 'baseSepolia', 'arbSepolia'];
  
  for (const networkKey of networks) {
    try {
      const balance = await cctpService.getUsdcBalance(networkKey);
      const balanceFormatted = ethers.formatUnits(balance, 6);
      console.log(`💰 ${networkKey}: ${balanceFormatted} USDC`);
    } catch (error: any) {
      console.error(`❌ ${networkKey}: ${error.message}`);
    }
  }
  
  // Test 2: CCTP transfer testi (küçük miktar)
  console.log('\n2️⃣ Testing CCTP transfer...');
  const testAmount = ethers.parseUnits('1', 6); // 1 USDC
  
  try {
    // Arbitrum Sepolia'dan Base Sepolia'ya test transferi
    const sourceNetwork = 'arbSepolia';
    const destinationNetwork = 'baseSepolia';
    
    // Önce kaynak ağda yeterli bakiye var mı kontrol et
    const sourceBalance = await cctpService.getUsdcBalance(sourceNetwork);
    
    if (sourceBalance < testAmount) {
      console.log(`⚠️  Insufficient balance on ${sourceNetwork} for test transfer`);
      console.log(`   Need: ${ethers.formatUnits(testAmount, 6)} USDC`);
      console.log(`   Have: ${ethers.formatUnits(sourceBalance, 6)} USDC`);
      return;
    }
    
    console.log(`🚀 Transferring ${ethers.formatUnits(testAmount, 6)} USDC from ${sourceNetwork} to ${destinationNetwork}...`);
    
    const result = await cctpService.transferUsdc(
      sourceNetwork,
      destinationNetwork,
      testAmount
    );
    
    if (result.success) {
      console.log('✅ CCTP transfer test completed successfully!');
      console.log(`   Burn TX: ${result.burnTxHash}`);
      console.log(`   Mint TX: ${result.mintTxHash}`);
    } else {
      console.error('❌ CCTP transfer test failed:', result.error);
    }
    
  } catch (error: any) {
    console.error('❌ CCTP transfer test error:', error.message);
  }
}

// Test'i çalıştır
testCctpService().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 