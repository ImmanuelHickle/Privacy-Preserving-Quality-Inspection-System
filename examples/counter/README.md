# FHE Counter Example

A simple encrypted counter demonstrating basic FHE operations with increment and decrement functionality.

## 📚 Chapter: Basic Operations

This example demonstrates:
- **Encrypted state variables** (euint32)
- **FHE arithmetic operations** (FHE.add, FHE.sub)
- **Access control** (FHE.allowThis, FHE.allow)
- **Basic contract structure**

## 🎯 Learning Objectives

After completing this example, you will understand:
1. How to declare encrypted state variables
2. How to perform arithmetic on encrypted values
3. How to manage access permissions for encrypted data
4. How to emit events with encrypted operations

## 🔐 Key Concepts

### Encrypted Counter
Unlike a regular counter that stores values in plaintext, this counter keeps all values encrypted on-chain using FHE. This means:
- The current count value is never visible on the blockchain
- Arithmetic operations happen on encrypted data
- Only authorized addresses can decrypt the value

### FHE Operations Used
- `FHE.asEuint32()` - Convert plaintext to encrypted value
- `FHE.add()` - Add encrypted values
- `FHE.sub()` - Subtract encrypted values
- `FHE.allowThis()` - Allow contract to access encrypted value
- `FHE.allow()` - Grant decryption permission to address

## 📖 Smart Contract

**File**: `contracts/EncryptedCounter.sol`

```solidity
// Key state variable
euint32 private _count;

// Increment operation
function increment(uint32 value) external {
    euint32 encryptedValue = FHE.asEuint32(value);
    _count = FHE.add(_count, encryptedValue);
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
}
```

## 🧪 Testing

**File**: `test/EncryptedCounter.test.ts`

Run tests:
```bash
npm test
```

Expected output:
```
  EncryptedCounter
    ✓ Should deploy successfully
    ✓ Should increment counter
    ✓ Should decrement counter
    ✓ Should handle multiple operations
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Compile contract
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy
```

## 📝 Usage Example

```javascript
// Deploy contract
const EncryptedCounter = await ethers.getContractFactory("EncryptedCounter");
const counter = await EncryptedCounter.deploy();

// Increment by 5
await counter.increment(5);

// Increment by 3 more
await counter.increment(3);

// Current encrypted count is now 8 (but encrypted on-chain)
```

## 🔍 Comparison: Regular vs FHE Counter

### Regular Counter
```solidity
uint32 private count;  // Visible on blockchain

function increment(uint32 value) external {
    count += value;    // Anyone can see the value
}
```

### FHE Counter
```solidity
euint32 private _count;  // Encrypted on blockchain

function increment(uint32 value) external {
    euint32 encrypted = FHE.asEuint32(value);
    _count = FHE.add(_count, encrypted);  // Operations on encrypted data
    FHE.allow(_count, msg.sender);        // Only authorized can decrypt
}
```

## ⚠️ Important Notes

1. **Gas Costs**: FHE operations are more expensive than regular arithmetic
2. **Overflow**: This example omits overflow checks for simplicity
3. **Access Control**: Use `FHE.allow()` to grant decryption permissions
4. **Testing**: FHE operations require special testing setup

## 🎓 Next Steps

- Try modifying the increment/decrement values
- Add a reset function
- Implement access control (only owner can increment)
- Explore the Arithmetic example for more FHE operations

## 📚 Related Examples

- **Arithmetic**: FHE add, subtract, multiply operations
- **Equality**: Comparing encrypted values
- **Access Control**: Advanced permission patterns

## 🔗 Resources

- [FHEVM Documentation](https://docs.zama.ai)
- [Solidity FHE Library](https://github.com/zama-ai/fhevm)
- [Full Tutorial](../../TUTORIAL.md)

---

**Category**: Basic
**Difficulty**: Easy
**Time**: 15 minutes

Part of the Privacy-Preserving Quality Inspection System - FHEVM Example Hub
