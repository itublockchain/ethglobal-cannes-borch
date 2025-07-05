import { GroupEventListener } from './services/GroupEventListener';

// Application startup
async function main(): Promise<void> {
  const listener = new GroupEventListener();
  
  // Signal handlers for graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔄 Application shutting down...');
    await listener.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🔄 Application terminating...');
    await listener.stop();
    process.exit(0);
  });

  // Start event listener
  await listener.startListening();
}

// Run application
main().catch((error) => {
  console.error('❌ Application error:', error);
  process.exit(1);
}); 