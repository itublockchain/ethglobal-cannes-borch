import { MultiNetworkEventListener } from './services/MultiNetworkEventListener';

// Application startup
async function main(): Promise<void> {
  const multiEventListener = new MultiNetworkEventListener();
  
  // Signal handlers for graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔄 Application shutting down...');
    await multiEventListener.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🔄 Application terminating...');
    await multiEventListener.stop();
    process.exit(0);
  });

  // Sistem durumunu göster
  multiEventListener.getStatus();
  
  // Tüm ağları dinlemeye başla
  await multiEventListener.startListening();
}

// Run application
main().catch((error) => {
  console.error('❌ Application error:', error);
  process.exit(1);
}); 