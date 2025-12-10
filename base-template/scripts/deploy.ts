import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Example contract...");

  const Example = await ethers.getContractFactory("Example");
  const contract = await Example.deploy();

  await contract.deployed();

  console.log("✓ Example deployed to:", contract.address);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network sepolia ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
