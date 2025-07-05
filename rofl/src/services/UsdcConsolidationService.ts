import { ethers } from 'ethers';
import * as cron from 'node-cron';
import { NETWORK_CONFIGS, CCTP_CONFIG } from '../config';
import { CctpService } from './CctpService';

export class UsdcConsolidationService {
  private cctpService: CctpService;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  constructor() {
    this.cctpService = new CctpService();
  }

  /**
   * CCTP destekleyen ağları filtreler (Sapphire hariç)
   */
  private getCctpSupportedNetworks(): string[] {
    return Object.keys(NETWORK_CONFIGS).filter(key => 
      key !== 'sapphire' && key !== CCTP_CONFIG.TARGET_NETWORK
    );
  }

  /**
   * Belirli bir ağdaki USDC bakiyesini kontrol eder ve minimum miktardan fazlaysa transfer eder
   */
  private async processNetwork(networkKey: string): Promise<void> {
    try {
      console.log(`🔍 Checking USDC balance on ${networkKey}...`);
      
      const balance = await this.cctpService.getUsdcBalance(networkKey);
      const balanceFormatted = ethers.formatUnits(balance, 6);
      
      console.log(`💰 ${networkKey} USDC Balance: ${balanceFormatted} USDC`);
      
      // Minimum transfer miktarını kontrol et
      const minTransferAmount = BigInt(CCTP_CONFIG.MIN_TRANSFER_AMOUNT);
      
      if (balance < minTransferAmount) {
        console.log(`⚠️  ${networkKey}: Balance too low (${balanceFormatted} USDC < ${ethers.formatUnits(minTransferAmount, 6)} USDC)`);
        return;
      }
      
      // Transfer işlemi
      console.log(`🚀 Transferring ${balanceFormatted} USDC from ${networkKey} to ${CCTP_CONFIG.TARGET_NETWORK}...`);
      
      const result = await this.cctpService.transferUsdc(
        networkKey,
        CCTP_CONFIG.TARGET_NETWORK,
        balance
      );
      
      if (result.success) {
        console.log(`✅ ${networkKey} → ${CCTP_CONFIG.TARGET_NETWORK} transfer completed`);
        console.log(`   Burn TX: ${result.burnTxHash}`);
        console.log(`   Mint TX: ${result.mintTxHash}`);
      } else {
        console.error(`❌ ${networkKey} transfer failed: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error(`❌ Error processing ${networkKey}:`, error.message);
    }
  }

  /**
   * Tüm ağları kontrol eder ve gerekirse USDC transferi yapar
   */
  private async consolidateUsdc(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Consolidation already running, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('\n🔄 Starting USDC consolidation process...');
      console.log('====================================');
      
      const networks = this.getCctpSupportedNetworks();
      console.log(`📡 Checking ${networks.length} networks: ${networks.join(', ')}`);
      console.log(`🎯 Target network: ${CCTP_CONFIG.TARGET_NETWORK}`);
      
      const results: Array<{network: string, success: boolean, error?: string}> = [];
      
      // Her ağı sırayla işle (paralel olmayacak şekilde)
      for (const networkKey of networks) {
        try {
          await this.processNetwork(networkKey);
          results.push({ network: networkKey, success: true });
          
          // Ağlar arası 5 saniye bekle
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (error: any) {
          results.push({ 
            network: networkKey, 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Özet rapor
      console.log('\n📊 Consolidation Summary:');
      console.log('========================');
      
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.network}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        if (!result.success && result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
      
      const successCount = results.filter(r => r.success).length;
      console.log(`\n📈 Results: ${successCount}/${results.length} networks processed successfully`);
      
    } catch (error: any) {
      console.error('❌ Consolidation process failed:', error.message);
    } finally {
      this.isRunning = false;
      console.log(`⏰ Next consolidation scheduled in 1 hour\n`);
    }
  }

  /**
   * Cron job'u başlatır (saatte bir çalışır)
   */
  public startConsolidationCron(): void {
    if (this.cronJob) {
      console.log('⚠️  Consolidation cron job already running');
      return;
    }

    // Her saat başı çalışacak cron job
    this.cronJob = cron.schedule('0 * * * *', () => {
      this.consolidateUsdc();
    }, {
      timezone: 'UTC'
    });

    this.cronJob.start();
    
    console.log('🕐 USDC Consolidation cron job started (runs every hour)');
    console.log('📅 Next run: at the top of the next hour');
    
    // İlk çalışma için 1 dakika bekle
    setTimeout(() => {
      console.log('🚀 Running initial consolidation check...');
      this.consolidateUsdc();
    }, 10000);
  }

  /**
   * Cron job'u durdurur
   */
  public stopConsolidationCron(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('⏹️  USDC Consolidation cron job stopped');
    }
  }

  /**
   * Manuel olarak consolidation çalıştırır
   */
  public async runManualConsolidation(): Promise<void> {
    console.log('🔧 Running manual USDC consolidation...');
    await this.consolidateUsdc();
  }

  /**
   * Servis durumunu döner
   */
  public getStatus(): {
    cronActive: boolean;
    isRunning: boolean;
    targetNetwork: string;
    sourceNetworks: string[];
  } {
    return {
      cronActive: this.cronJob !== null,
      isRunning: this.isRunning,
      targetNetwork: CCTP_CONFIG.TARGET_NETWORK,
      sourceNetworks: this.getCctpSupportedNetworks()
    };
  }
} 