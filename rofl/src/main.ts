import { MultiNetworkEventListener } from './services/MultiNetworkEventListener';
import { UsdcConsolidationService } from './services/UsdcConsolidationService';

// Application startup
async function main(): Promise<void> {
  const multiEventListener = new MultiNetworkEventListener();
  const usdcConsolidationService = new UsdcConsolidationService();
  
  // Signal handlers for graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔄 Application shutting down...');
    usdcConsolidationService.stopConsolidationCron();
    await multiEventListener.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🔄 Application terminating...');
    usdcConsolidationService.stopConsolidationCron();
    await multiEventListener.stop();
    process.exit(0);
  });

  // Sistem durumunu göster
  console.log('🚀 Starting Borch ROFL Services...');
  console.log('=====================================');
  
  // Event listener durumu
  multiEventListener.getStatus();
  
  // USDC consolidation servis durumu
  const consolidationStatus = usdcConsolidationService.getStatus();
  console.log('\n💰 USDC Consolidation Service:');
  console.log(`   🎯 Target Network: ${consolidationStatus.targetNetwork}`);
  console.log(`   📡 Source Networks: ${consolidationStatus.sourceNetworks.join(', ')}`);
  console.log(`   🕐 Cron Status: ${consolidationStatus.cronActive ? 'Active' : 'Inactive'}`);
  
  // USDC consolidation cron job'u başlat
  usdcConsolidationService.startConsolidationCron();
  
  // Tüm ağları dinlemeye başla
  await multiEventListener.startListening();
}

// Run application
main().catch((error) => {
  console.error('❌ Application error:', error);
  process.exit(1);
}); 