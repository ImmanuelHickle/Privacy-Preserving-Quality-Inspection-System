# Developer Guide: Privacy-Preserving Quality Inspection System

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contract API](#smart-contract-api)
3. [Frontend Integration](#frontend-integration)
4. [Testing & Deployment](#testing--deployment)
5. [Advanced Topics](#advanced-topics)
6. [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────┐
│         Web Frontend (HTML/JS)                  │
│  ┌─────────────────────────────────────────┐   │
│  │  MetaMask Wallet Integration            │   │
│  │  Form UI for Inspection Data            │   │
│  │  Real-time Status Display               │   │
│  └─────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────┘
               │ Web3 (Ethers.js)
               │ Encrypted Requests
               ▼
┌─────────────────────────────────────────────────┐
│      Ethereum Smart Contract                    │
│  ┌─────────────────────────────────────────┐   │
│  │  PrivacyQualityInspection.sol          │   │
│  │  - Role-based access control           │   │
│  │  - FHE encrypted data storage          │   │
│  │  - Inspection verification             │   │
│  │  - Metrics calculation                 │   │
│  └─────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────┘
               │ Blockchain Storage
               │ (Sepolia Testnet)
               ▼
┌─────────────────────────────────────────────────┐
│      Blockchain Network                         │
│  - Ethereum Sepolia Testnet                     │
│  - Gas: Sepolia Faucet                          │
│  - RPC: https://rpc.sepolia.dev                 │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input**: Quality inspection data entered in web form
2. **Encryption**: Data encrypted using FHE (client-side)
3. **Transaction**: Encrypted data sent to smart contract
4. **Validation**: Contract validates encrypted data
5. **Storage**: Encrypted data stored on-chain
6. **Retrieval**: Only authorized parties can decrypt

## Smart Contract API

### State Variables

```solidity
// Public State Variables
address public owner;                          // Contract owner address
uint256 public inspectionCount;               // Total inspections recorded
bool public contractPaused;                   // Contract pause status

// Constants
uint8 public constant QUALITY_THRESHOLD = 70; // Minimum quality score
uint256 public constant MAX_QUALITY_SCORE = 100;

// Mappings
mapping(uint256 => InspectionData) public inspections;
mapping(address => uint256[]) public inspectorHistory;
mapping(string => QualityMetrics) public categoryMetrics;
mapping(address => bool) public authorizedInspectors;
```

### Function Documentation

#### Authorization Functions

**`authorizeInspector(address _inspector)`**
- **Access**: Owner only
- **Parameters**:
  - `_inspector`: Address to authorize
- **Returns**: None
- **Events**: `InspectorAuthorized`
- **Description**: Authorizes an address to record inspections
- **Example**:
```javascript
await contract.authorizeInspector("0x1234...5678");
```

**`revokeInspector(address _inspector)`**
- **Access**: Owner only
- **Parameters**:
  - `_inspector`: Address to revoke
- **Returns**: None
- **Description**: Removes inspector authorization
- **Revert**: "Not authorized" if not previously authorized

#### Core Inspection Functions

**`recordInspection(uint8 _qualityScore, uint8 _defectCount, uint32 _productBatch, string memory _productCategory)`**
- **Access**: Authorized inspectors
- **Parameters**:
  - `_qualityScore`: Quality score (0-100)
  - `_defectCount`: Number of defects
  - `_productBatch`: Batch identification
  - `_productCategory`: Product category name
- **Returns**: None
- **Events**: `InspectionRecorded`
- **Gas**: ~500,000 units
- **Description**: Records encrypted inspection data
- **Constraints**:
  - Quality score must be ≤ 100
  - Category must be non-empty
  - Caller must be authorized
  - Contract must not be paused
- **Example**:
```javascript
await contract.recordInspection(85, 2, 1001, "Electronics");
```

**`verifyInspection(uint256 _inspectionId)`**
- **Access**: Authorized inspectors
- **Parameters**:
  - `_inspectionId`: ID of inspection to verify
- **Returns**: None
- **Events**: `InspectionVerified`
- **Description**: Verifies an inspection record
- **Constraints**:
  - Inspection must not already be verified
  - Verifier cannot be original inspector
  - Inspection ID must be valid
- **Example**:
```javascript
await contract.verifyInspection(0);
```

**`calculateCategoryMetrics(string memory _category)`**
- **Access**: Owner only
- **Parameters**:
  - `_category`: Product category to analyze
- **Returns**: None
- **Events**: `MetricsUpdated`
- **Description**: Calculates encrypted quality metrics
- **Computation**:
  - Total inspections count
  - Pass/fail counts
  - Average quality (simplified)
- **Example**:
```javascript
await contract.calculateCategoryMetrics("Electronics");
```

#### Query Functions

**`getInspectionInfo(uint256 _inspectionId)`**
- **Access**: Public (view)
- **Parameters**:
  - `_inspectionId`: Inspection ID
- **Returns**:
  ```solidity
  (
    address inspector,           // Inspector address
    uint256 timestamp,          // Inspection timestamp
    bool isVerified,            // Verification status
    string memory productCategory, // Category
    bytes32 inspectionHash      // Data integrity hash
  )
  ```
- **Description**: Returns non-encrypted inspection metadata

**`getInspectorHistoryCount(address _inspector)`**
- **Access**: Public (view)
- **Returns**: `uint256` - Count of inspections
- **Description**: Returns number of inspections by inspector

**`getInspectorInspections(address _inspector, uint256 _offset, uint256 _limit)`**
- **Access**: Public (view)
- **Parameters**:
  - `_inspector`: Inspector address
  - `_offset`: Starting index
  - `_limit`: Number of results
- **Returns**: `uint256[]` - Array of inspection IDs
- **Description**: Paginated inspection history

**`hasCategoryMetrics(string memory _category)`**
- **Access**: Public (view)
- **Returns**: `bool` - Whether metrics are available
- **Description**: Checks if metrics have been calculated

**`getContractStats()`**
- **Access**: Public (view)
- **Returns**:
  ```solidity
  (
    uint256 totalInspections,   // Total count
    uint256 totalInspectors,    // Inspector count
    address contractOwner       // Owner address
  )
  ```

#### Contract Management

**`pauseContract()`**
- **Access**: Owner only
- **Description**: Pauses all contract operations
- **Use Case**: Emergency situations

**`unpauseContract()`**
- **Access**: Owner only
- **Description**: Resumes contract operations

### Events

**`InspectionRecorded`**
```solidity
event InspectionRecorded(
    uint256 indexed inspectionId,
    address indexed inspector,
    string category,
    uint256 timestamp
);
```

**`InspectionVerified`**
```solidity
event InspectionVerified(
    uint256 indexed inspectionId,
    address indexed verifier
);
```

**`InspectorAuthorized`**
```solidity
event InspectorAuthorized(
    address indexed inspector,
    address indexed authorizer
);
```

**`MetricsUpdated`**
```solidity
event MetricsUpdated(
    string indexed category,
    uint256 totalCount
);
```

## Frontend Integration

### Initialization

```javascript
// Connect to Ethereum provider
const provider = new ethers.providers.Web3Provider(window.ethereum);
await window.ethereum.request({ method: 'eth_requestAccounts' });
const signer = provider.getSigner();

// Create contract instance
const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
);
```

### Recording Inspections

```javascript
async function recordInspection(qualityScore, defectCount, batch, category) {
    try {
        const tx = await contract.recordInspection(
            qualityScore,
            defectCount,
            batch,
            category,
            { gasLimit: 500000 }
        );

        const receipt = await tx.wait();
        console.log("Inspection recorded:", receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error("Recording failed:", error);
        throw error;
    }
}
```

### Reading Inspection Data

```javascript
async function loadInspection(inspectionId) {
    try {
        const info = await contract.getInspectionInfo(inspectionId);

        return {
            inspector: info.inspector,
            timestamp: new Date(info.timestamp * 1000),
            verified: info.isVerified,
            category: info.productCategory,
            hash: info.inspectionHash
        };
    } catch (error) {
        console.error("Load failed:", error);
        throw error;
    }
}
```

### Event Monitoring

```javascript
// Listen for inspection events
contract.on("InspectionRecorded", (inspectionId, inspector, category, timestamp) => {
    console.log(`Inspection ${inspectionId} recorded by ${inspector}`);
});

// Stop listening
contract.removeAllListeners("InspectionRecorded");
```

## Testing & Deployment

### Setting Up Test Environment

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers @fhevm/solidity

# Create hardhat project
npx hardhat init
```

### Running Tests

```bash
# All tests
npx hardhat test

# Specific test file
npx hardhat test test/inspection.test.ts

# With gas reporting
npx hardhat test --reporter json > test-results.json

# Coverage report
npx hardhat coverage
```

### Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Environment Configuration

Create `.env`:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.dev
ETHERSCAN_API_KEY=your_etherscan_key_here
```

## Advanced Topics

### FHE Operations Reference

**Arithmetic Operations**
```solidity
// Addition
result = FHE.add(a, b);

// Subtraction
result = FHE.sub(a, b);

// Multiplication
result = FHE.mul(a, b);
```

**Comparison Operations**
```solidity
// Less than
ebool result = FHE.lt(a, b);

// Greater than or equal
ebool result = FHE.ge(a, b);

// Equality
ebool result = FHE.eq(a, b);
```

**Conditional Operations**
```solidity
// If-then-else on encrypted values
result = FHE.select(condition, trueValue, falseValue);
```

### Access Control Patterns

**Role-Based Pattern**
```solidity
mapping(address => UserRole) public userRoles;

modifier onlyRole(UserRole role) {
    require(userRoles[msg.sender] == role, "Invalid role");
    _;
}
```

**Allowlist Pattern**
```solidity
mapping(address => bool) public allowlist;

modifier onlyAllowed() {
    require(allowlist[msg.sender], "Not allowed");
    _;
}
```

### Gas Optimization

1. **Use appropriate encrypted types**:
   - `euint8` for small values (0-255)
   - `euint32` for larger values
   - Saves gas compared to larger types

2. **Minimize FHE operations**:
   - Batch operations when possible
   - Pre-calculate non-private values

3. **Efficient storage**:
   - Use structs for related data
   - Pack variables by type

4. **View functions**:
   - Read-only operations don't cost gas
   - Use for data retrieval

### Custom Events

Add domain-specific events:
```solidity
event DefectAlert(
    uint256 indexed inspectionId,
    string category,
    uint8 defectThreshold
);
```

## Troubleshooting

### Common Issues

**Issue: "Not authorized inspector"**
- Solution: Call `authorizeInspector()` with address first

**Issue: "Quality score exceeds maximum"**
- Solution: Ensure quality score is 0-100

**Issue: Transaction reverted "Contract is paused"**
- Solution: Call `unpauseContract()` from owner account

**Issue: Low gas estimation**
- Solution: Use higher gasLimit (500,000+) for recordInspection

**Issue: MetaMask not connected**
- Solution: Check browser console, ensure Sepolia testnet selected

### Debugging

Enable Hardhat logging:
```bash
HARDHAT_VERBOSE=true npx hardhat test
```

Check transaction details:
```javascript
const receipt = await provider.getTransactionReceipt(txHash);
console.log("Gas used:", receipt.gasUsed.toString());
console.log("Status:", receipt.status);
```

### Performance Optimization

1. **Batch operations**: Record multiple inspections in sequence
2. **Cache data**: Store retrieved inspection data locally
3. **Pagination**: Use offset/limit for large datasets
4. **Event indexing**: Monitor events instead of polling

## Best Practices

1. **Security**:
   - Always validate input ranges
   - Check access permissions
   - Implement emergency pause

2. **Gas Efficiency**:
   - Minimize on-chain computation
   - Use appropriate data types
   - Batch transactions when possible

3. **User Experience**:
   - Provide clear feedback
   - Show transaction status
   - Explain gas costs

4. **Maintenance**:
   - Document all modifications
   - Test thoroughly before deployment
   - Monitor contract interactions

---

*For more information, see the main README and TUTORIAL files.*
