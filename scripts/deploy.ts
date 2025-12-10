/**
 * Deployment Script
 *
 * Deploy PrivacyQualityInspection contract to blockchain
 *
 * Usage:
 * - Deploy to Sepolia: npx hardhat run scripts/deploy.ts --network sepolia
 * - Deploy locally: npx hardhat run scripts/deploy.ts --network localhost
 */

import { ethers } from "hardhat";

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Privacy-Preserving Quality Inspection Deployment       ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get network information
  const network = await ethers.provider.getNetwork();
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  // Get gas price and balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const gasPrice = await ethers.provider.getGasPrice();

  console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
  console.log(`Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei\n`);

  // Check balance
  const minBalance = ethers.utils.parseEther("0.1");
  if (balance.lt(minBalance)) {
    console.error("❌ Insufficient balance. Minimum required: 0.1 ETH");
    process.exit(1);
  }

  // Deploy contract
  console.log("Deploying PrivacyQualityInspection...\n");

  const PrivacyQualityInspection = await ethers.getContractFactory("PrivacyQualityInspection");

  // Estimate gas
  const deployTx = PrivacyQualityInspection.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTx);
  const deploymentCost = estimatedGas.mul(gasPrice);

  console.log(`Estimated Gas: ${estimatedGas.toString()}`);
  console.log(`Estimated Cost: ${ethers.utils.formatEther(deploymentCost)} ETH\n`);

  const contract = await PrivacyQualityInspection.deploy();

  console.log(`📦 Deployment transaction sent: ${contract.deployTransaction.hash}`);
  console.log(`⏳ Waiting for confirmation...\n`);

  const receipt = await contract.deployed();

  console.log(`✅ Contract deployed successfully!\n`);
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log(`║ Contract Address: ${contract.address}`);
  console.log(`║ Deployer: ${deployer.address}`);
  console.log(`║ Block Number: ${receipt.blockNumber}`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Verify contract functions
  console.log("Verifying contract...\n");

  try {
    const owner = await contract.owner();
    console.log(`✓ Owner: ${owner}`);

    const inspectionCount = await contract.inspectionCount();
    console.log(`✓ Initial inspection count: ${inspectionCount}`);

    const authorized = await contract.authorizedInspectors(deployer.address);
    console.log(`✓ Deployer authorized: ${authorized}\n`);
  } catch (error) {
    console.error("⚠️  Contract verification failed:", error);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contractAddress: contract.address,
    deployer: deployer.address,
    deploymentTx: contract.deployTransaction.hash,
    blockNumber: receipt.blockNumber,
    deploymentCost: ethers.utils.formatEther(deploymentCost),
    timestamp: new Date().toISOString()
  };

  const deploymentFile = "./deployment-info.json";
  const fs = require("fs");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📝 Deployment info saved to ${deploymentFile}\n`);

  // Print next steps
  console.log("Next Steps:\n");
  console.log(`1. Verify on Etherscan:`);
  console.log(
    `   npx hardhat verify --network ${network.name.toLowerCase()} ${contract.address}\n`
  );

  console.log(`2. Update frontend configuration:`);
  console.log(`   const CONTRACT_ADDRESS = "${contract.address}";\n`);

  console.log(`3. Test the contract:`);
  console.log(`   npx hardhat test --network ${network.name.toLowerCase()}\n`);

  console.log(`4. View on block explorer:`);
  if (network.chainId === 11155111) {
    console.log(`   https://sepolia.etherscan.io/address/${contract.address}\n`);
  } else if (network.chainId === 1) {
    console.log(`   https://etherscan.io/address/${contract.address}\n`);
  }

  return contract.address;
}

main()
  .then(address => {
    console.log("✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
