# Implementation Examples

## Table of Contents

1. [Basic Usage Examples](#basic-usage-examples)
2. [Frontend Integration Examples](#frontend-integration-examples)
3. [Testing Examples](#testing-examples)
4. [Advanced Patterns](#advanced-patterns)
5. [Common Workflows](#common-workflows)

## Basic Usage Examples

### Example 1: Authorize an Inspector

**Scenario**: You want to add a new quality inspector to the system.

**Solidity (Contract Owner)**
```solidity
// In web3.py or ethers.js
const inspectorAddress = "0x742d35Cc6634C0532925a3b844Bc8e7595f42bE";
await contract.authorizeInspector(inspectorAddress);
```

**JavaScript (Frontend)**
```javascript
async function authorizeNewInspector(inspectorAddress) {
    try {
        const tx = await contract.authorizeInspector(inspectorAddress);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Inspector authorized in block:", receipt.blockNumber);

        return receipt;
    } catch (error) {
        if (error.reason === "Not authorized") {
            console.error("Only owner can authorize inspectors");
        } else {
            console.error("Authorization failed:", error);
        }
    }
}

// Usage
const newInspector = "0x742d35Cc6634C0532925a3b844Bc8e7595f42bE";
await authorizeNewInspector(newInspector);
```

### Example 2: Record an Inspection

**Scenario**: An inspector needs to record quality data for Electronics category.

**Data to Record**
```javascript
const inspectionData = {
    qualityScore: 85,      // Quality score 0-100
    defectCount: 2,        // Number of defects found
    productBatch: 1001,    // Batch identification number
    productCategory: "Electronics"  // Category for filtering
};
```

**Solidity (Smart Contract)**
```solidity
function recordInspection(
    uint8 _qualityScore,
    uint8 _defectCount,
    uint32 _productBatch,
    string memory _productCategory
) external onlyAuthorizedInspector {
    // Data is automatically encrypted by FHE
    // ...
}
```

**JavaScript (Frontend)**
```javascript
async function recordQualityInspection(inspectionData) {
    try {
        // Validate input
        if (inspectionData.qualityScore > 100) {
            throw new Error("Quality score must be 0-100");
        }

        // Record inspection
        const tx = await contract.recordInspection(
            inspectionData.qualityScore,
            inspectionData.defectCount,
            inspectionData.productBatch,
            inspectionData.productCategory,
            {
                gasLimit: 500000  // FHE operations need higher gas
            }
        );

        console.log("Inspection recorded. TX:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();

        console.log("Confirmed in block:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());

        return receipt;
    } catch (error) {
        console.error("Failed to record inspection:", error);
        throw error;
    }
}

// Example usage
const electronicsInspection = {
    qualityScore: 85,
    defectCount: 2,
    productBatch: 1001,
    productCategory: "Electronics"
};

await recordQualityInspection(electronicsInspection);
```

**Complete Workflow Example**
```javascript
// 1. Connect wallet
await connectWallet();

// 2. Record multiple inspections
const inspections = [
    {
        qualityScore: 85,
        defectCount: 2,
        productBatch: 1001,
        productCategory: "Electronics"
    },
    {
        qualityScore: 92,
        defectCount: 1,
        productBatch: 1002,
        productCategory: "Electronics"
    },
    {
        qualityScore: 78,
        defectCount: 3,
        productBatch: 2001,
        productCategory: "Automotive"
    }
];

for (const inspection of inspections) {
    console.log(`Recording inspection for batch ${inspection.productBatch}...`);
    const receipt = await recordQualityInspection(inspection);
    console.log(`✓ Recorded with TX: ${receipt.transactionHash}`);

    // Wait between transactions to avoid nonce conflicts
    await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log("All inspections recorded!");
```

### Example 3: Verify an Inspection

**Scenario**: A quality manager needs to verify an inspection recorded by another inspector.

**Solidity Logic**
```solidity
function verifyInspection(uint256 _inspectionId)
    external
    onlyAuthorizedInspector
    validInspectionId(_inspectionId)
{
    require(!inspections[_inspectionId].isVerified, "Already verified");
    require(
        inspections[_inspectionId].inspector != msg.sender,
        "Cannot verify own inspection"
    );

    inspections[_inspectionId].isVerified = true;
    emit InspectionVerified(_inspectionId, msg.sender);
}
```

**JavaScript Implementation**
```javascript
async function verifyInspection(inspectionId) {
    try {
        // Get current inspection status
        const inspection = await contract.getInspectionInfo(inspectionId);

        if (inspection.isVerified) {
            console.log("This inspection is already verified");
            return null;
        }

        if (inspection.inspector === (await signer.getAddress())) {
            console.log("Cannot verify your own inspection");
            return null;
        }

        // Verify the inspection
        const tx = await contract.verifyInspection(inspectionId);
        console.log("Verification initiated. TX:", tx.hash);

        const receipt = await tx.wait();
        console.log("Inspection verified!");

        return receipt;
    } catch (error) {
        console.error("Verification failed:", error);
        throw error;
    }
}

// Usage
const inspectionId = 0;
await verifyInspection(inspectionId);
```

## Frontend Integration Examples

### Example 1: Wallet Connection

**HTML**
```html
<div id="connectionStatus" class="connection-status">
    <button id="connectBtn">Connect MetaMask</button>
    <span id="accountInfo" style="display:none;"></span>
</div>
```

**JavaScript**
```javascript
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            throw new Error("MetaMask not installed");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        const userAddress = accounts[0];
        console.log("Connected account:", userAddress);

        // Initialize Web3
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Initialize contract
        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );

        // Update UI
        document.getElementById('connectBtn').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'inline';
        document.getElementById('accountInfo').textContent =
            `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

        return userAddress;
    } catch (error) {
        console.error("Connection failed:", error);
        alert("Failed to connect MetaMask: " + error.message);
    }
}

// Handle button click
document.getElementById('connectBtn').addEventListener('click', connectWallet);

// Auto-connect on page load if previously connected
window.addEventListener('load', async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error("Auto-connect failed:", error);
        }
    }
});
```

### Example 2: Form Submission

**HTML**
```html
<form id="inspectionForm">
    <div class="form-group">
        <label for="qualityScore">Quality Score (0-100):</label>
        <input type="number" id="qualityScore" min="0" max="100" required>
    </div>

    <div class="form-group">
        <label for="defectCount">Defect Count:</label>
        <input type="number" id="defectCount" min="0" required>
    </div>

    <div class="form-group">
        <label for="productBatch">Product Batch:</label>
        <input type="number" id="productBatch" required>
    </div>

    <div class="form-group">
        <label for="productCategory">Category:</label>
        <select id="productCategory" required>
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Automotive">Automotive</option>
            <option value="Pharmaceutical">Pharmaceutical</option>
            <option value="Food">Food & Beverage</option>
        </select>
    </div>

    <button type="submit">Record Inspection</button>
</form>

<div id="status" class="status-message"></div>
```

**JavaScript**
```javascript
document.getElementById('inspectionForm').addEventListener('submit',
    async (event) => {
        event.preventDefault();

        if (!contract) {
            showStatus("Please connect wallet first", "error");
            return;
        }

        const statusDiv = document.getElementById('status');
        const submitBtn = event.target.querySelector('button');

        try {
            submitBtn.disabled = true;
            statusDiv.textContent = "Processing...";
            statusDiv.className = "status-message status-info";

            // Get form data
            const qualityScore = parseInt(document.getElementById('qualityScore').value);
            const defectCount = parseInt(document.getElementById('defectCount').value);
            const productBatch = parseInt(document.getElementById('productBatch').value);
            const productCategory = document.getElementById('productCategory').value;

            // Validate data
            if (qualityScore > 100) {
                throw new Error("Quality score must be between 0 and 100");
            }

            // Send transaction
            statusDiv.textContent = "Encrypting and recording inspection...";

            const tx = await contract.recordInspection(
                qualityScore,
                defectCount,
                productBatch,
                productCategory,
                { gasLimit: 500000 }
            );

            statusDiv.textContent = `Waiting for confirmation (TX: ${tx.hash.slice(0, 10)}...)`;

            const receipt = await tx.wait();

            statusDiv.textContent = `✓ Inspection recorded successfully!`;
            statusDiv.className = "status-message status-success";

            // Reset form
            event.target.reset();

            // Refresh inspection list
            await loadInspections();

        } catch (error) {
            console.error("Error:", error);
            statusDiv.textContent = `✗ Error: ${error.message}`;
            statusDiv.className = "status-message status-error";
        } finally {
            submitBtn.disabled = false;
        }
    }
);

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
}
```

## Testing Examples

### Example 1: Inspector Authorization Test

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Inspector Authorization", function () {
    let contract;
    let owner, inspector1, inspector2;

    beforeEach(async function () {
        [owner, inspector1, inspector2] = await ethers.getSigners();

        const PrivacyQualityInspection = await ethers.getContractFactory("PrivacyQualityInspection");
        contract = await PrivacyQualityInspection.deploy();
        await contract.deployed();
    });

    it("Should authorize an inspector", async function () {
        // Check initial state
        let isAuthorized = await contract.authorizedInspectors(inspector1.address);
        expect(isAuthorized).to.be.false;

        // Authorize inspector
        await contract.authorizeInspector(inspector1.address);

        // Verify authorization
        isAuthorized = await contract.authorizedInspectors(inspector1.address);
        expect(isAuthorized).to.be.true;
    });

    it("Should emit InspectorAuthorized event", async function () {
        // Expect event emission
        await expect(contract.authorizeInspector(inspector1.address))
            .to.emit(contract, 'InspectorAuthorized')
            .withArgs(inspector1.address, owner.address);
    });

    it("Should prevent duplicate authorization", async function () {
        // First authorization
        await contract.authorizeInspector(inspector1.address);

        // Second authorization should revert
        await expect(contract.authorizeInspector(inspector1.address))
            .to.be.revertedWith("Already authorized");
    });

    it("Should prevent non-owner authorization", async function () {
        await expect(
            contract.connect(inspector1).authorizeInspector(inspector2.address)
        ).to.be.revertedWith("Not authorized");
    });

    it("Should allow revoking inspector authorization", async function () {
        // Authorize inspector
        await contract.authorizeInspector(inspector1.address);
        expect(await contract.authorizedInspectors(inspector1.address)).to.be.true;

        // Revoke authorization
        await contract.revokeInspector(inspector1.address);
        expect(await contract.authorizedInspectors(inspector1.address)).to.be.false;
    });
});
```

### Example 2: Inspection Recording Test

```typescript
describe("Inspection Recording", function () {
    let contract;
    let owner, inspector1;

    beforeEach(async function () {
        [owner, inspector1] = await ethers.getSigners();

        const PrivacyQualityInspection = await ethers.getContractFactory("PrivacyQualityInspection");
        contract = await PrivacyQualityInspection.deploy();
        await contract.deployed();

        // Authorize inspector
        await contract.authorizeInspector(inspector1.address);
    });

    it("Should record a valid inspection", async function () {
        const inspection = {
            qualityScore: 85,
            defectCount: 2,
            productBatch: 1001,
            productCategory: "Electronics"
        };

        await expect(
            contract.connect(inspector1).recordInspection(
                inspection.qualityScore,
                inspection.defectCount,
                inspection.productBatch,
                inspection.productCategory
            )
        ).to.emit(contract, 'InspectionRecorded')
         .withArgs(0, inspector1.address, inspection.productCategory, await ethers.provider.getBlockNumber());

        expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should reject invalid quality score", async function () {
        await expect(
            contract.connect(inspector1).recordInspection(
                101,  // Invalid: > 100
                2,
                1001,
                "Electronics"
            )
        ).to.be.revertedWith("Score exceeds maximum");
    });

    it("Should reject empty category", async function () {
        await expect(
            contract.connect(inspector1).recordInspection(
                85,
                2,
                1001,
                ""  // Invalid: empty string
            )
        ).to.be.revertedWith("Category required");
    });

    it("Should track inspector history", async function () {
        // Record multiple inspections
        for (let i = 0; i < 3; i++) {
            await contract.connect(inspector1).recordInspection(
                80 + i,
                i,
                1001 + i,
                "Electronics"
            );
        }

        // Check history
        const count = await contract.getInspectorHistoryCount(inspector1.address);
        expect(count).to.equal(3);

        // Get paginated results
        const inspections = await contract.getInspectorInspections(
            inspector1.address,
            0,
            2
        );
        expect(inspections.length).to.equal(2);
    });
});
```

## Advanced Patterns

### Example 1: Batch Processing

**Scenario**: Record multiple inspections efficiently

```javascript
async function recordBatchInspections(inspections) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < inspections.length; i++) {
        const inspection = inspections[i];

        try {
            console.log(`Recording inspection ${i + 1}/${inspections.length}...`);

            const tx = await contract.recordInspection(
                inspection.qualityScore,
                inspection.defectCount,
                inspection.productBatch,
                inspection.productCategory,
                { gasLimit: 500000 }
            );

            // Wait for confirmation
            const receipt = await tx.wait();

            results.push({
                index: i,
                status: 'success',
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            });

            successCount++;
            console.log(`✓ Inspection ${i + 1} recorded`);

            // Small delay between transactions
            if (i < inspections.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

        } catch (error) {
            results.push({
                index: i,
                status: 'failed',
                error: error.message,
                inspection: inspection
            });

            failureCount++;
            console.error(`✗ Inspection ${i + 1} failed:`, error.message);
        }
    }

    return {
        total: inspections.length,
        successful: successCount,
        failed: failureCount,
        results: results
    };
}

// Usage
const inspections = [
    { qualityScore: 85, defectCount: 2, productBatch: 1001, productCategory: "Electronics" },
    { qualityScore: 92, defectCount: 1, productBatch: 1002, productCategory: "Electronics" },
    { qualityScore: 78, defectCount: 3, productBatch: 2001, productCategory: "Automotive" },
];

const batchResult = await recordBatchInspections(inspections);
console.log(`Batch processing complete: ${batchResult.successful}/${batchResult.total} successful`);
```

### Example 2: Event Monitoring

**Scenario**: Listen for all inspection events in real-time

```javascript
async function setupEventMonitoring() {
    console.log("Setting up event monitoring...");

    // Listen for inspection recordings
    contract.on("InspectionRecorded", (inspectionId, inspector, category, timestamp) => {
        console.log(`📊 New inspection recorded:
            ID: ${inspectionId}
            Inspector: ${inspector.slice(0, 6)}...${inspector.slice(-4)}
            Category: ${category}
            Time: ${new Date(timestamp * 1000).toLocaleString()}`);
    });

    // Listen for verifications
    contract.on("InspectionVerified", (inspectionId, verifier) => {
        console.log(`✅ Inspection ${inspectionId} verified by ${verifier.slice(0, 6)}...${verifier.slice(-4)}`);
    });

    // Listen for inspector authorizations
    contract.on("InspectorAuthorized", (inspector, authorizer) => {
        console.log(`🔐 Inspector ${inspector.slice(0, 6)}...${inspector.slice(-4)} authorized`);
    });

    // Listen for metrics updates
    contract.on("MetricsUpdated", (category, totalCount) => {
        console.log(`📈 Metrics updated for ${category}: ${totalCount} inspections`);
    });

    console.log("Event monitoring active...");
}

// Usage
await setupEventMonitoring();

// Stop listening when done
function stopEventMonitoring() {
    contract.removeAllListeners();
    console.log("Event monitoring stopped.");
}
```

## Common Workflows

### Workflow 1: Complete Quality Inspection Process

```javascript
async function completeInspectionProcess() {
    console.log("=== Starting Complete Inspection Process ===\n");

    // Step 1: Connect wallet
    console.log("Step 1: Connecting wallet...");
    await connectWallet();
    console.log("✓ Connected\n");

    // Step 2: Record inspection
    console.log("Step 2: Recording quality inspection...");
    const inspectionReceipt = await contract.recordInspection(
        85,                  // Quality score
        2,                   // Defects
        1001,                // Batch number
        "Electronics"        // Category
    );
    console.log(`✓ Recorded with TX: ${inspectionReceipt.transactionHash}\n`);

    // Step 3: Get inspection ID
    const inspectionId = (await contract.inspectionCount()) - 1;
    console.log(`Inspection ID: ${inspectionId}\n`);

    // Step 4: Retrieve inspection info
    console.log("Step 3: Retrieving inspection information...");
    const inspectionInfo = await contract.getInspectionInfo(inspectionId);
    console.log(`✓ Inspector: ${inspectionInfo.inspector}`);
    console.log(`✓ Category: ${inspectionInfo.productCategory}`);
    console.log(`✓ Verified: ${inspectionInfo.isVerified}\n`);

    // Step 5: Verify inspection (from different account)
    console.log("Step 4: Verifying inspection (from different inspector)...");
    // This would be done by a different account in practice
    console.log("(Skipping in demo - requires different account)\n");

    // Step 6: Calculate metrics
    console.log("Step 5: Calculating category metrics...");
    await contract.calculateCategoryMetrics("Electronics");
    console.log("✓ Metrics calculated\n");

    console.log("=== Process Complete ===");
}

// Run workflow
await completeInspectionProcess();
```

---

*These examples demonstrate common patterns and best practices for using the Privacy-Preserving Quality Inspection System.*
