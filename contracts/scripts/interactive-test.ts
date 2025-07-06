import { ethers } from "hardhat";
import * as readline from 'readline';

// Network configurations
const NETWORK_CONFIGS = {
  sepolia: {
    name: 'Ethereum Sepolia',
    rpc: 'https://eth-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 11155111,
    contracts: {
      deposit: '0x5e103637810e96b83205d418d060616382071e28',
      usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
  },
  baseSepolia: {
    name: 'Base Sepolia',
    rpc: 'https://base-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 84532,
    contracts: {
      deposit: '0x714247e799aa19bd75ea55dac2d1dde7641a0321',
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
    }
  },
  arbSepolia: {
    name: 'Arbitrum Sepolia',
    rpc: 'https://arb-sepolia.g.alchemy.com/v2/Ta_OkL4eYQiN8sgodiXor400o5sVWgHZ',
    chainId: 421614,
    contracts: {
      deposit: '0x071c3142147e9275acde36e5a669c8130f314c29',
      usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'
    }
  }
} as const;

// GroupManager Contract ABI (simplified for testing)
const GROUP_MANAGER_ABI = [
  "function createGroup(address[] memory _members, string memory _name)",
  "function updateCardInfo(uint256 _groupId, tuple(string cardNo, string cvv, string expireDate, uint256 limit) _card)",
  "function updateCardLimit(uint256 _groupId, uint256 _limit)",
  "function getMyGroups(address _caller) view returns (tuple(address creator, address[] members, string name, bool active, tuple(string cardNo, string cvv, string expireDate, uint256 limit) card, tuple(uint256 transactionId, uint256 totalAmount, uint256 timestamp, string description, tuple(address user, uint256 amount)[] shares, address paidBy)[] transactions, tuple(address user, uint256 amount, uint256 timestamp)[] deposits, uint256 totalDeposited, uint256 nextTransactionId)[])",
  "function createTransaction(uint256 _groupId, uint256 _amount, string memory _description, address _paidBy)",
  "function updateTransactionShares(uint256 _groupId, uint256 _transactionId, tuple(address user, uint256 amount)[] _shares)",
  "function recordDeposit(uint256 _groupId, address _user, uint256 _amount)",
  "function getGroupDeposits(uint256 _groupId, address _caller) view returns (tuple(address user, uint256 amount, uint256 timestamp)[])",
  "function getGroupTransactions(uint256 _groupId, address _caller) view returns (tuple(uint256 transactionId, uint256 totalAmount, uint256 timestamp, string description, tuple(address user, uint256 amount)[] shares, address paidBy)[])",
  "function calculateUserBalances(uint256 _groupId, address _caller) view returns (address[] users, int256[] balances)",
  "function updateRoflAddress(address _newRoflAddress)",
  "function groupCount() view returns (uint256)",
  "function roflAddress() view returns (address)",
  "function owner() view returns (address)",
  "event GroupCreated(uint256 groupId, address creator, address[] members)",
  "event TransactionCreated(uint256 groupId, uint256 transactionId, uint256 amount, string description)",
  "event DepositMade(uint256 groupId, address user, uint256 amount)"
];

// Deposit Contract ABI
const DEPOSIT_CONTRACT_ABI = [
  "function deposit(uint256 amount, uint256 groupId)",
  "function USDC() view returns (address)",
  "function RECIPIENT_ADDRESS() view returns (address)",
  "event Deposited(address indexed sender, uint256 amount, uint256 groupId)"
];

// ERC20 (USDC) Contract ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

class GroupManagerTester {
  private contract: any;
  private signer: any;
  private rl: readline.Interface;
  
  constructor(contractAddress: string, signer: any) {
    this.contract = new ethers.Contract(contractAddress, GROUP_MANAGER_ABI, signer);
    this.signer = signer;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async askForAddress(prompt: string): Promise<string> {
    while (true) {
      const address = await this.askQuestion(prompt);
      if (ethers.isAddress(address)) {
        return address;
      }
      console.log("❌ Invalid address format. Please try again.");
    }
  }

  private async askForNumber(prompt: string): Promise<number> {
    while (true) {
      const input = await this.askQuestion(prompt);
      const number = parseInt(input);
      if (!isNaN(number) && number >= 0) {
        return number;
      }
      console.log("❌ Please enter a valid number.");
    }
  }

  private async askForAddressArray(prompt: string): Promise<string[]> {
    console.log(prompt);
    console.log("Enter addresses one by one. Press Enter with empty line to finish:");
    
    const addresses: string[] = [];
    while (true) {
      const address = await this.askQuestion(`Address ${addresses.length + 1} (or Enter to finish): `);
      if (address === '') {
        break;
      }
      if (ethers.isAddress(address)) {
        addresses.push(address);
        console.log(`✅ Added: ${address}`);
      } else {
        console.log("❌ Invalid address format. Please try again.");
      }
    }
    return addresses;
  }

  private async showMenu(): Promise<void> {
    console.log("\n" + "=".repeat(50));
    console.log("🏦 GroupManager Contract Tester");
    console.log("=".repeat(50));
    console.log("1.  Create Group");
    console.log("2.  Update Card Info");
    console.log("3.  Update Card Limit");
    console.log("4.  Get My Groups");
    console.log("5.  Create Transaction (ROFL only)");
    console.log("6.  Update Transaction Shares");
    console.log("7.  Record Deposit (ROFL only)");
    console.log("8.  Get Group Deposits");
    console.log("9.  Get Group Transactions");
    console.log("10. Calculate User Balances");
    console.log("11. Update ROFL Address (Owner only)");
    console.log("12. View Contract Info");
    console.log("=".repeat(50));
    console.log("💰 DEPOSIT OPERATIONS");
    console.log("=".repeat(50));
    console.log("13. Make Deposit to Group");
    console.log("14. Check USDC Balance");
    console.log("15. Check USDC Allowance");
    console.log("16. Approve USDC for Deposit");
    console.log("0.  Exit");
    console.log("=".repeat(50));
  }

  private async createGroup(): Promise<void> {
    console.log("\n📝 Creating New Group");
    
    const name = await this.askQuestion("Group name: ");
    const members = await this.askForAddressArray("Group members:");
    
    console.log(`\n📋 Group Details:`);
    console.log(`Name: ${name}`);
    console.log(`Members: ${members.length}`);
    members.forEach((member, index) => {
      console.log(`  ${index + 1}. ${member}`);
    });
    
    const confirm = await this.askQuestion("Confirm creation? (y/n): ");
    if (confirm.toLowerCase() !== 'y') {
      console.log("❌ Group creation cancelled.");
      return;
    }

    try {
      console.log("🔄 Creating group...");
      const tx = await this.contract.createGroup(members, name);
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Group created! Gas used: ${receipt.gasUsed.toString()}`);
      
      // Find GroupCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'GroupCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        console.log(`🎉 Group ID: ${parsed.args.groupId.toString()}`);
      }
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async updateCardInfo(): Promise<void> {
    console.log("\n💳 Update Card Info");
    
    const groupId = await this.askForNumber("Group ID: ");
    const cardNo = await this.askQuestion("Card Number: ");
    const cvv = await this.askQuestion("CVV: ");
    const expireDate = await this.askQuestion("Expire Date (MM/YY): ");
    const limit = await this.askForNumber("Card Limit: ");

    try {
      console.log("🔄 Updating card info...");
      const tx = await this.contract.updateCardInfo(groupId, {
        cardNo,
        cvv,
        expireDate,
        limit
      });
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Card info updated! Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async getMyGroups(): Promise<void> {
    console.log("\n📋 Get My Groups");
    
    const caller = await this.askForAddress("Caller address: ");

    try {
      console.log("🔄 Fetching groups...");
      const groups = await this.contract.getMyGroups(caller);
      
      if (groups.length === 0) {
        console.log("📭 No groups found for this address.");
        return;
      }

      console.log(`\n📊 Found ${groups.length} group(s):`);
      groups.forEach((group: any, index: number) => {
        console.log(`\n🏷️  Group ${index + 1}:`);
        console.log(`   Name: ${group.name}`);
        console.log(`   Creator: ${group.creator}`);
        console.log(`   Active: ${group.active}`);
        console.log(`   Members: ${group.members.length}`);
        console.log(`   Total Deposited: ${group.totalDeposited.toString()}`);
        console.log(`   Card Limit: ${group.card.limit.toString()}`);
        console.log(`   Transactions: ${group.transactions.length}`);
        for (const transaction of group.transactions) {
          console.log(`    Transaction ${transaction.transactionId}:`);
          console.log(`     Amount: ${transaction.totalAmount.toString()}`);
          console.log(`     Timestamp: ${transaction.timestamp.toString()}`);
          console.log(`     Description: ${transaction.description}`);
          console.log(`     Paid By: ${transaction.paidBy}`);
          console.log(`     Shares: ${transaction.shares.length}`);
          for (const share of transaction.shares) {
            console.log(`      Share ${share.user}:`);
            console.log(`       Amount: ${share.amount.toString()}`);
          }
        }
        console.log(`   Deposits: ${group.deposits.length}`);
        for (const deposit of group.deposits) {
          console.log(`    Deposit ${deposit.timestamp}:`);
          console.log(`     Amount: ${deposit.amount.toString()}`);
          console.log(`     User: ${deposit.user}`);
        }

      });
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async createTransaction(): Promise<void> {
    console.log("\n🔄 Create Transaction (ROFL only)");
    
    const groupId = await this.askForNumber("Group ID: ");
    const amount = await this.askForNumber("Amount: ");
    const description = await this.askQuestion("Description: ");
    const paidBy = await this.askForAddress("Paid by (address): ");

    try {
      console.log("🔄 Creating transaction...");
      const tx = await this.contract.createTransaction(groupId, amount, description, paidBy);
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction created! Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async recordDeposit(): Promise<void> {
    console.log("\n💰 Record Deposit (ROFL only)");
    
    const groupId = await this.askForNumber("Group ID: ");
    const user = await this.askForAddress("User address: ");
    const amount = await this.askForNumber("Amount: ");

    try {
      console.log("🔄 Recording deposit...");
      const tx = await this.contract.recordDeposit(groupId, user, amount);
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Deposit recorded! Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async viewContractInfo(): Promise<void> {
    console.log("\n📊 Contract Information");
    
    try {
      const [groupCount, roflAddress, owner] = await Promise.all([
        this.contract.groupCount(),
        this.contract.roflAddress(),
        this.contract.owner()
      ]);

      console.log(`📈 Total Groups: ${groupCount.toString()}`);
      console.log(`🤖 ROFL Address: ${roflAddress}`);
      console.log(`👤 Owner: ${owner}`);
      console.log(`📧 Your Address: ${await this.signer.getAddress()}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async selectNetwork(): Promise<any> {
    console.log("\n🌐 Select Network:");
    console.log("1. Ethereum Sepolia");
    console.log("2. Base Sepolia");
    console.log("3. Arbitrum Sepolia");
    
    const choice = await this.askForNumber("Network choice (1-3): ");
    
    switch (choice) {
      case 1:
        return NETWORK_CONFIGS.sepolia;
      case 2:
        return NETWORK_CONFIGS.baseSepolia;
      case 3:
        return NETWORK_CONFIGS.arbSepolia;
      default:
        throw new Error("Invalid network selection");
    }
  }

  private async makeDeposit(): Promise<void> {
    console.log("\n💰 Make Deposit to Group");
    
    try {
      const network = await this.selectNetwork();
      console.log(`\n✅ Selected network: ${network.name}`);
      
      const groupId = await this.askForNumber("Group ID: ");
      const amount = await this.askForNumber("Amount (in USDC): ");
      
      // Create network-specific provider and signer
      const provider = new ethers.JsonRpcProvider(network.rpc, network.chainId);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
      
      console.log(`💳 Using wallet: ${signer.address}`);
      
      // Create contract instances
      const depositContract = new ethers.Contract(
        network.contracts.deposit,
        DEPOSIT_CONTRACT_ABI,
        signer
      );
      
      const usdcContract = new ethers.Contract(
        network.contracts.usdc,
        ERC20_ABI,
        signer
      );
      
      // Convert amount to proper format (USDC has 6 decimals)
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      
      // Check balances
      const [usdcBalance, ethBalance] = await Promise.all([
        usdcContract.balanceOf(signer.address),
        provider.getBalance(signer.address)
      ]);
      
      console.log(`💰 USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
      console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
      
      if (usdcBalance < amountWei) {
        console.log("❌ Insufficient USDC balance!");
        return;
      }
      
      // Check allowance
      const allowance = await usdcContract.allowance(signer.address, network.contracts.deposit);
      console.log(`🔐 Current allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
      
      if (allowance < amountWei) {
        console.log("⚠️  Insufficient allowance. Approving USDC...");
        
        const approveTx = await usdcContract.approve(network.contracts.deposit, amountWei);
        console.log(`⏳ Approval transaction sent: ${approveTx.hash}`);
        
        await approveTx.wait();
        console.log("✅ USDC approved successfully!");
      }
      
      // Make deposit
      console.log("🔄 Making deposit...");
      const depositTx = await depositContract.deposit(amountWei, groupId);
      console.log(`⏳ Deposit transaction sent: ${depositTx.hash}`);
      
      const receipt = await depositTx.wait();
      console.log(`✅ Deposit successful! Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`💰 Deposited ${amount} USDC to Group ${groupId} on ${network.name}`);
      
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async checkUSDCBalance(): Promise<void> {
    console.log("\n💳 Check USDC Balance");
    
    try {
      const network = await this.selectNetwork();
      console.log(`\n✅ Selected network: ${network.name}`);
      
      const provider = new ethers.JsonRpcProvider(network.rpc, network.chainId);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
      
      const usdcContract = new ethers.Contract(
        network.contracts.usdc,
        ERC20_ABI,
        signer
      );
      
      const balance = await usdcContract.balanceOf(signer.address);
      const symbol = await usdcContract.symbol();
      
      console.log(`💰 ${symbol} Balance: ${ethers.formatUnits(balance, 6)} ${symbol}`);
      console.log(`📍 Address: ${signer.address}`);
      console.log(`🌐 Network: ${network.name}`);
      
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async checkUSDCAllowance(): Promise<void> {
    console.log("\n🔐 Check USDC Allowance");
    
    try {
      const network = await this.selectNetwork();
      console.log(`\n✅ Selected network: ${network.name}`);
      
      const provider = new ethers.JsonRpcProvider(network.rpc, network.chainId);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
      
      const usdcContract = new ethers.Contract(
        network.contracts.usdc,
        ERC20_ABI,
        signer
      );
      
      const allowance = await usdcContract.allowance(signer.address, network.contracts.deposit);
      const symbol = await usdcContract.symbol();
      
      console.log(`🔐 ${symbol} Allowance: ${ethers.formatUnits(allowance, 6)} ${symbol}`);
      console.log(`📍 Owner: ${signer.address}`);
      console.log(`📍 Spender: ${network.contracts.deposit}`);
      console.log(`🌐 Network: ${network.name}`);
      
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async approveUSDC(): Promise<void> {
    console.log("\n🔓 Approve USDC for Deposit");
    
    try {
      const network = await this.selectNetwork();
      console.log(`\n✅ Selected network: ${network.name}`);
      
      const amount = await this.askForNumber("Amount to approve (in USDC): ");
      
      const provider = new ethers.JsonRpcProvider(network.rpc, network.chainId);
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
      
      const usdcContract = new ethers.Contract(
        network.contracts.usdc,
        ERC20_ABI,
        signer
      );
      
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      
      console.log("🔄 Approving USDC...");
      const approveTx = await usdcContract.approve(network.contracts.deposit, amountWei);
      console.log(`⏳ Approval transaction sent: ${approveTx.hash}`);
      
      const receipt = await approveTx.wait();
      console.log(`✅ USDC approved! Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`🔐 Approved ${amount} USDC for deposit contract on ${network.name}`);
      
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  private async updateTransactionShares(): Promise<void> {
    console.log("\n🔄 Update Transaction Shares");
    
    const groupId = await this.askForNumber("Group ID: ");
    const transactionId = await this.askForNumber("Transaction ID: ");
    
    // Multiple shares input (similar to group creation)
    const shares = [];
    let addingShares = true;
    
    while (addingShares) {
      console.log(`\n➕ Adding share ${shares.length + 1}:`);
      const userAddress = await this.askForAddress("User Address: ");
      const amount = await this.askForNumber("Share Amount: ");
      
      shares.push({ user: userAddress, amount: amount });
      
      const addMore = await this.askQuestion("Add another share? (y/n): ");
      addingShares = addMore.toLowerCase() === 'y' || addMore.toLowerCase() === 'yes';
    }
    
    console.log(`\n📊 Total shares to add: ${shares.length}`);
    shares.forEach((share, index) => {
      console.log(`  ${index + 1}. ${share.user}: ${share.amount}`);
    });

    try {
      console.log("🔄 Updating transaction shares...");
      const tx = await this.contract.updateTransactionShares(groupId, transactionId, shares);
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction shares updated! Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  public async run(): Promise<void> {
    console.log("🚀 GroupManager Contract Tester Started");
    console.log(`📧 Your address: ${await this.signer.getAddress()}`);
    console.log(`📍 Contract address: ${this.contract.target}`);

    while (true) {
      await this.showMenu();
      const choice = await this.askQuestion("Select option: ");

      switch (choice) {
        case '1':
          await this.createGroup();
          break;
        case '2':
          await this.updateCardInfo();
          break;
        case '3':
          // Update card limit implementation
          break;
        case '4':
          await this.getMyGroups();
          break;
        case '5':
          await this.createTransaction();
          break;
        case '6':
          await this.updateTransactionShares();
          break;
        case '7':
          await this.recordDeposit();
          break;
        case '8':
          // Get group deposits implementation
          break;
        case '9':
          // Get group transactions implementation
          break;
        case '10':
          // Calculate user balances implementation
          break;
        case '11':
          // Update ROFL address implementation
          break;
        case '12':
          await this.viewContractInfo();
          break;
        case '13':
          await this.makeDeposit();
          break;
        case '14':
          await this.checkUSDCBalance();
          break;
        case '15':
          await this.checkUSDCAllowance();
          break;
        case '16':
          await this.approveUSDC();
          break;
        case '0':
          console.log("👋 Goodbye!");
          this.rl.close();
          return;
        default:
          console.log("❌ Invalid option. Please try again.");
      }
    }
  }
}

async function main() {
  console.log("🔧 Setting up...");
  
  // Static contract address - Update this with your deployed contract address
  const CONTRACT_ADDRESS = "0x8Af839139489c0201FAe72B1F473DcB00F81Ae62"; // Replace with your contract address
  
  // Get signer
  const [signer] = await ethers.getSigners();

  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    console.log("❌ Invalid contract address in code!");
    return;
  }

  const tester = new GroupManagerTester(CONTRACT_ADDRESS, signer);
  await tester.run();
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
}); 