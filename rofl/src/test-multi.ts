import { MultiNetworkEventListener } from './services/MultiNetworkEventListener';

async function testMultiNetworkListener() {
  console.log('🧪 Testing Multi-Network Event Listener...');
  
  const multiEventListener = new MultiNetworkEventListener();
  
  try {
    // Sistem durumunu göster
    multiEventListener.getStatus();
    
    // Tüm ağları dinlemeye başla
    await multiEventListener.startListening();
    
    // 30 saniye bekle
    console.log('⏰ Test will run for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Durdur
    await multiEventListener.stop();
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testMultiNetworkListener().catch(console.error); 