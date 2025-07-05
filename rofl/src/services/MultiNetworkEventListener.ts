import { GroupEventListener } from './GroupEventListener';
import { DepositEventListener, NetworkConfig } from './DepositEventListener';
import { NETWORK_CONFIGS } from '../config';

export class MultiNetworkEventListener {
  private groupEventListener: GroupEventListener;
  private depositEventListeners: DepositEventListener[] = [];
  private isListening: boolean = false;

  constructor() {
    // GroupEventListener için (Sapphire Testnet)
    this.groupEventListener = new GroupEventListener();
    
    // DepositEventListener'lar için (Sepolia, Base Sepolia, Arbitrum Sepolia)
    const depositNetworks = [
      NETWORK_CONFIGS.sepolia,
      NETWORK_CONFIGS.baseSepolia,
      NETWORK_CONFIGS.arbSepolia
    ];

    for (const networkConfig of depositNetworks) {
      const listener = new DepositEventListener(networkConfig);
      this.depositEventListeners.push(listener);
    }
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('⚠️  Multi-network event listener is already running...');
      return;
    }

    try {
      console.log('🚀 Starting Multi-Network Event Listener System...');
      console.log('======================================================');
      console.log('📡 Networks to monitor:');
      console.log('  • Sapphire Testnet - GroupManager contract');
      console.log('  • Sepolia - DepositContract');
      console.log('  • Base Sepolia - DepositContract');
      console.log('  • Arbitrum Sepolia - DepositContract');
      console.log('======================================================\n');

      this.isListening = true;

      // Tüm listener'ları paralel olarak başlat
      const listenerPromises = [
        this.groupEventListener.startListening(),
        ...this.depositEventListeners.map(listener => listener.startListening())
      ];

      await Promise.all(listenerPromises);

      console.log('✅ All event listeners started successfully!');
      console.log('🎧 Now listening for events across all networks...\n');

    } catch (error) {
      console.error('❌ Error starting multi-network event listener:', error);
      this.isListening = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isListening) {
      console.log('⚠️  Multi-network event listener is not running...');
      return;
    }

    console.log('🛑 Stopping multi-network event listener...');

    this.isListening = false;

    // Tüm listener'ları paralel olarak durdur
    const stopPromises = [
      this.groupEventListener.stop(),
      ...this.depositEventListeners.map(listener => listener.stop())
    ];

    await Promise.all(stopPromises);

    console.log('✅ All event listeners stopped successfully!');
  }

  // Sistem durumunu göster
  getStatus(): void {
    console.log('\n📊 Multi-Network Event Listener Status:');
    console.log('==========================================');
    console.log(`🔄 System Status: ${this.isListening ? 'Running' : 'Stopped'}`);
    console.log(`📡 Active Networks: ${this.depositEventListeners.length + 1}`);
    console.log('  • Sapphire Testnet (GroupManager)');
    
    const networks = [
      NETWORK_CONFIGS.sepolia,
      NETWORK_CONFIGS.baseSepolia,
      NETWORK_CONFIGS.arbSepolia
    ];
    
    networks.forEach(network => {
      console.log(`  • ${network.name} (DepositContract)`);
    });
    
    console.log('==========================================\n');
  }

  // Sadece belirli bir ağı yeniden başlat
  async restartNetwork(networkName: string): Promise<void> {
    console.log(`🔄 Restarting ${networkName} event listener...`);
    
    if (networkName === 'sapphire') {
      await this.groupEventListener.stop();
      await this.groupEventListener.startListening();
    } else {
      const networkConfigs = {
        sepolia: NETWORK_CONFIGS.sepolia,
        baseSepolia: NETWORK_CONFIGS.baseSepolia,
        arbSepolia: NETWORK_CONFIGS.arbSepolia
      };
      
      const config = networkConfigs[networkName as keyof typeof networkConfigs];
      if (config) {
        // İlgili listener'ı bul ve yeniden başlat
        const listener = this.depositEventListeners.find(
          l => l['networkConfig'].name === config.name
        );
        
        if (listener) {
          await listener.stop();
          await listener.startListening();
        }
      }
    }
    
    console.log(`✅ ${networkName} event listener restarted successfully!`);
  }
} 