const hre = require("hardhat");

async function main() {
  console.log("Deploying GroupManager to Sapphire testnet...");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy GroupManager
  const GroupManager = await hre.ethers.getContractFactory("GroupManager");
  const groupManager = await GroupManager.deploy();
  
  await groupManager.waitForDeployment();
  const contractAddress = await groupManager.getAddress();
  
  console.log("GroupManager deployed to:", contractAddress);
  console.log("Transaction hash:", groupManager.deploymentTransaction()?.hash);
  
  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 