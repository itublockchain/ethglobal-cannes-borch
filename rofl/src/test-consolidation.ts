import { UsdcConsolidationService } from './services/UsdcConsolidationService';

async function testConsolidationService(): Promise<void> {
  console.log('🧪 Testing USDC Consolidation Service...');
  console.log('========================================');
  
  const consolidationService = new UsdcConsolidationService();
  
  // Test 1: Servis durumu
  console.log('\n1️⃣ Testing service status...');
  const status = consolidationService.getStatus();
  console.log(`🎯 Target Network: ${status.targetNetwork}`);
  console.log(`📡 Source Networks: ${status.sourceNetworks.join(', ')}`);
  console.log(`🕐 Cron Active: ${status.cronActive}`);
  console.log(`⚙️  Is Running: ${status.isRunning}`);
  
  // Test 2: Manuel consolidation
  console.log('\n2️⃣ Running manual consolidation...');
  await consolidationService.runManualConsolidation();
  
  // Test 3: Cron job testi (kısa süreliğine)
  console.log('\n3️⃣ Testing cron job...');
  console.log('Starting cron job for 2 minutes...');
  
  consolidationService.startConsolidationCron();
  
  // 2 dakika bekle
  await new Promise(resolve => setTimeout(resolve, 120000));
  
  console.log('Stopping cron job...');
  consolidationService.stopConsolidationCron();
  
  console.log('✅ Consolidation service test completed!');
}

// Test'i çalıştır
testConsolidationService().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 