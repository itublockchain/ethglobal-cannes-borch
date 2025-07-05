import { ethers } from 'ethers';
import { CardInfo } from '../types';
import { SAPPHIRE_TESTNET_RPC, CONTRACT_ADDRESS, PRIVATE_KEY, EVENT_CONFIG } from '../config';
import { GROUP_MANAGER_ABI } from '../contracts/abi';
import { generateRandomCard } from '../utils/cardGenerator';

export class GroupEventListener {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Wallet;
  private contractWithSigner: ethers.Contract;
  private isListening: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastProcessedBlock: number = 0;
  private reconnectAttempts: number = 0;
  private processedTxHashes: Set<string> = new Set();

  constructor() {
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required!');
    }

    this.provider = new ethers.JsonRpcProvider(SAPPHIRE_TESTNET_RPC);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, GROUP_MANAGER_ABI, this.provider);
    this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, GROUP_MANAGER_ABI, this.signer);
  }

  // Function to update card information in contract
  private async updateCardInfo(groupId: bigint, cardInfo: CardInfo): Promise<void> {
    try {
      console.log(`💳 Updating card information for group ${groupId}...`);
      console.log(`📊 Card No: ${cardInfo.cardNo}`);
      console.log(`🔒 CVV: ${cardInfo.cvv}`);
      console.log(`📅 Expiry Date: ${cardInfo.expireDate}`);

      // Gas estimate
      const gasEstimate = await this.contractWithSigner.updateCardInfo.estimateGas(groupId, cardInfo);
      console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);

      // Send transaction
      const tx = await this.contractWithSigner.updateCardInfo(groupId, cardInfo, {
        gasLimit: gasEstimate * 120n / 100n // 20% extra gas
      });

      console.log(`📤 Transaction sent: ${tx.hash}`);
      console.log(`⏳ Waiting for transaction confirmation...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        console.log(`✅ Card information updated successfully!`);
        console.log(`📦 Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
      } else {
        console.log(`❌ Transaction failed!`);
      }

    } catch (error) {
      console.error('❌ Card information update error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          console.error('💰 Insufficient funds! Do you have enough gas tokens in your wallet?');
        } else if (error.message.includes('Sadece ROFL guncelleyebilir')) {
          console.error('🔒 Authorization error! This wallet is not the ROFL address.');
        }
      }
    }
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('⚠️  Event listener is already running...');
      return;
    }

    try {
      console.log('🚀 Starting Sapphire Test Network Event Listener...');
      console.log(`📍 Contract Address: ${CONTRACT_ADDRESS}`);
      console.log(`🌐 RPC URL: ${SAPPHIRE_TESTNET_RPC}`);
      console.log(`👤 Signer Address: ${this.signer.address}`);
      console.log(`⏰ Polling interval: ${EVENT_CONFIG.POLL_INTERVAL_MS / 1000} seconds`);

      // Check network connection
      const network = await this.provider.getNetwork();
      console.log(`🔗 Connected network: ${network.name} (Chain ID: ${network.chainId})`);

      // Check wallet balance
      const balance = await this.provider.getBalance(this.signer.address);
      console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} TEST`);

      // Check if contract exists
      const contractCode = await this.provider.getCode(CONTRACT_ADDRESS);
      if (contractCode === '0x') {
        console.log('⚠️  WARNING: Contract address is empty! Is the contract deployed on the correct network?');
      } else {
        console.log('✅ Contract code found');
      }

      // Get latest block number
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`📦 Latest block number: ${blockNumber}`);
      
      // Save last block on first start
      if (this.lastProcessedBlock === 0) {
        this.lastProcessedBlock = blockNumber;
        console.log(`📌 Events will be tracked from block ${blockNumber}`);
      }

      this.isListening = true;
      this.reconnectAttempts = 0;

      // Use only polling (no event listener)
      this.startPolling();

      console.log('👂 Started listening for GroupCreated events with polling...');
      console.log('💡 Card information will be automatically updated when a new group is created!');
      console.log('🔧 Debug: Share the transaction hash after creating a group, I can check it manually!\n');

    } catch (error) {
      console.error('❌ Could not start event listener:', error);
      await this.handleReconnection();
    }
  }

  private startPolling(): void {
    console.log(`🔄 Polling started (${EVENT_CONFIG.POLL_INTERVAL_MS / 1000}s interval)`);
    
    this.pollInterval = setInterval(async () => {
      if (!this.isListening) return;
      
      try {
        await this.pollForEvents();
      } catch (error) {
        console.error('❌ Polling error:', error);
        // Try to reconnect in case of polling error
        if (this.reconnectAttempts < EVENT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          console.log('🔄 Reconnecting due to polling error...');
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

      // Process in 1000 block chunks to avoid querying too many blocks at once
      let fromBlock = this.lastProcessedBlock + 1;
      let toBlock = Math.min(fromBlock + EVENT_CONFIG.MAX_BLOCK_RANGE - 1, currentBlock);

      while (fromBlock <= currentBlock) {
        
        // Get events from last processed block to current block
        const events = await this.contract.queryFilter(
          this.contract.filters.GroupCreated(),
          fromBlock,
          toBlock
        );

        for (const event of events) {
          // Check EventLog type and duplicate control
          if ('args' in event && event.args && event.transactionHash) {
            // Duplicate event control
            if (!this.processedTxHashes.has(event.transactionHash)) {
              this.processedTxHashes.add(event.transactionHash);
              await this.handleGroupCreated(
                event.args.groupId,
                event.args.creator,
                event.args.members,
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
      console.error('❌ Event polling error:', error);
      throw error;
    }
  }

  private async handleGroupCreated(groupId: bigint, creator: string, members: string[], event: any): Promise<void> {
    // Log group creation event
    this.logGroupCreated(groupId, creator, members, event);

    // Generate random card info and update
    const cardInfo = generateRandomCard();
    await this.updateCardInfo(groupId, cardInfo);
  }

  private logGroupCreated(groupId: bigint, creator: string, members: string[], event: any): void {
    console.log('\n🎉 NEW GROUP CREATED!');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Creator: ${creator}`);
    console.log(`🆔 Group ID: ${groupId.toString()}`);
    console.log(`👥 Members (${members.length}): ${members.join(', ')}`);
    console.log(`📋 Transaction Hash: ${event.transactionHash}`);
    console.log(`📦 Block Number: ${event.blockNumber}`);
    console.log(`⏰ Detection Time: ${new Date().toLocaleString('en-US')}`);
    console.log('═══════════════════════════════════════');
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= EVENT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ Maximum reconnection attempts exceeded');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${EVENT_CONFIG.MAX_RECONNECT_ATTEMPTS}...`);

    // Clear existing connections
    this.isListening = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    // Recreate provider
    try {
      await this.provider.destroy();
    } catch (error) {
      console.error('⚠️  Error while cleaning old provider:', error);
    }
    
    this.provider = new ethers.JsonRpcProvider(SAPPHIRE_TESTNET_RPC);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, GROUP_MANAGER_ABI, this.provider);
    this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, GROUP_MANAGER_ABI, this.signer);

    // Increase waiting time
    const delay = EVENT_CONFIG.RECONNECT_DELAY * this.reconnectAttempts;
    console.log(`⏳ Waiting ${delay/1000} seconds...`);
    
    setTimeout(async () => {
      await this.startListening();
    }, delay);
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping event listener...');
    this.isListening = false;
    
    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    // Clean up provider
    try {
      await this.provider.destroy();
    } catch (error) {
      console.error('⚠️  Error while cleaning provider:', error);
    }
    
    console.log('✅ Event listener stopped');
  }
} 