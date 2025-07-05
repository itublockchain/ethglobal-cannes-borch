import axios from "axios";
import { ethers } from "ethers";
import dotenv from 'dotenv';
import { NETWORK_CONFIGS } from '../config/index';

dotenv.config();

export class CctpService {
    private getChainConfigById(chainId: number) {
        // NETWORK_CONFIGS'teki tüm config'leri kontrol et ve chainId'si eşleşeni bul
        for (const [key, config] of Object.entries(NETWORK_CONFIGS)) {
            if (config.chainId === chainId) {
                return config;
            }
        }
        
        const supportedChainIds = Object.values(NETWORK_CONFIGS).map(config => config.chainId);
        throw new Error(`Unsupported chain ID: ${chainId}. Supported chain IDs: ${supportedChainIds.join(', ')}`);
    }

    private getChainConfigByName(chainName: string) {
        const normalizedName = chainName.toLowerCase();
        
        // NETWORK_CONFIGS'teki tüm config'leri kontrol et ve ismi eşleşeni bul
        for (const [key, config] of Object.entries(NETWORK_CONFIGS)) {
            if (key.toLowerCase() === normalizedName || config.name.toLowerCase() === normalizedName) {
                return config;
            }
        }
        
        const supportedChains = Object.keys(NETWORK_CONFIGS);
        throw new Error(`Unsupported chain: ${chainName}. Supported chains: ${supportedChains.join(', ')}`);
    }

    private getChainConfig(chainIdOrName: number | string) {
        if (typeof chainIdOrName === 'number') {
            return this.getChainConfigById(chainIdOrName);
        } else {
            return this.getChainConfigByName(chainIdOrName);
        }
    }

    private getWallet(chainIdOrName: number | string): ethers.Wallet {
        const config = this.getChainConfig(chainIdOrName);
        const provider = new ethers.JsonRpcProvider(config.rpc);
        return new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    }

    getMessageTransmitter(chainIdOrName: number | string): string {
        const config = this.getChainConfig(chainIdOrName);
        const messageTransmitter = (config.contracts as any).messageTransmitter;
        if (!messageTransmitter) {
            throw new Error(`MessageTransmitter not configured for chain: ${chainIdOrName}`);
        }
        return messageTransmitter;
    }

    getUSDC(chainIdOrName: number | string): string {
        const config = this.getChainConfig(chainIdOrName);
        const usdc = (config.contracts as any).usdc;
        if (!usdc) {
            throw new Error(`USDC not configured for chain: ${chainIdOrName}`);
        }
        return usdc;
    }

    getTokenMessenger(chainIdOrName: number | string): string {
        const config = this.getChainConfig(chainIdOrName);
        const tokenMessenger = (config.contracts as any).tokenMessenger;
        if (!tokenMessenger) {
            throw new Error(`TokenMessenger not configured for chain: ${chainIdOrName}`);
        }
        return tokenMessenger;
    }

    getDomain(chainIdOrName: number | string): number {
        const config = this.getChainConfig(chainIdOrName);
        const domain = (config as any).domain;
        if (domain === undefined) {
            throw new Error(`Domain not configured for chain: ${chainIdOrName}`);
        }
        return domain;
    }

    getSupportedChains(): string[] {
        return Object.keys(NETWORK_CONFIGS).filter(chain => {
            const config = NETWORK_CONFIGS[chain as keyof typeof NETWORK_CONFIGS];
            const contracts = config.contracts as any;
            return contracts.usdc && contracts.tokenMessenger && contracts.messageTransmitter;
        });
    }

    getSupportedChainIds(): number[] {
        return Object.values(NETWORK_CONFIGS).map(config => config.chainId);
    }

    getChainIdByName(chainName: string): number {
        const config = this.getChainConfigByName(chainName);
        return config.chainId;
    }

    getChainNameById(chainId: number): string {
        const config = this.getChainConfigById(chainId);
        return config.name;
    }
    
    // Transfer Parameters
    private DESTINATION_ADDRESS = "0x5e3aCEe942a432e114F01DCcCD06c904a859eDB1" as `0x${string}`; // Address to receive minted tokens on destination chain

    // Bytes32 Formatted Parameters - Fixed format
    private get DESTINATION_ADDRESS_BYTES32(): string {
        // Remove 0x prefix, pad to 64 chars (32 bytes), add 0x prefix
        const addressWithoutPrefix = this.DESTINATION_ADDRESS.slice(2).toLowerCase();
        return `0x${'0'.repeat(24)}${addressWithoutPrefix}`;
    }
    
    private DESTINATION_CALLER_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Empty bytes32 allows any address to call MessageTransmitterV2.receiveMessage()

    // ABI definitions
    private readonly USDC_ABI = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function balanceOf(address account) public view returns (uint256)",
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function transfer(address to, uint256 amount) public returns (bool)",
        "function decimals() public view returns (uint8)"
    ];

    private readonly TOKEN_MESSENGER_ABI = [
        "function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold) external"
    ];

    private readonly MESSAGE_TRANSMITTER_ABI = [
        "function receiveMessage(bytes message, bytes attestation) external"
    ];

    async approveUSDC(chainIdOrName: number | string, amount: bigint = BigInt('1000000000000')): Promise<string> {
        const wallet = this.getWallet(chainIdOrName);
        const usdcContract = new ethers.Contract(this.getUSDC(chainIdOrName), this.USDC_ABI, wallet);
        
        console.log(`Approving USDC transfer on ${chainIdOrName}...`);
        
        // Check current allowance first
        const currentAllowance = await usdcContract.allowance(wallet.address, this.getTokenMessenger(chainIdOrName));
        console.log(`Current allowance: ${currentAllowance.toString()}`);
        
        if (currentAllowance >= amount) {
            console.log(`Sufficient allowance already exists: ${currentAllowance.toString()}`);
            return 'no-tx-needed';
        }
        
        const tx = await usdcContract.approve(this.getTokenMessenger(chainIdOrName), amount);
        await tx.wait();
        
        console.log(`USDC Approval Tx: ${tx.hash}`);
        return tx.hash;
    }

    async burnUSDC(amount: number, sourceChainId: number | string, destinationChainId: number | string = 'baseSepolia'): Promise<string> {
        const wallet = this.getWallet(sourceChainId);
        const tokenMessengerContract = new ethers.Contract(
            this.getTokenMessenger(sourceChainId), 
            this.TOKEN_MESSENGER_ABI, 
            wallet
        );
        
        // USDC has 6 decimals, so convert amount properly
        const amountInWei = BigInt(amount * 1000000); // Convert to USDC units (6 decimals)
        
        console.log(`Burning USDC on ${sourceChainId}...`);
        console.log(`Amount: ${amount} USDC (${amountInWei.toString()} wei)`);
        
        // Check USDC balance first
        const usdcContract = new ethers.Contract(this.getUSDC(sourceChainId), this.USDC_ABI, wallet);
        const balance = await usdcContract.balanceOf(wallet.address);
        console.log(`USDC Balance: ${balance.toString()}`);
        
        if (balance < amountInWei) {
            throw new Error(`Insufficient USDC balance. Required: ${amountInWei.toString()}, Available: ${balance.toString()}`);
        }
        
        // Check allowance
        const allowance = await usdcContract.allowance(wallet.address, this.getTokenMessenger(sourceChainId));
        console.log(`Current allowance: ${allowance.toString()}`);
        
        if (allowance < amountInWei) {
            throw new Error(`Insufficient allowance. Required: ${amountInWei.toString()}, Available: ${allowance.toString()}`);
        }
        
        // Prepare transaction parameters
        const destinationDomain = this.getDomain(destinationChainId);
        const mintRecipient = this.DESTINATION_ADDRESS_BYTES32;
        const burnToken = this.getUSDC(sourceChainId);
        const destinationCaller = this.DESTINATION_CALLER_BYTES32;
        const maxFee = BigInt('5000'); // 0.005 USDC fee for fast transfer
        const minFinalityThreshold = 1000; // Fast Transfer (1000 or less)
        
        console.log(`Transaction parameters:`);
        console.log(`- Amount: ${amountInWei.toString()}`);
        console.log(`- Destination Domain: ${destinationDomain}`);
        console.log(`- Mint Recipient: ${mintRecipient}`);
        console.log(`- Burn Token: ${burnToken}`);
        console.log(`- Max Fee: ${maxFee.toString()}`);
        console.log(`- Min Finality Threshold: ${minFinalityThreshold}`);
        
        try {
            // Test transaction first with callStatic
            console.log('Testing transaction with callStatic...');
            await tokenMessengerContract.depositForBurn.staticCall(
                amountInWei,
                destinationDomain,
                mintRecipient,
                burnToken,
                destinationCaller,
                maxFee,
                minFinalityThreshold
            );
            console.log('✅ Transaction test passed');
            
            // Now execute the actual transaction
            const tx = await tokenMessengerContract.depositForBurn(
                amountInWei,
                destinationDomain,
                mintRecipient,
                burnToken,
                destinationCaller,
                maxFee,
                minFinalityThreshold
            );
            await tx.wait();
            
            console.log(`Burn Tx: ${tx.hash}`);
            return tx.hash;
        } catch (error: any) {
            console.error('Burn transaction failed:', error.message);
            
            // More detailed error logging
            if (error.code === 'CALL_EXCEPTION') {
                console.error('Call exception details:', {
                    action: error.action,
                    data: error.data,
                    reason: error.reason,
                    transaction: error.transaction
                });
                
                throw new Error(`CCTP Burn failed: ${error.shortMessage || error.message}. Check if the destination domain is supported and parameters are correct.`);
            }
            throw error;
        }
    }

    async retrieveAttestation(transactionHash: string, sourceChainId: number | string): Promise<any> {
        console.log('Retrieving attestation...');
        const url = `https://iris-api-sandbox.circle.com/v2/messages/${this.getDomain(sourceChainId)}?transactionHash=${transactionHash}`;
        
        while (true) {
            try {
                const response = await axios.get(url);
                console.log(response.data);
                
                if (response.status === 404) {
                    console.log('Waiting for attestation...');
                }
                
                if (response.data?.messages?.[0]?.status === 'complete') {
                    console.log('Attestation retrieved successfully!');
                    return response.data.messages[0];
                }
                
                console.log('Waiting for attestation...');
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } catch (error: any) {
                console.error('Error fetching attestation:', error.message);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }

    async mintUSDC(attestation: any, chainIdOrName: number | string): Promise<string> {
        const wallet = this.getWallet(chainIdOrName);
        const messageTransmitterContract = new ethers.Contract(
            this.getMessageTransmitter(chainIdOrName),
            this.MESSAGE_TRANSMITTER_ABI,
            wallet
        );
        
        console.log(`Minting USDC on ${chainIdOrName}...`);
        
        const tx = await messageTransmitterContract.receiveMessage(
            attestation.message,
            attestation.attestation
        );
        await tx.wait();
        
        console.log(`Mint Tx: ${tx.hash}`);
        return tx.hash;
    }

    async transferToBase(amount: number, sourceChainId: number | string): Promise<string> {
        console.log(`Starting transfer from ${sourceChainId} to base...`);
        
        try {
            // Convert amount to USDC units (6 decimals)
            const amountInWei = BigInt(amount * 1000000);
            
            // 1. Approve USDC on source chain
            await this.approveUSDC(sourceChainId, amountInWei);
            
            // 2. Burn USDC on source chain (destination = baseSepolia)
            const burnTx = await this.burnUSDC(amount, sourceChainId, 'baseSepolia');
            
            // 3. Get attestation from source chain
            const attestation = await this.retrieveAttestation(burnTx, sourceChainId);
            
            // 4. Mint USDC on baseSepolia chain
            const mintTx = await this.mintUSDC(attestation, 'baseSepolia');
            
            console.log(`Transfer completed! Mint Tx: ${mintTx}`);
            return mintTx;
        } catch (error: any) {
            console.error('Transfer to base failed:', error.message);
            throw error;
        }
    }

    async crossChainTransfer(amount: number, sourceChainId: number | string, destinationChainId: number | string): Promise<string> {
        console.log(`Starting cross-chain transfer: ${sourceChainId} -> ${destinationChainId}`);
        
        try {
            // Convert amount to USDC units (6 decimals)
            const amountInWei = BigInt(amount * 1000000);
            
            // 1. Approve USDC on source chain
            await this.approveUSDC(sourceChainId, amountInWei);
            
            // 2. Burn USDC on source chain
            const burnTx = await this.burnUSDC(amount, sourceChainId, destinationChainId);
            
            // 3. Get attestation from source chain
            const attestation = await this.retrieveAttestation(burnTx, sourceChainId);
            
            // 4. Mint USDC on destination chain
            const mintTx = await this.mintUSDC(attestation, destinationChainId);
            
            console.log(`Cross-chain transfer completed! Mint Tx: ${mintTx}`);
            return mintTx;
        } catch (error: any) {
            console.error('Cross-chain transfer failed:', error.message);
            throw error;
        }
    }
}