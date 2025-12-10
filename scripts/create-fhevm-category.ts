/**
 * Category-Based Project Generator
 *
 * Generate complete FHEVM example projects by category
 * Creates multiple related examples for learning progression
 *
 * Usage: npx ts-node scripts/create-fhevm-category.ts --category basic
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface CategoryConfig {
  name: string;
  description: string;
  examples: ExampleDefinition[];
  learningPath: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface ExampleDefinition {
  name: string;
  title: string;
  description: string;
  contractName: string;
  concepts: string[];
  difficulty: "easy" | "medium" | "hard";
}

const CATEGORIES: { [key: string]: CategoryConfig } = {
  basic: {
    name: "Basic FHE Operations",
    description: "Fundamental FHE concepts and encrypted data types",
    difficulty: "beginner",
    learningPath: [
      "Start with Counter to understand euint types",
      "Learn arithmetic operations with Add/Subtract",
      "Master comparisons with Equality example",
      "Combine concepts in a simple application"
    ],
    examples: [
      {
        name: "counter",
        title: "Encrypted Counter",
        description: "Basic FHE counter with encrypted state",
        contractName: "EncryptedCounter",
        concepts: ["euint32", "FHE.asEuint", "FHE.add", "FHE.sub"],
        difficulty: "easy"
      },
      {
        name: "arithmetic",
        title: "Arithmetic Operations",
        description: "FHE arithmetic: add, subtract, multiply",
        contractName: "ArithmeticOperations",
        concepts: ["FHE.add", "FHE.sub", "FHE.mul", "Encrypted math"],
        difficulty: "easy"
      },
      {
        name: "equality",
        title: "Equality Comparison",
        description: "Compare encrypted values for equality",
        contractName: "EqualityComparison",
        concepts: ["FHE.eq", "ebool", "Encrypted comparisons"],
        difficulty: "medium"
      }
    ]
  },

  encryption: {
    name: "Encryption Techniques",
    description: "Input encryption and external data handling",
    difficulty: "beginner",
    learningPath: [
      "Understand encrypted inputs from clients",
      "Learn input proof validation",
      "Encrypt single values",
      "Handle multiple encrypted values"
    ],
    examples: [
      {
        name: "single-encryption",
        title: "Single Value Encryption",
        description: "Encrypt and store a single value",
        contractName: "SingleValueEncryption",
        concepts: ["encryptedInput", "FHE.fromExternal", "Input proof"],
        difficulty: "easy"
      },
      {
        name: "multi-encryption",
        title: "Multiple Value Encryption",
        description: "Encrypt and manage multiple values",
        contractName: "MultiValueEncryption",
        concepts: ["Multiple euints", "Batch operations", "Input validation"],
        difficulty: "medium"
      }
    ]
  },

  decryption: {
    name: "Decryption Patterns",
    description: "User and public decryption techniques",
    difficulty: "intermediate",
    learningPath: [
      "Learn user-based decryption",
      "Understand public decryption use cases",
      "Combine with encryption patterns",
      "Implement secure access control"
    ],
    examples: [
      {
        name: "user-decryption",
        title: "User Decryption",
        description: "Allow users to decrypt their encrypted data",
        contractName: "UserDecryption",
        concepts: ["User access", "Decryption permissions", "Privacy"],
        difficulty: "medium"
      },
      {
        name: "public-decryption",
        title: "Public Decryption",
        description: "Publicly accessible decrypted results",
        contractName: "PublicDecryption",
        concepts: ["Public decryption", "Result sharing", "Verification"],
        difficulty: "hard"
      }
    ]
  },

  "access-control": {
    name: "Access Control",
    description: "Permission management and authorized access",
    difficulty: "intermediate",
    learningPath: [
      "Learn FHE.allow pattern",
      "Master FHE.allowThis for contract access",
      "Understand input proof requirements",
      "Implement role-based access"
    ],
    examples: [
      {
        name: "allow-pattern",
        title: "FHE.allow Pattern",
        description: "Grant access to specific addresses",
        contractName: "AllowPattern",
        concepts: ["FHE.allow", "Access grants", "Permission management"],
        difficulty: "medium"
      },
      {
        name: "allowThis-pattern",
        title: "FHE.allowThis Pattern",
        description: "Allow contract internal access",
        contractName: "AllowThisPattern",
        concepts: ["FHE.allowThis", "Internal access", "Self-referential"],
        difficulty: "medium"
      },
      {
        name: "role-based",
        title: "Role-Based Access Control",
        description: "RBAC with encrypted data",
        contractName: "RoleBasedAccess",
        concepts: ["RBAC", "Multiple roles", "Fine-grained access"],
        difficulty: "hard"
      }
    ]
  },

  advanced: {
    name: "Advanced Patterns",
    description: "Complex applications and patterns",
    difficulty: "advanced",
    learningPath: [
      "Study blind auction implementation",
      "Learn secure voting mechanisms",
      "Explore privacy-preserving financial operations",
      "Build your own applications"
    ],
    examples: [
      {
        name: "blind-auction",
        title: "Blind Auction",
        description: "Privacy-preserving auction system",
        contractName: "BlindAuction",
        concepts: [
          "Encrypted bids",
          "Auction logic",
          "Winner determination",
          "Privacy"
        ],
        difficulty: "hard"
      },
      {
        name: "confidential-voting",
        title: "Confidential Voting",
        description: "Private voting system",
        contractName: "ConfidentialVoting",
        concepts: ["Encrypted votes", "Vote counting", "Tallying", "Privacy"],
        difficulty: "hard"
      }
    ]
  }
};

function generateContractTemplate(example: ExampleDefinition): string {
  return `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ${example.contractName}
 * @notice ${example.description}
 * @dev Category: ${example.name}
 *
 * Key Concepts:
${example.concepts.map(c => ` * - ${c}`).join("\n")}
 */
contract ${example.contractName} is SepoliaConfig {

    // State Variables
    mapping(address => euint32) private userValues;
    uint256 public totalOperations;

    // Events
    event ValueStored(address indexed user, uint256 timestamp);
    event OperationCompleted(address indexed user, string operation);

    // Constructor
    constructor() {
        totalOperations = 0;
    }

    // Functions

    /**
     * @notice Store an encrypted value
     * @param encryptedValue The encrypted value to store
     */
    function storeValue(euint32 encryptedValue) external {
        userValues[msg.sender] = encryptedValue;

        // Set access permissions
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);

        totalOperations++;
        emit ValueStored(msg.sender, block.timestamp);
    }

    /**
     * @notice Perform an operation on encrypted data
     */
    function performOperation() external {
        // Add your encrypted operation here

        emit OperationCompleted(msg.sender, "operation");
    }

    /**
     * @notice Get operation count
     * @return Total number of operations performed
     */
    function getOperationCount() external view returns (uint256) {
        return totalOperations;
    }
}
`;
}

function generateTestTemplate(example: ExampleDefinition): string {
  return `import { expect } from "chai";
import { ethers } from "hardhat";

describe("${example.contractName}", function () {
    let contract: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("${example.contractName}");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(contract.address).to.be.properAddress;
        });

        it("Should initialize with zero operations", async function () {
            expect(await contract.getOperationCount()).to.equal(0);
        });
    });

    describe("Core Functionality", function () {
        it("Should store encrypted values", async function () {
            // Add your test here
            expect(true).to.be.true;
        });

        it("Should track operations", async function () {
            // Add your test here
            expect(true).to.be.true;
        });
    });

    describe("FHE Operations", function () {
        it("Should handle ${example.concepts[0]} correctly", async function () {
            // Add FHE operation test
            expect(true).to.be.true;
        });
    });

    describe("Access Control", function () {
        it("Should enforce permissions", async function () {
            // Add access control test
            expect(true).to.be.true;
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple users", async function () {
            // Add multi-user test
            expect(true).to.be.true;
        });

        it("Should handle repeated operations", async function () {
            // Add repetition test
            expect(true).to.be.true;
        });
    });
});
`;
}

function generateReadme(category: CategoryConfig): string {
  return `# ${category.name}

${category.description}

## Learning Path

${category.learningPath.map((step, i) => `${i + 1}. ${step}`).join("\n")}

## Difficulty Level

**${category.difficulty.toUpperCase()}**

## Examples in This Category

${category.examples
  .map(
    example => `
### ${example.title}

**File**: \`${example.name}\`
**Difficulty**: ${example.difficulty.toUpperCase()}
**Description**: ${example.description}

**Key Concepts**:
${example.concepts.map(c => `- ${c}`).join("\n")}
`
  )
  .join("\n")}

## Getting Started

1. **Setup**
   \`\`\`bash
   npm install
   npx hardhat compile
   \`\`\`

2. **Run Tests**
   \`\`\`bash
   npx hardhat test
   \`\`\`

3. **Deploy**
   \`\`\`bash
   npx hardhat run scripts/deploy.ts --network sepolia
   \`\`\`

## Common Patterns

Each example demonstrates important FHE patterns:
- Encrypted state management
- Access control mechanisms
- Data integrity verification
- Event-based communication

## Next Steps

- Study the contract code and comments
- Run the tests to understand expected behavior
- Modify examples to experiment
- Combine patterns from multiple examples
- Build your own application

## Resources

- [FHEVM Documentation](https://docs.zama.ai)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Privacy-Preserving Quality Inspection System](../../README.md)

---

*Part of the Privacy-Preserving Quality Inspection System - Build privacy-first applications on blockchain.*
`;
}

function createCategoryProject(categoryName: string): void {
  const category = CATEGORIES[categoryName];

  if (!category) {
    console.error(`❌ Unknown category: ${categoryName}`);
    console.log(`Available categories: ${Object.keys(CATEGORIES).join(", ")}`);
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), `fhevm-${categoryName}-examples`);

  if (fs.existsSync(outputDir)) {
    console.error(`❌ Directory ${outputDir} already exists!`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\nCreating category project: ${category.name}`);
  console.log(`Output: ${outputDir}\n`);

  // Create README
  const readmeContent = generateReadme(category);
  fs.writeFileSync(path.join(outputDir, "README.md"), readmeContent);
  console.log("✓ README.md created");

  // Create example subdirectories
  category.examples.forEach(example => {
    const exampleDir = path.join(outputDir, example.name);
    fs.mkdirSync(exampleDir, { recursive: true });

    // Create contracts subdirectory
    fs.mkdirSync(path.join(exampleDir, "contracts"), { recursive: true });
    fs.mkdirSync(path.join(exampleDir, "test"), { recursive: true });
    fs.mkdirSync(path.join(exampleDir, "scripts"), { recursive: true });

    // Create contract
    const contractContent = generateContractTemplate(example);
    fs.writeFileSync(
      path.join(exampleDir, "contracts", `${example.contractName}.sol`),
      contractContent
    );

    // Create test
    const testContent = generateTestTemplate(example);
    fs.writeFileSync(
      path.join(exampleDir, "test", `${example.contractName}.test.ts`),
      testContent
    );

    // Create example README
    const exampleReadme = `# ${example.title}

${example.description}

## Difficulty: ${example.difficulty.toUpperCase()}

## Key Concepts

${example.concepts.map(c => `- **${c}**`).join("\n")}

## Contract Structure

The \`${example.contractName}\` contract demonstrates:
- Encrypted state variables
- FHE operations
- Access control
- Event emission

## Getting Started

\`\`\`bash
npm install
npx hardhat compile
npx hardhat test
\`\`\`

## Learning Goals

After studying this example, you should understand:
- How ${example.concepts[0]} works
- Real-world use cases
- Integration patterns
- Best practices

## Next Example

Explore related examples in the \`../\` directory.

---

*${example.description}*
`;

    fs.writeFileSync(path.join(exampleDir, "README.md"), exampleReadme);

    console.log(`✓ Example created: ${example.name}`);
  });

  console.log(`\n✅ Category project created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. cd ${outputDir}`);
  console.log(`2. cd <example-name> (e.g., counter)`);
  console.log(`3. npm install`);
  console.log(`4. npx hardhat compile`);
  console.log(`5. npx hardhat test`);
}

function main(): void {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Category-Based Project Generator                       ║");
  console.log("║     Privacy-Preserving Quality Inspection System           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const args = process.argv.slice(2);
  let categoryName = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--category" && args[i + 1]) {
      categoryName = args[i + 1];
      i++;
    }
  }

  if (!categoryName) {
    console.log("\nAvailable categories:\n");
    Object.entries(CATEGORIES).forEach(([key, category]) => {
      console.log(`📚 ${key}`);
      console.log(`   ${category.description}`);
      console.log(`   Examples: ${category.examples.map(e => e.name).join(", ")}\n`);
    });

    console.log(`Usage: npx ts-node scripts/create-fhevm-category.ts --category <name>`);
    process.exit(0);
  }

  createCategoryProject(categoryName);
}

main();
