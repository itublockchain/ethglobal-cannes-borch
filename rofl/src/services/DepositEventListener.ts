import { ethers } from 'ethers';
import { DEPOSIT_CONTRACT_ABI, ERC20_ABI } from '../contracts/abi';
import { PRIVATE_KEY, EVENT_CONFIG, NETWORK_CONFIGS } from '../config';
import { RainAPIService } from './RainAPIService';
import { CctpService } from './CctpService';
import dotenv from 'dotenv';

dotenv.config();

export interface NetworkConfig {
  name: string;
  rpc: string;
  chainId: number;
  contracts: {
    deposit: string;
    usdc: string;
  };
}

export class DepositEventListener {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Wallet | null = null;
  private isListening: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastProcessedBlock: number = 0;
  private reconnectAttempts: number = 0;
  private processedTxHashes: Set<string> = new Set();
  private networkConfig: NetworkConfig;
  private rainAPIService: RainAPIService;
  private cctpService: CctpService;


  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig;
    // Create provider with chain ID to avoid ENS errors on testnets
    this.provider = new ethers.JsonRpcProvider(networkConfig.rpc, networkConfig.chainId);
    this.contract = new ethers.Contract(
      networkConfig.contracts.deposit,
      DEPOSIT_CONTRACT_ABI,
      this.provider
    );

    if (PRIVATE_KEY) {
      this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
    }

    // Initialize Rain API Service
    this.rainAPIService = new RainAPIService();
    this.cctpService = new CctpService();
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log(`⚠️  ${this.networkConfig.name} - Event listener is already running...`);
      return;
    }

    try {
      console.log(`🚀 Starting ${this.networkConfig.name} Event Listener...`);
      console.log(`📍 Contract Address: ${this.networkConfig.contracts.deposit}`);
      console.log(`🌐 RPC URL: ${this.networkConfig.rpc}`);
      console.log(`⏰ Polling interval: ${EVENT_CONFIG.POLL_INTERVAL_MS / 1000} seconds`);

      // Check network connection
      const network = await this.provider.getNetwork();
      console.log(`🔗 ${this.networkConfig.name} - Connected network: ${network.name} (Chain ID: ${network.chainId})`);

      if (this.signer) {
        const balance = await this.provider.getBalance(this.signer.address);
        console.log(`💰 ${this.networkConfig.name} - Wallet balance: ${ethers.formatEther(balance)} ETH`);
      }

      // Check if contract exists
      const contractCode = await this.provider.getCode(this.networkConfig.contracts.deposit);
      if (contractCode === '0x') {
        console.log(`⚠️  ${this.networkConfig.name} - WARNING: Contract address is empty! Is the contract deployed?`);
      } else {
        console.log(`✅ ${this.networkConfig.name} - Contract code found`);
      }

      // Get latest block number
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`📦 ${this.networkConfig.name} - Latest block number: ${blockNumber}`);

      // Save last block on first start
      if (this.lastProcessedBlock === 0) {
        this.lastProcessedBlock = blockNumber;
        console.log(`📌 ${this.networkConfig.name} - Events will be tracked from block ${blockNumber}`);
      }

      this.isListening = true;
      this.reconnectAttempts = 0;

      // Start polling
      this.startPolling();

      console.log(`👂 ${this.networkConfig.name} - Started listening for Deposited events with polling...`);
      console.log(`🏦 ${this.networkConfig.name} - Listening for USDC deposits...\n`);

    } catch (error) {
      console.error(`❌ ${this.networkConfig.name} - Could not start event listener:`, error);
      await this.handleReconnection();
    }
  }

  private startPolling(): void {
    console.log(`🔄 ${this.networkConfig.name} - Polling started (${EVENT_CONFIG.POLL_INTERVAL_MS / 1000}s interval)`);

    this.pollInterval = setInterval(async () => {
      if (!this.isListening) return;

      try {
        await this.pollForEvents();
      } catch (error) {
        console.error(`❌ ${this.networkConfig.name} - Polling error:`, error);
        // Try to reconnect in case of polling error
        if (this.reconnectAttempts < EVENT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          console.log(`🔄 ${this.networkConfig.name} - Reconnecting due to polling error...`);
          await this.handleReconnection();
        }
      }
    }, EVENT_CONFIG.POLL_INTERVAL_MS);
  }

  private async pollForEvents(): Promise<void> {
    try {
      const currentBlock = await this.provider.getBlockNumber();

      if (currentBlock <= this.lastProcessedBlock) {
        return;
      }

      // Process in chunks to avoid querying too many blocks at once
      let fromBlock = this.lastProcessedBlock + 1;
      let toBlock = Math.min(fromBlock + EVENT_CONFIG.MAX_BLOCK_RANGE - 1, currentBlock);

      while (fromBlock <= currentBlock) {
        // Get events from last processed block to current block
        const events = await this.contract.queryFilter(
          this.contract.filters.Deposited(),
          fromBlock,
          toBlock
        );

        for (const event of events) {
          // Check EventLog type and duplicate control
          if ('args' in event && event.args && event.transactionHash) {
            // Duplicate event control
            if (!this.processedTxHashes.has(event.transactionHash)) {
              this.processedTxHashes.add(event.transactionHash);
              await this.handleDeposited(
                event.args.sender,
                event.args.amount,
                event.args.groupId,
                event
              );
            }
          }
        }

        // Move to next block range
        fromBlock = toBlock + 1;
        toBlock = Math.min(fromBlock + EVENT_CONFIG.MAX_BLOCK_RANGE - 1, currentBlock);
      }

      this.lastProcessedBlock = currentBlock;

      // Clear old hashes to avoid keeping too many tx hashes in memory
      if (this.processedTxHashes.size > EVENT_CONFIG.MAX_PROCESSED_TX_HASHES) {
        this.processedTxHashes.clear();
      }

    } catch (error) {
      console.error(`❌ ${this.networkConfig.name} - Event polling error:`, error);
      throw error;
    }
  }

  private async handleDeposited(sender: string, amount: bigint, groupId: bigint, event: any): Promise<void> {
    try {
      console.log(`\n💰 ${this.networkConfig.name} - USDC Deposit Detected!`);
      console.log(`==============================================`);
      console.log(`👤 Sender: ${sender}`);
      console.log(`💵 Amount: ${ethers.formatUnits(amount, 6)} USDC`);
      console.log(`🏷️ Group ID: ${groupId.toString()}`);
      console.log(`📦 Block: ${event.blockNumber}`);
      console.log(`🔗 Transaction: ${event.transactionHash}`);
      console.log(`⛽ Gas Used: ${event.gasUsed ? event.gasUsed.toString() : 'N/A'}`);
      console.log(`⏰ Block Time: ${new Date().toLocaleString()}`);
      console.log(`🌐 Network: ${this.networkConfig.name}`);
      console.log(`📍 Contract: ${this.networkConfig.contracts.deposit}`);
      console.log(`==============================================\n`);

      // Convert amount to USD (USDC has 6 decimals)
      const depositAmountUSD = parseFloat(ethers.formatUnits(amount, 6));
      
      // Update Rain.xyz card limit
      try {
        console.log(`🏦 Updating Rain.xyz card limit for deposit...`);
        await this.rainAPIService.increaseCardLimitByDeposit(groupId.toString(), depositAmountUSD);
        console.log(`✅ Rain.xyz card limit updated successfully for group ${groupId}!`);
      } catch (rainError) {
        console.error(`❌ Rain.xyz card limit update failed:`, rainError);
        // Don't throw error here - we want to continue processing deposits even if Rain API fails
      }

      // CCTP V2
      if (this.networkConfig.chainId !== 84532) {
        await this.cctpService.crossChainTransfer(depositAmountUSD, this.networkConfig.name, 'baseSepolia');
      }

      // Send to rain wallet
      const rainAddress = '0x5affab2420a56d2A2BeBa3E1E52501d932B09D54';
      console.log(`💸 Transferring USDC to Rain wallet...`);
      console.log(`🎯 Target address: ${rainAddress}`);
      console.log(`💰 Transfer amount: ${ethers.formatUnits(amount, 6)} USDC`);
      
      // Base Sepolia için ayrı provider ve signer oluştur
      const baseSepoliaProvider = new ethers.JsonRpcProvider(
        NETWORK_CONFIGS.baseSepolia.rpc,
        NETWORK_CONFIGS.baseSepolia.chainId
      );
      const baseSepoliaSigner = new ethers.Wallet(PRIVATE_KEY, baseSepoliaProvider);
      
      console.log(`🔗 Base Sepolia connection established`);
      console.log(`👛 Signer address: ${baseSepoliaSigner.address}`);
      
      // USDC kontrat örneğini Base Sepolia'da oluştur
      const usdcContract = new ethers.Contract(
        NETWORK_CONFIGS.baseSepolia.contracts.usdc,
        ERC20_ABI,
        baseSepoliaSigner
      );

      // Mevcut USDC bakiyesini kontrol et
      const currentBalance = await usdcContract.balanceOf(baseSepoliaSigner.address);
      console.log(`💳 Current USDC balance on Base Sepolia: ${ethers.formatUnits(currentBalance, 6)} USDC`);

      if (currentBalance < amount) {
        console.log(`⚠️ Insufficient USDC balance! Required: ${ethers.formatUnits(amount, 6)} USDC, Current: ${ethers.formatUnits(currentBalance, 6)} USDC`);
        return;
      }

      // ETH bakiyesi kontrol et (gas fee için)
      const ethBalance = await baseSepoliaProvider.getBalance(baseSepoliaSigner.address);
      console.log(`💰 ETH balance on Base Sepolia: ${ethers.formatEther(ethBalance)} ETH`);

      // USDC transferi gerçekleştir
      console.log(`🚀 Sending USDC transfer to Base Sepolia...`);
      const transferTx = await usdcContract.transfer(rainAddress, amount);
      
      console.log(`⏳ Waiting for transfer... TX Hash: ${transferTx.hash}`);
      const receipt = await transferTx.wait();
      
      console.log(`✅ USDC transfer successful!`);
      console.log(`📦 Block: ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`🎯 ${ethers.formatUnits(amount, 6)} USDC successfully sent to ${rainAddress} address!`);


    } catch (error) {
      console.error(`❌ ${this.networkConfig.name} - Deposit handling error:`, error);
    }
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= EVENT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.log(`❌ ${this.networkConfig.name} - Maximum reconnection attempts reached!`);
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 ${this.networkConfig.name} - Reconnection attempt ${this.reconnectAttempts}/${EVENT_CONFIG.MAX_RECONNECT_ATTEMPTS}`);

    // Stop current polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isListening = false;

    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, EVENT_CONFIG.RECONNECT_DELAY));

    // Restart
    await this.startListening();
  }

  async stop(): Promise<void> {
    if (!this.isListening) {
      console.log(`⚠️  ${this.networkConfig.name} - Event listener is not running...`);
      return;
    }

    console.log(`🛑 ${this.networkConfig.name} - Stopping event listener...`);

    this.isListening = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    console.log(`✅ ${this.networkConfig.name} - Event listener stopped successfully!`);
  }
} 