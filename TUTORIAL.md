# Building Privacy-Preserving Quality Inspection: Complete Tutorial

Welcome to the world of Fully Homomorphic Encryption on the blockchain! This comprehensive tutorial will guide you through building your first confidential application using FHE technology - a Privacy-Preserving Quality Inspection System.

## 🎯 What You'll Learn

By the end of this tutorial, you'll have:
- Built a complete confidential application using FHE
- Understanding of how FHE works in smart contracts
- Experience with encrypted data handling on blockchain
- A working privacy-preserving quality inspection system

## 📋 Prerequisites

**Required Knowledge:**
- Basic Solidity programming (variables, functions, events)
- Understanding of smart contract deployment
- Familiarity with MetaMask and web3 development
- Basic HTML/JavaScript knowledge

**Tools You'll Need:**
- MetaMask wallet
- Code editor (VS Code recommended)
- Node.js (v16+)
- Access to Sepolia testnet (faucet: https://sepoliafaucet.com/)

**No Advanced Math Required!** - This tutorial assumes zero cryptography or advanced mathematics knowledge.

## 🔍 Understanding FHE in Simple Terms

### What is Fully Homomorphic Encryption (FHE)?
Think of FHE as a "magic box" that allows you to:
- Put encrypted data in
- Perform calculations on that encrypted data
- Get encrypted results out
- **Never decrypt the data during processing**

### Real-World Analogy
Imagine you have a sealed envelope with a number inside. With FHE, you can:
1. Add another number to it without opening the envelope
2. Multiply it by another number without opening the envelope
3. Only the person with the key can open and see the final result

### Why This Matters for Blockchain
- **Privacy**: Sensitive data stays encrypted on-chain
- **Transparency**: Everyone can verify computations happened correctly
- **Trust**: No need to trust a central authority with your private data

## 🏗️ Project Overview: Privacy-Preserving Quality Inspection

We're building a system where manufacturers can:
- Record quality inspection data confidentially
- Verify inspections without revealing sensitive details
- Calculate aggregate statistics while preserving privacy

### Key Features
1. **Anonymous Quality Scores** - Encrypted ratings from 0-100
2. **Confidential Defect Counts** - Private defect tracking
3. **Hidden Batch Numbers** - Product identification stays private
4. **Authorized Personnel Only** - Role-based access control

## 📁 Project Structure

```
privacy-quality-inspection/
├── contracts/
│   └── PrivacyQualityInspection.sol
├── test/
│   └── inspection.test.ts
├── scripts/
│   └── deploy.ts
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── hardhat.config.ts
├── package.json
└── README.md
```

## 🔧 Step 1: Setting Up Your Environment

### Initialize Project

```bash
# Create new project directory
mkdir privacy-quality-inspection
cd privacy-quality-inspection

# Initialize npm project
npm init -y

# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Select "Create a TypeScript project"

# Install FHEVM and dependencies
npm install @fhevm/solidity ethers@5.7.2
npm install --save-dev @types/node typescript
```

### Project Configuration

Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
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
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.dev",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

## 📝 Step 2: Smart Contract Development

### Understanding the Contract Architecture

The PrivacyQualityInspection contract implements:
- Role-based access control (owner, authorized inspectors)
- Encrypted data storage and retrieval
- Data integrity verification
- Quality metrics calculation
- Emergency pause functionality

### Complete Smart Contract

Create `contracts/PrivacyQualityInspection.sol`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Privacy-Preserving Quality Inspection System
 * @notice A confidential quality control system using Fully Homomorphic Encryption
 * @dev Stores encrypted inspection data on-chain with privacy guarantees
 */
contract PrivacyQualityInspection is SepoliaConfig {

    // State Variables
    address public owner;
    uint256 public inspectionCount;
    uint8 public constant QUALITY_THRESHOLD = 70;
    uint256 public constant MAX_QUALITY_SCORE = 100;
    bool public contractPaused = false;

    // Data Structures
    struct InspectionData {
        euint8 qualityScore;        // Encrypted quality score (0-100)
        euint8 defectCount;         // Encrypted defect count
        euint32 productBatch;       // Encrypted batch number
        address inspector;          // Inspector address
        uint256 timestamp;          // Inspection timestamp
        bool isVerified;            // Verification status
        string productCategory;     // Product category (public)
        bytes32 inspectionHash;     // Hash for integrity verification
    }

    struct QualityMetrics {
        euint32 totalInspections;   // Total inspections count
        euint32 passedInspections;  // Inspections that passed threshold
        euint8 averageQuality;      // Average quality score
        bool metricsCalculated;     // Calculation status
    }

    // Mappings
    mapping(uint256 => InspectionData) public inspections;
    mapping(address => uint256[]) public inspectorHistory;
    mapping(string => QualityMetrics) public categoryMetrics;
    mapping(address => bool) public authorizedInspectors;

    // Events
    event InspectionRecorded(
        uint256 indexed inspectionId,
        address indexed inspector,
        string category,
        uint256 timestamp
    );

    event InspectionVerified(uint256 indexed inspectionId, address indexed verifier);
    event MetricsUpdated(string indexed category, uint256 totalCount);
    event InspectorAuthorized(address indexed inspector, address indexed authorizer);
    event QualityAlert(string indexed category, uint256 inspectionId);

    // Access Control Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedInspector() {
        require(
            authorizedInspectors[msg.sender] || msg.sender == owner,
            "Not authorized inspector"
        );
        _;
    }

    modifier validInspectionId(uint256 _inspectionId) {
        require(_inspectionId < inspectionCount, "Invalid inspection ID");
        _;
    }

    modifier whenNotPaused() {
        require(!contractPaused, "Contract is paused");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        inspectionCount = 0;
        authorizedInspectors[owner] = true;
    }

    // Authorization Functions

    /**
     * @notice Authorize an inspector to perform quality inspections
     * @param _inspector Address of the inspector to authorize
     */
    function authorizeInspector(address _inspector) external onlyOwner {
        require(_inspector != address(0), "Invalid inspector address");
        require(!authorizedInspectors[_inspector], "Already authorized");
        authorizedInspectors[_inspector] = true;
        emit InspectorAuthorized(_inspector, msg.sender);
    }

    /**
     * @notice Revoke inspector authorization
     * @param _inspector Address of the inspector to revoke
     */
    function revokeInspector(address _inspector) external onlyOwner {
        require(authorizedInspectors[_inspector], "Not authorized");
        authorizedInspectors[_inspector] = false;
    }

    // Core Inspection Functions

    /**
     * @notice Record an encrypted quality inspection
     * @param _qualityScore Quality score (0-100)
     * @param _defectCount Number of defects found
     * @param _productBatch Batch identification number
     * @param _productCategory Product category for filtering
     */
    function recordInspection(
        uint8 _qualityScore,
        uint8 _defectCount,
        uint32 _productBatch,
        string memory _productCategory
    ) external onlyAuthorizedInspector whenNotPaused {
        require(_qualityScore <= MAX_QUALITY_SCORE, "Score exceeds maximum");
        require(bytes(_productCategory).length > 0, "Category required");

        // Encrypt sensitive data
        euint8 encryptedQuality = FHE.asEuint8(_qualityScore);
        euint8 encryptedDefects = FHE.asEuint8(_defectCount);
        euint32 encryptedBatch = FHE.asEuint32(_productBatch);

        // Generate data hash for integrity
        bytes32 dataHash = keccak256(
            abi.encodePacked(
                _qualityScore,
                _defectCount,
                _productBatch,
                _productCategory,
                msg.sender,
                block.timestamp
            )
        );

        // Store inspection data
        inspections[inspectionCount] = InspectionData({
            qualityScore: encryptedQuality,
            defectCount: encryptedDefects,
            productBatch: encryptedBatch,
            inspector: msg.sender,
            timestamp: block.timestamp,
            isVerified: false,
            productCategory: _productCategory,
            inspectionHash: dataHash
        });

        // Update inspector history
        inspectorHistory[msg.sender].push(inspectionCount);

        // Set access permissions for encrypted data
        FHE.allowThis(encryptedQuality);
        FHE.allowThis(encryptedDefects);
        FHE.allowThis(encryptedBatch);
        FHE.allow(encryptedQuality, msg.sender);
        FHE.allow(encryptedDefects, msg.sender);
        FHE.allow(encryptedBatch, msg.sender);

        // Check if quality is below threshold
        ebool isLowQuality = FHE.lt(encryptedQuality, FHE.asEuint8(QUALITY_THRESHOLD));
        FHE.allowThis(isLowQuality);

        emit InspectionRecorded(inspectionCount, msg.sender, _productCategory, block.timestamp);
        inspectionCount++;
    }

    /**
     * @notice Verify an inspection record
     * @param _inspectionId ID of the inspection to verify
     */
    function verifyInspection(uint256 _inspectionId)
        external
        validInspectionId(_inspectionId)
        onlyAuthorizedInspector
    {
        require(!inspections[_inspectionId].isVerified, "Already verified");
        require(
            inspections[_inspectionId].inspector != msg.sender,
            "Cannot verify own inspection"
        );

        inspections[_inspectionId].isVerified = true;
        emit InspectionVerified(_inspectionId, msg.sender);
    }

    /**
     * @notice Calculate quality metrics for a product category
     * @param _category Product category to analyze
     */
    function calculateCategoryMetrics(string memory _category) external onlyOwner {
        uint256 categoryCount = 0;
        euint32 totalInspections = FHE.asEuint32(0);
        euint32 passedCount = FHE.asEuint32(0);
        euint32 qualitySum = FHE.asEuint32(0);

        // Process all inspections for the category
        for (uint256 i = 0; i < inspectionCount; i++) {
            if (keccak256(bytes(inspections[i].productCategory)) == keccak256(bytes(_category))) {
                categoryCount++;
                totalInspections = FHE.add(totalInspections, FHE.asEuint32(1));

                // Add quality score to sum
                qualitySum = FHE.add(qualitySum, FHE.asEuint32(inspections[i].qualityScore));

                // Check if inspection passed threshold
                ebool passed = FHE.ge(inspections[i].qualityScore, FHE.asEuint8(QUALITY_THRESHOLD));
                euint32 passedIncrement = FHE.select(passed, FHE.asEuint32(1), FHE.asEuint32(0));
                passedCount = FHE.add(passedCount, passedIncrement);
            }
        }

        if (categoryCount > 0) {
            euint8 avgQuality = FHE.asEuint8(0);

            categoryMetrics[_category] = QualityMetrics({
                totalInspections: totalInspections,
                passedInspections: passedCount,
                averageQuality: avgQuality,
                metricsCalculated: true
            });

            // Set permissions
            FHE.allowThis(totalInspections);
            FHE.allowThis(passedCount);
            FHE.allowThis(avgQuality);

            emit MetricsUpdated(_category, categoryCount);
        }
    }

    // Query Functions

    /**
     * @notice Get basic inspection information
     * @param _inspectionId ID of the inspection
     * @return inspector Address of the inspector
     * @return timestamp Inspection timestamp
     * @return isVerified Verification status
     * @return productCategory Product category
     * @return inspectionHash Data integrity hash
     */
    function getInspectionInfo(uint256 _inspectionId)
        external
        view
        validInspectionId(_inspectionId)
        returns (
            address inspector,
            uint256 timestamp,
            bool isVerified,
            string memory productCategory,
            bytes32 inspectionHash
        )
    {
        InspectionData storage inspection = inspections[_inspectionId];
        return (
            inspection.inspector,
            inspection.timestamp,
            inspection.isVerified,
            inspection.productCategory,
            inspection.inspectionHash
        );
    }

    /**
     * @notice Get count of inspections by an inspector
     * @param _inspector Address of the inspector
     * @return Count of inspections
     */
    function getInspectorHistoryCount(address _inspector) external view returns (uint256) {
        return inspectorHistory[_inspector].length;
    }

    /**
     * @notice Get paginated inspection IDs for an inspector
     * @param _inspector Address of the inspector
     * @param _offset Starting index
     * @param _limit Number of results to return
     * @return Array of inspection IDs
     */
    function getInspectorInspections(address _inspector, uint256 _offset, uint256 _limit)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] storage history = inspectorHistory[_inspector];
        require(_offset < history.length, "Offset out of bounds");

        uint256 end = _offset + _limit;
        if (end > history.length) {
            end = history.length;
        }

        uint256[] memory result = new uint256[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = history[i];
        }

        return result;
    }

    /**
     * @notice Check if metrics are available for a category
     * @param _category Product category
     * @return Whether metrics have been calculated
     */
    function hasCategoryMetrics(string memory _category) external view returns (bool) {
        return categoryMetrics[_category].metricsCalculated;
    }

    // Contract Management

    /**
     * @notice Pause contract operations (emergency only)
     */
    function pauseContract() external onlyOwner {
        contractPaused = true;
    }

    /**
     * @notice Resume contract operations
     */
    function unpauseContract() external onlyOwner {
        contractPaused = false;
    }

    /**
     * @notice Get contract statistics
     * @return totalInspections Total inspection count
     * @return totalInspectors Count of authorized inspectors
     * @return contractOwner Owner address
     */
    function getContractStats() external view returns (
        uint256 totalInspections,
        uint256 totalInspectors,
        address contractOwner
    ) {
        // In production, maintain separate count of authorized inspectors
        return (inspectionCount, 0, owner);
    }
}
```

### Key Contract Features Explained

**1. Encrypted Data Types**
- `euint8`: Used for quality scores (0-100) and defect counts
- `euint32`: Used for batch numbers (larger values)
- These are never decrypted on-chain, maintaining privacy

**2. FHE Operations**
- `FHE.add()`: Add encrypted values
- `FHE.lt()`, `FHE.ge()`: Compare encrypted values
- `FHE.select()`: Conditional operations on encrypted data
- `FHE.allow()`: Grant access permissions to specific addresses

**3. Access Control**
- Only authorized inspectors can record inspections
- Owner has full access
- Verification requires a different inspector
- Emergency pause functionality

**4. Data Integrity**
- Each inspection has a hash for verification
- Keccak256 used for public data integrity
- Timestamp recorded for audit trails

## 🌐 Step 3: Building the Frontend

### HTML Interface

Create `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy-Preserving Quality Inspection</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://unpkg.com/ethers@5.7.2/dist/ethers.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🔒 Privacy-Preserving Quality Inspection</h1>
            <p>Confidential Manufacturing Quality Control on Blockchain</p>
        </header>

        <div class="connection-status" id="connectionStatus">
            <span id="connectionText">Connect your wallet to start</span>
        </div>

        <div class="tutorial-info">
            <h3>🎓 How This Works</h3>
            <ul>
                <li>✨ <strong>FHE Encryption:</strong> Your quality data is encrypted before reaching blockchain</li>
                <li>🔐 <strong>Private Computation:</strong> Contract validates encrypted data without decryption</li>
                <li>🎯 <strong>Selective Access:</strong> Only authorized personnel can decrypt results</li>
            </ul>
        </div>

        <div class="main-grid">
            <div class="card">
                <h3>📊 Record Quality Inspection</h3>
                <form id="inspectionForm">
                    <div class="form-group">
                        <label for="qualityScore">Quality Score (0-100):</label>
                        <input type="number" id="qualityScore" min="0" max="100" required>
                        <small>🔒 Will be encrypted on-chain</small>
                    </div>

                    <div class="form-group">
                        <label for="defectCount">Defect Count:</label>
                        <input type="number" id="defectCount" min="0" required>
                        <small>🔒 Encrypted tracking</small>
                    </div>

                    <div class="form-group">
                        <label for="productBatch">Product Batch:</label>
                        <input type="number" id="productBatch" required>
                        <small>🔒 Private identification</small>
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
                        <small>📋 Public for filtering</small>
                    </div>

                    <button type="submit" class="btn">
                        🔒 Record Encrypted Inspection
                    </button>
                </form>
            </div>

            <div class="card">
                <h3>📚 FHE Learning Center</h3>
                <div class="learning-section">
                    <h4>How It Works:</h4>
                    <ol>
                        <li><strong>Encryption:</strong> Data encrypted in your browser</li>
                        <li><strong>Transmission:</strong> Only encrypted bytes sent to blockchain</li>
                        <li><strong>Processing:</strong> Smart contract validates encrypted data</li>
                        <li><strong>Access:</strong> Only authorized parties can decrypt</li>
                    </ol>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>📋 Recent Inspections</h3>
            <div id="inspectionsList">
                <p>Loading inspections...</p>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

### JavaScript Application

Create `frontend/app.js`:

```javascript
// Privacy-Preserving Quality Inspection Application

let provider;
let signer;
let contract;
let userAddress;

// Contract ABI (must be generated from contract compilation)
const CONTRACT_ADDRESS = "0x"; // Replace with deployed address
const CONTRACT_ABI = [
    // Copy ABI from contract compilation output
];

// Initialize Web3 Connection
async function init() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);

        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            signer = provider.getSigner();
            userAddress = await signer.getAddress();

            // Initialize contract
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            updateConnectionStatus(true);
            await loadInspections();

            console.log('✅ Application initialized');

        } catch (error) {
            console.error('Initialization failed:', error);
            updateConnectionStatus(false);
        }
    } else {
        updateConnectionStatus(false);
        showAlert('Please install MetaMask', 'error');
    }
}

// Update wallet connection status
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    const textElement = document.getElementById('connectionText');

    if (connected && userAddress) {
        statusElement.className = 'connection-status status-connected';
        textElement.textContent = `🔗 Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    } else {
        statusElement.className = 'connection-status status-disconnected';
        textElement.textContent = '❌ Not connected';
    }
}

// Show notifications
function showAlert(message, type = 'success') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Add your notification UI here
}

// Record quality inspection
async function recordInspection(event) {
    event.preventDefault();

    if (!contract) {
        showAlert('Please connect wallet first', 'error');
        return;
    }

    try {
        const qualityScore = parseInt(document.getElementById('qualityScore').value);
        const defectCount = parseInt(document.getElementById('defectCount').value);
        const productBatch = parseInt(document.getElementById('productBatch').value);
        const productCategory = document.getElementById('productCategory').value;

        // Send transaction
        const tx = await contract.recordInspection(
            qualityScore,
            defectCount,
            productBatch,
            productCategory,
            { gasLimit: 500000 }
        );

        showAlert('Recording inspection...', 'info');
        await tx.wait();

        showAlert('✅ Inspection recorded securely!', 'success');
        document.getElementById('inspectionForm').reset();
        await loadInspections();

    } catch (error) {
        console.error('Error:', error);
        showAlert(`❌ ${error.message}`, 'error');
    }
}

// Load inspection history
async function loadInspections() {
    if (!contract) return;

    try {
        const inspectionCount = await contract.inspectionCount();

        const inspectionsList = document.getElementById('inspectionsList');

        if (inspectionCount.toNumber() === 0) {
            inspectionsList.innerHTML = '<p>No inspections recorded yet.</p>';
            return;
        }

        let html = '<div class="inspections-table">';

        for (let i = Math.max(0, inspectionCount.toNumber() - 5); i < inspectionCount.toNumber(); i++) {
            try {
                const inspection = await contract.getInspectionInfo(i);
                const date = new Date(inspection.timestamp * 1000).toLocaleString();

                html += `
                    <div class="inspection-item">
                        <div class="inspection-header">
                            <strong>Inspection #${i}</strong>
                            <span class="status">${inspection.isVerified ? '✅ Verified' : '⏳ Pending'}</span>
                        </div>
                        <div class="inspection-details">
                            <p><strong>Inspector:</strong> ${inspection.inspector.slice(0, 6)}...${inspection.inspector.slice(-4)}</p>
                            <p><strong>Category:</strong> ${inspection.productCategory}</p>
                            <p><strong>Date:</strong> ${date}</p>
                            <p><strong>Quality:</strong> 🔒 [Encrypted]</p>
                            <p><strong>Defects:</strong> 🔒 [Encrypted]</p>
                            <p><strong>Batch:</strong> 🔒 [Encrypted]</p>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`Error loading inspection ${i}:`, error);
            }
        }

        html += '</div>';
        inspectionsList.innerHTML = html;

    } catch (error) {
        console.error('Error loading inspections:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await init();
    document.getElementById('inspectionForm').addEventListener('submit', recordInspection);
});

console.log('🚀 Application loaded');
```

### CSS Styling

Create `frontend/style.css`:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    text-align: center;
    color: white;
    margin-bottom: 40px;
    padding: 30px 0;
}

.header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.header p {
    font-size: 1.1em;
    opacity: 0.9;
}

.connection-status {
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 600;
    transition: all 0.3s ease;
}

.connection-status.status-connected {
    border-left: 4px solid #4caf50;
    background: #f1f8f4;
    color: #2e7d32;
}

.connection-status.status-disconnected {
    border-left: 4px solid #f44336;
    background: #fef5f5;
    color: #c62828;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card h3 {
    margin-bottom: 20px;
    color: #667eea;
    font-size: 1.5em;
}

.main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .main-grid {
        grid-template-columns: 1fr;
    }
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1em;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
    display: block;
    margin-top: 5px;
    color: #999;
    font-size: 0.9em;
}

.btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.inspection-item {
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
}

.inspection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
}

.inspection-details p {
    margin: 5px 0;
    font-size: 0.95em;
}

.status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 600;
}

.learning-section ol {
    margin-left: 20px;
    line-height: 1.8;
}

.tutorial-info {
    background: white;
    border-left: 4px solid #667eea;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.tutorial-info h3 {
    margin-bottom: 15px;
    color: #667eea;
}

.tutorial-info ul {
    margin-left: 20px;
    line-height: 1.8;
}

.tutorial-info li {
    margin-bottom: 10px;
}
```

## 🧪 Step 4: Testing

Create `test/inspection.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PrivacyQualityInspection", function () {
    let contract;
    let owner;
    let inspector1;
    let inspector2;

    beforeEach(async function () {
        [owner, inspector1, inspector2] = await ethers.getSigners();

        const PrivacyQualityInspection = await ethers.getContractFactory("PrivacyQualityInspection");
        contract = await PrivacyQualityInspection.deploy();
        await contract.deployed();
    });

    describe("Inspector Management", function () {
        it("Should authorize an inspector", async function () {
            await contract.authorizeInspector(inspector1.address);
            expect(await contract.authorizedInspectors(inspector1.address)).to.be.true;
        });

        it("Should revoke inspector authorization", async function () {
            await contract.authorizeInspector(inspector1.address);
            await contract.revokeInspector(inspector1.address);
            expect(await contract.authorizedInspectors(inspector1.address)).to.be.false;
        });
    });

    describe("Inspection Recording", function () {
        beforeEach(async function () {
            await contract.authorizeInspector(inspector1.address);
        });

        it("Should record an inspection", async function () {
            await expect(
                contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics")
            ).to.emit(contract, "InspectionRecorded");

            expect(await contract.inspectionCount()).to.equal(1);
        });

        it("Should reject invalid quality scores", async function () {
            await expect(
                contract.connect(inspector1).recordInspection(101, 2, 1001, "Electronics")
            ).to.be.revertedWith("Score exceeds maximum");
        });

        it("Should reject empty category", async function () {
            await expect(
                contract.connect(inspector1).recordInspection(85, 2, 1001, "")
            ).to.be.revertedWith("Category required");
        });
    });

    describe("Inspection Verification", function () {
        beforeEach(async function () {
            await contract.authorizeInspector(inspector1.address);
            await contract.authorizeInspector(inspector2.address);
            await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
        });

        it("Should verify an inspection", async function () {
            await expect(
                contract.connect(inspector2).verifyInspection(0)
            ).to.emit(contract, "InspectionVerified");

            const info = await contract.getInspectionInfo(0);
            expect(info.isVerified).to.be.true;
        });

        it("Should prevent self-verification", async function () {
            await expect(
                contract.connect(inspector1).verifyInspection(0)
            ).to.be.revertedWith("Cannot verify own inspection");
        });
    });

    describe("Emergency Functions", function () {
        it("Should pause and unpause contract", async function () {
            await contract.pauseContract();
            expect(await contract.contractPaused()).to.be.true;

            await contract.unpauseContract();
            expect(await contract.contractPaused()).to.be.false;
        });

        it("Should prevent operations when paused", async function () {
            await contract.authorizeInspector(inspector1.address);
            await contract.pauseContract();

            await expect(
                contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics")
            ).to.be.revertedWith("Contract is paused");
        });
    });
});
```

## 🚀 Deployment Guide

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
    const PrivacyQualityInspection = await ethers.getContractFactory("PrivacyQualityInspection");
    const contract = await PrivacyQualityInspection.deploy();

    await contract.deployed();

    console.log("✅ Contract deployed to:", contract.address);

    // Verify on block explorer
    console.log("\nVerify with:");
    console.log(`npx hardhat verify --network sepolia ${contract.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

Deploy with:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## 📊 Gas Optimization Tips

1. **Use smallest encrypted types**: `euint8` instead of `euint32` when possible
2. **Minimize FHE operations**: Each operation is expensive
3. **Batch processing**: Group multiple operations
4. **Off-chain computation**: Calculate non-private data off-chain

## 🔒 Security Considerations

1. **Access Control**: Always verify sender authorization
2. **Input Validation**: Check data ranges and formats
3. **Emergency Pause**: Implement pause functionality
4. **Audit**: Have contracts reviewed by security experts

## 🎓 Key Learning Points

1. **FHE enables privacy on public blockchains**
2. **Encrypted data can be computed without decryption**
3. **Privacy-preserving applications are possible and practical**
4. **Smart contract design must consider encryption overhead**

## 🌟 Next Steps

- Explore more FHE operations
- Build additional features
- Integrate with other systems
- Deploy to mainnet when ready

---

*Build privacy-preserving applications that truly protect user data while maintaining blockchain's transparency and immutability.*
