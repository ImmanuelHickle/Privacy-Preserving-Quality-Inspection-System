/**
 * Automation Script: Create FHEVM Example Repository
 *
 * This script automatically generates standalone FHEVM example repositories
 * with contracts, tests, documentation, and scaffolding.
 *
 * Usage: npx ts-node scripts/create-fhevm-example.ts --name MyExample --category basic
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ExampleConfig {
  name: string;
  category: "basic" | "encryption" | "decryption" | "access-control" | "advanced";
  description: string;
  contractName?: string;
  features?: string[];
}

const CATEGORIES = {
  basic: {
    examples: ["counter", "arithmetic", "equality"],
    description: "Fundamental FHE operations and encrypted data types"
  },
  encryption: {
    examples: ["single-value", "multiple-values"],
    description: "FHE encryption techniques and input handling"
  },
  decryption: {
    examples: ["user-decrypt", "public-decrypt"],
    description: "User and public decryption patterns"
  },
  "access-control": {
    examples: ["allow", "allowThis", "input-proof"],
    description: "Access control and permission management"
  },
  advanced: {
    examples: ["blind-auction", "confidential-voting"],
    description: "Advanced FHE patterns and complex use cases"
  }
};

function createDirectoryStructure(outputDir: string): void {
  const dirs = [
    "contracts",
    "test",
    "scripts",
    "frontend",
    "docs"
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(outputDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  console.log(`✓ Directory structure created in ${outputDir}`);
}

function createContractTemplate(
  outputDir: string,
  config: ExampleConfig,
  contractContent: string
): void {
  const contractName = config.contractName || toPascalCase(config.name);
  const contractPath = path.join(outputDir, "contracts", `${contractName}.sol`);

  fs.writeFileSync(contractPath, contractContent);
  console.log(`✓ Contract created: ${contractName}.sol`);
}

function createTestTemplate(
  outputDir: string,
  config: ExampleConfig,
  testContent: string
): void {
  const testName = config.contractName || toPascalCase(config.name);
  const testPath = path.join(outputDir, "test", `${testName}.test.ts`);

  fs.writeFileSync(testPath, testContent);
  console.log(`✓ Test created: ${testName}.test.ts`);
}

function createDocumentation(outputDir: string, config: ExampleConfig): void {
  const docContent = `# ${config.name}

## Overview

${config.description}

## Features

${(config.features || []).map(f => `- ${f}`).join("\n")}

## Category

\`${config.category}\`

## Usage

### Setup

\`\`\`bash
npm install
npx hardhat compile
npx hardhat test
\`\`\`

### Run Example

\`\`\`bash
npx hardhat run scripts/example.ts --network localhost
\`\`\`

## Key Concepts

### FHE Operations

This example demonstrates the following FHE operations:
- Encrypted data types (euint8, euint32, etc.)
- Encrypted computations
- Access control patterns
- Data integrity verification

### Security Considerations

- Input validation is critical
- Proper access control must be maintained
- Overflow/underflow checks required
- Gas costs are higher than plain Solidity

## Learning Outcomes

After completing this example, you should understand:
- How FHE works in smart contracts
- Encrypted data handling
- Privacy-preserving computation
- Real-world applications

## Resources

- [FHEVM Documentation](https://docs.zama.ai)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Hardhat Documentation](https://hardhat.org)

## Next Steps

- Explore other examples in different categories
- Combine multiple FHE operations
- Build your own FHE application
- Deploy to testnet

---

*Part of the Privacy-Preserving Quality Inspection System project.*
`;

  const docPath = path.join(outputDir, "README.md");
  fs.writeFileSync(docPath, docContent);
  console.log(`✓ Documentation created: README.md`);
}

function createHardhatConfig(outputDir: string): void {
  const config = `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.dev",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
`;

  const configPath = path.join(outputDir, "hardhat.config.ts");
  fs.writeFileSync(configPath, config);
  console.log(`✓ Hardhat config created`);
}

function createPackageJson(outputDir: string, config: ExampleConfig): void {
  const packageJson = {
    name: `fhevm-example-${config.name.toLowerCase()}`,
    version: "1.0.0",
    description: config.description,
    scripts: {
      compile: "hardhat compile",
      test: "hardhat test",
      coverage: "hardhat coverage",
      deploy: "hardhat run scripts/deploy.ts --network sepolia"
    },
    dependencies: {
      "@fhevm/solidity": "^0.3.0",
      ethers: "^5.7.2"
    },
    devDependencies: {
      "@nomicfoundation/hardhat-toolbox": "^4.0.0",
      hardhat: "^2.17.0",
      typescript: "^5.0.0",
      "@types/node": "^20.0.0"
    }
  };

  const pkgPath = path.join(outputDir, "package.json");
  fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2));
  console.log(`✓ Package.json created`);
}

function createDeployScript(outputDir: string, config: ExampleConfig): void {
  const contractName = config.contractName || toPascalCase(config.name);

  const deployScript = `import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ${contractName}...");

  const ${contractName} = await ethers.getContractFactory("${contractName}");
  const contract = await ${contractName}.deploy();

  await contract.deployed();

  console.log("✓ ${contractName} deployed to:", contract.address);
  console.log("\\nVerify with:");
  console.log(\`npx hardhat verify --network sepolia \${contract.address}\`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

  const scriptPath = path.join(outputDir, "scripts", "deploy.ts");
  fs.writeFileSync(scriptPath, deployScript);
  console.log(`✓ Deploy script created`);
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function getContractTemplate(category: string, name: string): string {
  const contractName = toPascalCase(name);

  return `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ${contractName}
 * @notice Example contract demonstrating FHE ${category} operations
 * @dev Category: ${category}
 */
contract ${contractName} is SepoliaConfig {

    // State variables

    /**
     * @notice Example encrypted state variable
     */
    euint32 private encryptedValue;

    // Events

    /**
     * @notice Emitted when value is updated
     */
    event ValueUpdated(address indexed updater, uint256 timestamp);

    // Constructor

    constructor() {
        encryptedValue = FHE.asEuint32(0);
    }

    // Functions

    /**
     * @notice Update encrypted value
     * @param newValue New encrypted value
     */
    function updateValue(euint32 newValue) external {
        encryptedValue = newValue;
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);

        emit ValueUpdated(msg.sender, block.timestamp);
    }

    /**
     * @notice Get basic info (public data only)
     * @return timestamp Last update timestamp
     */
    function getInfo() external view returns (uint256 timestamp) {
        return block.timestamp;
    }
}
`;
}

function getTestTemplate(name: string): string {
  const contractName = toPascalCase(name);

  return `import { expect } from "chai";
import { ethers } from "hardhat";

describe("${contractName}", function () {
    let contract: any;
    let owner: any;
    let addr1: any;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("${contractName}");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(contract.address).to.be.properAddress;
        });
    });

    describe("Basic Operations", function () {
        it("Should handle encrypted operations", async function () {
            // Add your test here
            expect(true).to.be.true;
        });
    });

    describe("Access Control", function () {
        it("Should enforce access control", async function () {
            // Add access control test here
            expect(true).to.be.true;
        });
    });

    describe("FHE Operations", function () {
        it("Should perform FHE computations correctly", async function () {
            // Add FHE operation test here
            expect(true).to.be.true;
        });
    });
});
`;
}

function createExampleProject(
  outputDir: string,
  config: ExampleConfig
): void {
  // Create directory structure
  createDirectoryStructure(outputDir);

  // Create contract
  const contractContent = getContractTemplate(config.category, config.name);
  createContractTemplate(outputDir, config, contractContent);

  // Create test
  const testContent = getTestTemplate(config.name);
  createTestTemplate(outputDir, config, testContent);

  // Create documentation
  createDocumentation(outputDir, config);

  // Create configuration files
  createHardhatConfig(outputDir);
  createPackageJson(outputDir, config);
  createDeployScript(outputDir, config);

  console.log(`\n✅ Example project created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. cd ${outputDir}`);
  console.log(`2. npm install`);
  console.log(`3. npx hardhat compile`);
  console.log(`4. npx hardhat test`);
}

function main(): void {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     FHE Example Repository Generator                       ║");
  console.log("║     Privacy-Preserving Quality Inspection System           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const args = process.argv.slice(2);
  let config: ExampleConfig = {
    name: "MyExample",
    category: "basic",
    description: "Example FHE contract demonstrating FHE operations"
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) {
      config.name = args[i + 1];
      i++;
    } else if (args[i] === "--category" && args[i + 1]) {
      const category = args[i + 1] as keyof typeof CATEGORIES;
      if (CATEGORIES[category]) {
        config.category = category;
      }
      i++;
    } else if (args[i] === "--description" && args[i + 1]) {
      config.description = args[i + 1];
      i++;
    }
  }

  const outputDir = path.join(process.cwd(), config.name.toLowerCase());

  if (fs.existsSync(outputDir)) {
    console.error(`❌ Directory ${outputDir} already exists!`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`Creating example: ${config.name}`);
  console.log(`Category: ${config.category}`);
  console.log(`Output: ${outputDir}\n`);

  createExampleProject(outputDir, config);
}

main();
