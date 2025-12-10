# Quick Start Guide

Get the Privacy-Preserving Quality Inspection System up and running in minutes.

## ⚡ 5-Minute Setup

### 1. Install Dependencies (2 min)
```bash
npm install
```

### 2. Compile Smart Contract (1 min)
```bash
npm run compile
```

### 3. Run Tests (2 min)
```bash
npm test
```

**Result**: All tests should pass ✓

---

## 📚 What's Next?

Choose your path:

### 🎓 Learning Path (Read First)
Start with understanding the basics:
1. Read **COMPETITION_README.md** (5 min) - Project overview
2. Read **TUTORIAL.md** (30 min) - Complete guide with examples
3. Review **EXAMPLES.md** (15 min) - Code patterns

### 👨‍💻 Developer Path (Code First)
Dive into the code:
1. Review **contracts/PrivacyQualityInspection.sol** (10 min)
2. Study **test/PrivacyQualityInspection.test.ts** (20 min)
3. Check **DEVELOPER_GUIDE.md** (15 min) - API reference

### 🚀 Deployment Path (Deploy First)
Get it on-chain:
1. Create `.env` file (copy from `.env.example`)
2. Add your SEPOLIA_RPC_URL and PRIVATE_KEY
3. Run `npm run deploy` (2-3 minutes)
4. Check deployment info

### 🎨 Frontend Path (Build UI)
Create the interface:
1. Review **frontend/index.html** (10 min)
2. Update **frontend/app.js** with contract address
3. Serve frontend: `python -m http.server 8000`
4. Open `http://localhost:8000` in browser

---

## 🛠️ Common Commands

### Development
```bash
npm run compile          # Compile contracts
npm run test            # Run all tests
npm run test:gas        # Tests with gas report
npm run coverage        # Test coverage report
npm run clean           # Clean build artifacts
```

### Deployment
```bash
npm run deploy          # Deploy to Sepolia testnet
npm run deploy:local    # Deploy to local network
npm run verify          # Verify on Etherscan
```

### Generation Tools
```bash
npm run generate:docs       # Generate API documentation
npm run generate:examples   # Generate example projects
npm run generate:category   # Generate category projects
```

### Using Makefile
```bash
make help               # Show all commands
make compile            # Compile contracts
make test               # Run tests
make deploy             # Deploy to Sepolia
```

---

## 📋 File Guide

### Start With These:
1. **README.md** or **COMPETITION_README.md** - Project overview
2. **TUTORIAL.md** - Step-by-step learning guide
3. **DEVELOPER_GUIDE.md** - Technical reference

### Then Explore:
4. **contracts/PrivacyQualityInspection.sol** - Smart contract
5. **test/PrivacyQualityInspection.test.ts** - Test examples
6. **scripts/deploy.ts** - Deployment script
7. **frontend/** - Web interface

### Reference:
8. **EXAMPLES.md** - Code patterns
9. **COMPARISON.md** - Traditional vs FHE
10. **SUBMISSION_GUIDE.md** - Competition checklist

### Complete Reference:
11. **PROJECT_STRUCTURE.md** - Directory overview
12. **FILES_MANIFEST.md** - All files list
13. **DEPLOYMENT_INFO.md** - Deployment guide

---

## 🔧 Environment Setup

### Create `.env` File
Copy from template:
```bash
cp .env.example .env
```

Edit `.env`:
```
# Get from https://rpc.sepolia.dev or Alchemy
SEPOLIA_RPC_URL=https://rpc.sepolia.dev

# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_without_0x

# Get from https://etherscan.io/apis
ETHERSCAN_API_KEY=your_etherscan_key
```

### Get Testnet ETH
Get free ETH for testing:
- Sepolia Faucet: https://sepoliafaucet.com
- Need: 0.1 - 0.5 ETH for testing

---

## 🚀 First Deployment

### Step 1: Check Balance
Your account should have at least 0.1 ETH on Sepolia

### Step 2: Deploy
```bash
npm run deploy
```

### Step 3: Verify Output
You'll see:
- ✅ Contract deployed
- 📦 Contract address
- 📝 Deployment transaction
- 🔗 Block explorer link

### Step 4: Update Frontend
Copy contract address to `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "0x..."; // Your contract address
```

---

## 🧪 Testing Your Setup

### Run All Tests
```bash
npm test
```

Expected output:
```
  PrivacyQualityInspection
    ✓ Deployment
    ✓ Inspector Authorization
    ✓ Inspection Recording
    ✓ Verification
    ✓ Emergency Functions
    ... (40+ tests total)
```

### Generate Coverage Report
```bash
npm run coverage
```

Opens `coverage/index.html` with detailed coverage

### Gas Analysis
```bash
npm run test:gas
```

Shows gas usage for each function

---

## 🎯 Key Concepts

### FHE (Fully Homomorphic Encryption)
- Encrypt data BEFORE sending to blockchain
- Smart contract processes encrypted data
- Only authorized parties can decrypt
- Privacy is cryptographic, not trust-based

### Smart Contract Structure
```
PrivacyQualityInspection
├── Authorization: authorizeInspector()
├── Recording: recordInspection()
├── Verification: verifyInspection()
├── Analytics: calculateCategoryMetrics()
└── Emergency: pauseContract()
```

### Access Control
- Owner: Full control
- Authorized Inspectors: Record & verify inspections
- Public: Can view public data only

---

## ❓ Troubleshooting

### Issue: "Cannot find module '@fhevm/solidity'"
**Solution**:
```bash
npm install @fhevm/solidity
```

### Issue: "Insufficient funds"
**Solution**:
Get testnet ETH from faucet: https://sepoliafaucet.com

### Issue: Compilation errors
**Solution**:
```bash
npm run clean
npm install
npm run compile
```

### Issue: Tests failing
**Solution**:
```bash
npm install
npm run compile
npm test
```

### Issue: MetaMask not connecting
**Solution**:
- Switch to Sepolia network in MetaMask
- Ensure correct RPC URL: https://rpc.sepolia.dev
- Check browser console for errors

### More help:
See **DEVELOPER_GUIDE.md** Troubleshooting section

---

## 📖 Learning Resources

### Understanding FHE
- TUTORIAL.md - Complete guide (read this first!)
- COMPARISON.md - FHE vs Traditional systems
- Comments in contracts - Inline documentation

### Code Examples
- EXAMPLES.md - Common patterns
- test/ - Real test examples
- contracts/ - Well-commented code

### Advanced Topics
- DEVELOPER_GUIDE.md - Architecture & API
- scripts/ - Automation examples
- Zama Docs - https://docs.zama.ai

---

## ✨ What You Have

After setup, you have:

✅ **Smart Contract**
- FHE-based quality inspection system
- Role-based access control
- Privacy-preserving analytics
- Emergency pause function

✅ **Complete Tests**
- 40+ test cases
- All functionality covered
- Gas analysis included
- Security tests

✅ **Web Interface**
- Form to record inspections
- View inspection history
- Real-time status
- Educational content

✅ **Documentation**
- 8 comprehensive guides
- 50+ code examples
- API reference
- Troubleshooting help

✅ **Deployment Tools**
- Automated deployment script
- Etherscan verification
- Deployment tracking
- Block explorer links

✅ **Generation Tools**
- Example project generator
- Documentation auto-generation
- Category-based organization
- Learning path support

---

## 🎓 Next Steps

### Beginner
1. ✅ Understand FHE concepts (TUTORIAL.md)
2. ✅ Review smart contract code
3. ✅ Run tests and explore results
4. ✅ Read code examples (EXAMPLES.md)

### Intermediate
1. ✅ Deploy to testnet
2. ✅ Test frontend interface
3. ✅ Study test cases
4. ✅ Review API documentation

### Advanced
1. ✅ Customize smart contract
2. ✅ Create new examples
3. ✅ Extend functionality
4. ✅ Optimize gas usage

### Expert
1. ✅ Build custom applications
2. ✅ Integrate with other systems
3. ✅ Deploy to mainnet
4. ✅ Contribute improvements

---

## 💡 Pro Tips

### Tip 1: Use Makefile
```bash
make test       # Faster than npm run test
make deploy     # Simpler deployment
make help       # See all commands
```

### Tip 2: Check Gas Usage
```bash
npm run test:gas    # See function costs
```

### Tip 3: Read Code Comments
Every function has comments explaining FHE operations

### Tip 4: Run Tests First
Always test before deployment:
```bash
npm test && npm run deploy
```

### Tip 5: Save Deployment Info
After deploying, save the info in DEPLOYMENT_INFO.md

---

## 📞 Need Help?

1. **Quick Questions**: Check relevant README
2. **How-To**: See TUTORIAL.md or EXAMPLES.md
3. **API Reference**: Check DEVELOPER_GUIDE.md
4. **Issues**: See troubleshooting sections
5. **Community**: Join Zama Discord or Community Forum

---

## ✅ Checklist

- [ ] Install dependencies: `npm install`
- [ ] Compile: `npm run compile`
- [ ] Tests pass: `npm test`
- [ ] Read TUTORIAL.md
- [ ] Review smart contract code
- [ ] Create .env file
- [ ] Deploy: `npm run deploy`
- [ ] Check deployment info
- [ ] Test frontend (if using)
- [ ] Generate docs: `npm run generate:docs`

**Done! You're ready to go!** 🚀

---

## 🎉 Welcome!

You now have a complete, production-ready FHE-based quality inspection system.

**Key Achievements:**
- ✅ Smart contract deployed
- ✅ Tests passing
- ✅ Documentation ready
- ✅ Frontend functional
- ✅ Ready for submission

**Start building privacy-preserving applications today!**

---

*For detailed information on any topic, refer to the specific documentation files.*

**Questions?** Check the relevant guide:
- Project Overview → COMPETITION_README.md
- Learning → TUTORIAL.md
- Development → DEVELOPER_GUIDE.md
- Submission → SUBMISSION_GUIDE.md
- Structure → PROJECT_STRUCTURE.md
