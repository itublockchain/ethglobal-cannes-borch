import { ethers } from 'ethers';
import axios from 'axios';
import { NETWORK_CONFIGS, CCTP_CONFIG, PRIVATE_KEY } from '../config';
import { TOKEN_MESSENGER_ABI, MESSAGE_TRANSMITTER_ABI, ERC20_ABI } from '../contracts/abi';

export interface CctpTransferResult {
  success: boolean;
  burnTxHash?: string;
  mintTxHash?: string;
  error?: string;
}

// Type guard fonksiyonları
function hasUsdcContract(config: any): config is { contracts: { usdc: string } } {
  return config?.contracts?.usdc !== undefined;
}

function hasCctpContracts(config: any): config is { 
  contracts: { 
    usdc: string; 
    tokenMessenger: string;
    messageTransmitter: string;
  };
  cctpDomain: number;
} {
  return config?.contracts?.usdc !== undefined &&
         config?.contracts?.tokenMessenger !== undefined &&
         config?.contracts?.messageTransmitter !== undefined &&
         config?.cctpDomain !== undefined;
}

export class CctpService {
  private wallet: ethers.Wallet;

  constructor() {
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    this.wallet = new ethers.Wallet(PRIVATE_KEY);
  }

  /**
   * Belirli bir ağdaki USDC bakiyesini kontrol eder
   */
  async getUsdcBalance(networkKey: string): Promise<bigint> {
    const networkConfig = NETWORK_CONFIGS[networkKey as keyof typeof NETWORK_CONFIGS];
    if (!networkConfig || !hasUsdcContract(networkConfig)) {
      throw new Error(`Network config or USDC contract not found for: ${networkKey}`);
    }

    const provider = new ethers.JsonRpcProvider(networkConfig.rpc, networkConfig.chainId);
    const walletWithProvider = this.wallet.connect(provider);
    
    const usdcContract = new ethers.Contract(
      networkConfig.contracts.usdc,
      ERC20_ABI,
      walletWithProvider
    );

    return await usdcContract.balanceOf(this.wallet.address);
  }

  /**
   * USDC'yi burn eder (kaynak ağda)
   */
  async burnUsdc(
    sourceNetworkKey: string,
    amount: bigint,
    destinationNetworkKey: string
  ): Promise<string> {
    const sourceNetwork = NETWORK_CONFIGS[sourceNetworkKey as keyof typeof NETWORK_CONFIGS];
    const destinationNetwork = NETWORK_CONFIGS[destinationNetworkKey as keyof typeof NETWORK_CONFIGS];
    
    if (!sourceNetwork || !destinationNetwork || 
        !hasCctpContracts(sourceNetwork) || !hasCctpContracts(destinationNetwork)) {
      throw new Error(`Network config or CCTP contracts not found`);
    }

    const provider = new ethers.JsonRpcProvider(sourceNetwork.rpc, sourceNetwork.chainId);
    const walletWithProvider = this.wallet.connect(provider);
    
    // Token approval (eğer gerekirse)
    const usdcContract = new ethers.Contract(
      sourceNetwork.contracts.usdc,
      ERC20_ABI,
      walletWithProvider
    );

    const allowance = await usdcContract.allowance(
      this.wallet.address,
      sourceNetwork.contracts.tokenMessenger
    );

    if (allowance < amount) {
      console.log(`📝 Approving USDC spending on ${sourceNetwork.name}...`);
      const approveTx = await usdcContract.approve(
        sourceNetwork.contracts.tokenMessenger,
        amount
      );
      await approveTx.wait();
      console.log(`✅ Approval successful: ${approveTx.hash}`);
    }

    // Burn işlemi (CCTP V2 format)
    const tokenMessengerContract = new ethers.Contract(
      sourceNetwork.contracts.tokenMessenger,
      TOKEN_MESSENGER_ABI,
      walletWithProvider
    );

    const destinationAddressBytes32 = `0x000000000000000000000000${this.wallet.address.slice(2)}`;
    const destinationCallerBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

    console.log(`🔥 Burning ${ethers.formatUnits(amount, 6)} USDC on ${sourceNetwork.name}...`);
    
    // CCTP V2 depositForBurn parameters
    const burnTx = await tokenMessengerContract.depositForBurn(
      amount,                           // amount
      destinationNetwork.cctpDomain,    // destinationDomain
      destinationAddressBytes32,        // mintRecipient
      sourceNetwork.contracts.usdc,     // burnToken
      destinationCallerBytes32,         // destinationCaller (empty = anyone can call)
      CCTP_CONFIG.MAX_FEE,             // maxFee
      CCTP_CONFIG.MIN_FINALITY_THRESHOLD // minFinalityThreshold
    );

    console.log(`📤 Burn TX: ${burnTx.hash}`);
    await burnTx.wait();
    
    return burnTx.hash;
  }

  /**
   * Attestation'ı alır
   */
  async getAttestation(transactionHash: string, sourceDomain: number): Promise<any> {
    console.log(`🔍 Retrieving attestation for ${transactionHash}...`);
    
    const url = `${CCTP_CONFIG.ATTESTATION_API_URL}/${sourceDomain}?transactionHash=${transactionHash}`;
    const startTime = Date.now();
    
    while (Date.now() - startTime < CCTP_CONFIG.ATTESTATION_TIMEOUT) {
      try {
        const response = await axios.get(url);
        
        if (response.data?.messages?.[0]?.status === 'complete') {
          console.log(`✅ Attestation retrieved successfully!`);
          return response.data.messages[0];
        }

        console.log(response.data);
        
        console.log(`⏳ Waiting for attestation... (${Math.round((Date.now() - startTime) / 1000)}s)`);
        await new Promise(resolve => setTimeout(resolve, CCTP_CONFIG.ATTESTATION_POLL_INTERVAL));
        
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log(`⏳ Attestation not ready yet...`);
        } else {
          console.error(`❌ Error fetching attestation:`, error.message);
        }
        await new Promise(resolve => setTimeout(resolve, CCTP_CONFIG.ATTESTATION_POLL_INTERVAL));
      }
    }
    
    throw new Error('Attestation timeout');
  }

  /**
   * USDC'yi mint eder (hedef ağda)
   */
  async mintUsdc(
    destinationNetworkKey: string,
    attestation: any
  ): Promise<string> {
    const destinationNetwork = NETWORK_CONFIGS[destinationNetworkKey as keyof typeof NETWORK_CONFIGS];
    
    if (!destinationNetwork || !hasCctpContracts(destinationNetwork)) {
      throw new Error(`Network config or CCTP contracts not found for: ${destinationNetworkKey}`);
    }

    const provider = new ethers.JsonRpcProvider(destinationNetwork.rpc, destinationNetwork.chainId);
    const walletWithProvider = this.wallet.connect(provider);
    
    const messageTransmitterContract = new ethers.Contract(
      destinationNetwork.contracts.messageTransmitter,
      MESSAGE_TRANSMITTER_ABI,
      walletWithProvider
    );

    console.log(`🪙 Minting USDC on ${destinationNetwork.name}...`);
    
    const mintTx = await messageTransmitterContract.receiveMessage(
      attestation.message,
      attestation.attestation
    );

    console.log(`📤 Mint TX: ${mintTx.hash}`);
    await mintTx.wait();
    
    return mintTx.hash;
  }

  /**
   * Tam CCTP transfer işlemi (burn + mint)
   */
  async transferUsdc(
    sourceNetworkKey: string,
    destinationNetworkKey: string,
    amount: bigint
  ): Promise<CctpTransferResult> {
    try {
      console.log(`🚀 Starting CCTP transfer from ${sourceNetworkKey} to ${destinationNetworkKey}`);
      console.log(`💰 Amount: ${ethers.formatUnits(amount, 6)} USDC`);
      
      // 1. Burn USDC on source network
      const burnTxHash = await this.burnUsdc(sourceNetworkKey, amount, destinationNetworkKey);
      
      // 2. Get attestation
      const sourceNetwork = NETWORK_CONFIGS[sourceNetworkKey as keyof typeof NETWORK_CONFIGS];
      if (!hasCctpContracts(sourceNetwork)) {
        throw new Error(`Source network does not support CCTP: ${sourceNetworkKey}`);
      }
      
      const attestation = await this.getAttestation(burnTxHash, sourceNetwork.cctpDomain);
      
      // 3. Mint USDC on destination network
      const mintTxHash = await this.mintUsdc(destinationNetworkKey, attestation);
      
      console.log(`🎉 CCTP transfer completed successfully!`);
      console.log(`   Burn TX: ${burnTxHash}`);
      console.log(`   Mint TX: ${mintTxHash}`);
      
      return {
        success: true,
        burnTxHash,
        mintTxHash
      };
      
    } catch (error: any) {
      console.error(`❌ CCTP transfer failed:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 