import { ethers } from 'ethers';
import { NETWORK_CONFIGS, PRIVATE_KEY } from './config';
import { DEPOSIT_CONTRACT_ABI, ERC20_ABI } from './contracts/abi';

interface TestNetwork {
  name: string;
  rpc: string;
  chainId: number;
  contracts: {
    deposit: string;
    usdc: string;
  };
}

class DepositTester {
  private testAmount = ethers.parseUnits('1', 6); // 1 USDC (6 decimals)
  private testGroupId = 1; // Test için varsayılan group ID
  
  async testDepositOnNetwork(network: TestNetwork): Promise<void> {
    console.log(`\n🧪 Testing deposit on ${network.name}...`);
    console.log(`===========================================`);
    
    try {
      // Setup provider and signer
      const provider = new ethers.JsonRpcProvider(network.rpc, network.chainId);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
      
      // Setup contracts
      const usdcContract = new ethers.Contract(network.contracts.usdc, ERC20_ABI, signer);
      const depositContract = new ethers.Contract(network.contracts.deposit, DEPOSIT_CONTRACT_ABI, signer);
      
      console.log(`👤 Signer Address: ${signer.address}`);
      console.log(`🌐 Network: ${network.name}`);
      console.log(`📍 USDC Contract: ${network.contracts.usdc}`);
      console.log(`📍 Deposit Contract: ${network.contracts.deposit}`);
      console.log(`💰 Test Amount: ${ethers.formatUnits(this.testAmount, 6)} USDC`);
      console.log(`🏷️ Test Group ID: ${this.testGroupId}`);
      
      // Check network connection
      const networkInfo = await provider.getNetwork();
      console.log(`🔗 Connected to Chain ID: ${networkInfo.chainId}`);
      
      // Check ETH balance for gas
      const ethBalance = await provider.getBalance(signer.address);
      console.log(`⛽ ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
      
      if (ethBalance === 0n) {
        throw new Error('No ETH balance for gas fees!');
      }
      
      // Check USDC balance
      const usdcBalance = await usdcContract.balanceOf(signer.address);
      console.log(`💵 USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
      
      if (usdcBalance < this.testAmount) {
        throw new Error(`Insufficient USDC balance! Need: ${ethers.formatUnits(this.testAmount, 6)} USDC`);
      }
      
      // Check current allowance
      const currentAllowance = await usdcContract.allowance(signer.address, network.contracts.deposit);
      console.log(`🔓 Current Allowance: ${ethers.formatUnits(currentAllowance, 6)} USDC`);
      
      // Approve if needed
      if (currentAllowance < this.testAmount) {
        console.log(`\n📝 Approving USDC spending...`);
        const approveTx = await usdcContract.approve(network.contracts.deposit, this.testAmount);
        console.log(`📤 Approve TX: ${approveTx.hash}`);
        
        const approveReceipt = await approveTx.wait();
        if (approveReceipt?.status === 1) {
          console.log(`✅ Approval successful! Block: ${approveReceipt.blockNumber}`);
          
          // Verify allowance after approval
          const newAllowance = await usdcContract.allowance(signer.address, network.contracts.deposit);
          console.log(`🔓 New Allowance: ${ethers.formatUnits(newAllowance, 6)} USDC`);
          
          if (newAllowance < this.testAmount) {
            throw new Error(`Allowance still insufficient after approval! Got: ${ethers.formatUnits(newAllowance, 6)} USDC`);
          }
        } else {
          throw new Error('Approval failed!');
        }
      } else {
        console.log(`✅ Already has sufficient allowance`);
      }
      
      // Perform deposit
      console.log(`\n💰 Performing deposit...`);
      const depositTx = await depositContract.deposit(this.testAmount, this.testGroupId);
      console.log(`📤 Deposit TX: ${depositTx.hash}`);
      
      const depositReceipt = await depositTx.wait();
      if (depositReceipt?.status === 1) {
        console.log(`✅ Deposit successful!`);
        console.log(`📦 Block: ${depositReceipt.blockNumber}`);
        console.log(`⛽ Gas Used: ${depositReceipt.gasUsed.toString()}`);
        
        // Check for Deposited event
        const depositedEvent = depositReceipt.logs.find((log: any) => {
          try {
            const decoded = depositContract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return decoded?.name === 'Deposited';
          } catch {
            return false;
          }
        });
        
        if (depositedEvent) {
          const decoded = depositContract.interface.parseLog({
            topics: depositedEvent.topics,
            data: depositedEvent.data
          });
          console.log(`🎉 Deposited Event Detected:`);
          console.log(`   👤 Sender: ${decoded?.args.sender}`);
          console.log(`   💵 Amount: ${ethers.formatUnits(decoded?.args.amount, 6)} USDC`);
          console.log(`   🏷️ Group ID: ${decoded?.args.groupId}`);
        }
      } else {
        throw new Error('Deposit failed!');
      }
      
      // Final balance check
      const finalBalance = await usdcContract.balanceOf(signer.address);
      console.log(`💵 Final USDC Balance: ${ethers.formatUnits(finalBalance, 6)} USDC`);
      
      console.log(`\n✅ ${network.name} deposit test completed successfully!`);
      
    } catch (error) {
      console.error(`❌ ${network.name} deposit test failed:`, error);
      throw error;
    }
  }
  
  async runAllTests(): Promise<void> {
    console.log(`🚀 Starting Multi-Network Deposit Tests...`);
    console.log(`==========================================`);
    
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required!');
    }
    
    const networks = [
      NETWORK_CONFIGS.sepolia,
      NETWORK_CONFIGS.baseSepolia,
      NETWORK_CONFIGS.arbSepolia
    ];
    
    console.log(`📡 Testing on ${networks.length} networks:`);
    networks.forEach(network => {
      console.log(`  • ${network.name}`);
    });
    
    const results: { network: string; success: boolean; error?: string }[] = [];
    
    // Test each network sequentially to avoid conflicts
    for (const network of networks) {
      try {
        await this.testDepositOnNetwork(network);
        results.push({ network: network.name, success: true });
        
        // Wait 2 seconds between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        results.push({ 
          network: network.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    // Summary
    console.log(`\n📊 Test Results Summary:`);
    console.log(`========================`);
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.network}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      if (!result.success && result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📈 Overall Results: ${successCount}/${results.length} networks successful`);
    
    if (successCount === results.length) {
      console.log(`🎉 All deposit tests completed successfully!`);
    } else {
      console.log(`⚠️  Some tests failed. Check the logs above for details.`);
    }
  }
}

// Ana fonksiyon
async function main() {
  const tester = new DepositTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Eğer direkt çalıştırılıyorsa
if (require.main === module) {
  main().catch(console.error);
}

export { DepositTester }; 