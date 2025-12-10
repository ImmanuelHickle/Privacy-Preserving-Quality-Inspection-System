# FHEVM Examples Index

Complete collection of standalone FHEVM example repositories demonstrating privacy-preserving smart contracts.

## 📚 Example Categories

### 🔰 Basic Operations
**Difficulty**: Beginner | **Time**: 15-20 minutes each

#### 1. Encrypted Counter
**Path**: `counter/`
**Concepts**: euint32, FHE.add, FHE.sub, access control

A simple encrypted counter demonstrating:
- Encrypted state variables
- Basic FHE arithmetic (add, subtract)
- Access permission management
- Event emission with encrypted operations

**Start here** if you're new to FHEVM!

#### 2. Arithmetic Operations
**Path**: `arithmetic/`
**Concepts**: FHE.add, FHE.sub, FHE.mul, euint8, euint32

Demonstrates all basic arithmetic operations:
- Addition of encrypted values
- Subtraction with underflow handling
- Multiplication of encrypted values
- Multiple encrypted data types

#### 3. Equality Comparison
**Path**: `equality/`
**Concepts**: FHE.eq, ebool, conditional logic

Shows how to compare encrypted values:
- Equality checks (FHE.eq)
- Boolean operations with ebool
- Conditional logic with encrypted data
- Access control based on comparisons

---

### 🔐 Encryption Patterns
**Difficulty**: Beginner-Intermediate | **Time**: 20-30 minutes each

#### 4. Single Value Encryption
**Path**: `single-encryption/`
**Concepts**: Input encryption, external inputs, input proofs

Learn how to encrypt user inputs:
- Client-side encryption
- Input proof validation
- Converting external inputs to euint
- Secure input handling

#### 5. Multiple Value Encryption
**Path**: `multi-encryption/`
**Concepts**: Batch encryption, multiple euints, efficient handling

Handle multiple encrypted values:
- Encrypting multiple inputs
- Batch operations
- Optimizing gas costs
- Managing multiple encrypted states

---

### 🔓 Decryption Patterns
**Difficulty**: Intermediate | **Time**: 25-35 minutes each

#### 6. User Decryption
**Path**: `user-decryption/`
**Concepts**: Permission-based decryption, user access

Implement user-based decryption:
- Granting decryption permissions
- User-specific access control
- Decryption requests
- Privacy preservation

#### 7. Public Decryption
**Path**: `public-decryption/`
**Concepts**: Public results, transparent computation

Make computation results public:
- When to use public decryption
- Trigger-based decryption
- Result verification
- Transparency vs privacy trade-offs

---

### 🛡️ Access Control
**Difficulty**: Intermediate-Advanced | **Time**: 30-40 minutes each

#### 8. FHE.allow Pattern
**Path**: `allow-pattern/`
**Concepts**: FHE.allow, permission grants, access lists

Master permission management:
- Granting access with FHE.allow
- Managing access lists
- Revoking permissions
- Multi-user scenarios

#### 9. FHE.allowThis Pattern
**Path**: `allowThis-pattern/`
**Concepts**: FHE.allowThis, contract self-access

Internal contract access:
- Contract accessing its own encrypted data
- When to use allowThis
- Combining with user permissions
- Best practices

#### 10. Role-Based Access Control (RBAC)
**Path**: `rbac/`
**Concepts**: Roles, permissions, complex access patterns

Advanced access control:
- Multiple role types
- Role-based permissions
- Dynamic role assignment
- Enterprise-grade access control

---

### 🚀 Advanced Patterns
**Difficulty**: Advanced | **Time**: 45-60 minutes each

#### 11. Blind Auction
**Path**: `blind-auction/`
**Concepts**: Encrypted bids, winner determination, privacy

Build a complete blind auction:
- Private bid submission
- Encrypted bid comparison
- Winner determination without revealing bids
- Auction state management

#### 12. Confidential Voting
**Path**: `confidential-voting/`
**Concepts**: Anonymous voting, tally calculation, privacy

Implement private voting:
- Anonymous vote submission
- Encrypted vote counting
- Result tallying
- Sybil resistance

---

## 🎓 Learning Paths

### Path 1: Complete Beginner
```
1. Counter → 2. Arithmetic → 3. Equality → 4. Single Encryption
```
**Time**: ~2 hours | **Outcome**: Understand FHE basics

### Path 2: Application Developer
```
1. Counter → 4. Single Encryption → 6. User Decryption → 8. Allow Pattern
```
**Time**: ~2.5 hours | **Outcome**: Build simple FHE apps

### Path 3: Security Focused
```
8. Allow Pattern → 9. AllowThis Pattern → 10. RBAC → 6. User Decryption
```
**Time**: ~3 hours | **Outcome**: Master access control

### Path 4: Advanced Developer
```
All examples in order → Build your own application
```
**Time**: ~6-8 hours | **Outcome**: Full FHEVM expertise

---

## 📋 Quick Reference

### By Difficulty

**Easy** (15-20 min each)
- Counter
- Arithmetic
- Single Encryption

**Medium** (25-35 min each)
- Equality
- Multi Encryption
- User Decryption
- Public Decryption
- Allow Pattern
- AllowThis Pattern

**Hard** (40-60 min each)
- RBAC
- Blind Auction
- Confidential Voting

### By Concept

**FHE Operations**
- Counter (add, sub)
- Arithmetic (add, sub, mul)
- Equality (eq, comparison)

**Data Types**
- Counter (euint32)
- Arithmetic (euint8, euint32)
- Equality (ebool)

**Access Control**
- Allow Pattern
- AllowThis Pattern
- RBAC
- User Decryption

**Real-World Apps**
- Blind Auction
- Confidential Voting
- Quality Inspection (main project)

---

## 🛠️ Using These Examples

### Setup Any Example
```bash
cd examples/<example-name>
npm install
npm run compile
npm test
```

### Generate New Example
```bash
npx ts-node scripts/create-fhevm-example.ts --name MyExample --category basic
```

### Generate Category
```bash
npx ts-node scripts/create-fhevm-category.ts --category basic
```

---

## 📖 Documentation Structure

Each example includes:
- ✅ README.md with learning objectives
- ✅ Fully commented Solidity contract
- ✅ Comprehensive test suite
- ✅ Deployment scripts
- ✅ Usage examples
- ✅ Comparison with non-FHE version

---

## 🎯 Key Concepts Covered

### Chapter: Basic Operations
- Encrypted data types (euint8, euint32, ebool)
- Basic arithmetic (add, sub, mul)
- Comparisons (eq, lt, gt, le, ge)
- State management

### Chapter: Encryption
- Client-side encryption
- Input proofs
- External inputs (externalEuint)
- Batch operations

### Chapter: Decryption
- Permission management
- User-based access
- Public decryption
- Privacy trade-offs

### Chapter: Access Control
- FHE.allow() usage
- FHE.allowThis() pattern
- Role-based systems
- Complex permissions

### Chapter: Advanced
- Real-world applications
- State machines
- Complex logic
- Production patterns

---

## 🔗 Additional Resources

- **Main Project**: Privacy-Preserving Quality Inspection System
- **Tutorial**: Complete step-by-step guide
- **Developer Guide**: API reference and architecture
- **FHEVM Docs**: https://docs.zama.ai

---

## 📊 Progress Tracking

Track your learning:
- [ ] Counter
- [ ] Arithmetic
- [ ] Equality
- [ ] Single Encryption
- [ ] Multi Encryption
- [ ] User Decryption
- [ ] Public Decryption
- [ ] Allow Pattern
- [ ] AllowThis Pattern
- [ ] RBAC
- [ ] Blind Auction
- [ ] Confidential Voting

---

**Part of the Privacy-Preserving Quality Inspection System - FHEVM Example Hub**

Build privacy-first applications with confidence! 🚀
