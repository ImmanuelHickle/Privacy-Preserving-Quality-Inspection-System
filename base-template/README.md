# FHEVM Example Base Template

This is the base template for creating FHEVM example repositories. It provides a minimal, clean Hardhat setup that can be customized for specific FHE concepts and examples.

## Quick Start

```bash
npm install
npm run compile
npm test
npm run deploy
```

## Project Structure

```
├── contracts/
│   └── Example.sol           # Your FHE smart contract
├── test/
│   └── Example.test.ts       # Test suite
├── scripts/
│   └── deploy.ts             # Deployment script
├── hardhat.config.ts         # Hardhat configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Development

### Compile
```bash
npm run compile
```

### Test
```bash
npm test
npm run test:gas    # With gas reporting
npm run coverage    # Coverage report
```

### Deploy
```bash
npm run deploy              # Deploy to Sepolia
npm run deploy:local        # Deploy locally
npm run verify              # Verify on Etherscan
```

## Key Concepts

This template demonstrates:
- Solidity smart contracts with FHE
- Encrypted data types (euint8, euint32)
- FHE operations (add, compare, conditional)
- Access control patterns
- Test-driven development

## Learn More

- FHEVM Docs: https://docs.zama.ai
- Hardhat: https://hardhat.org
- Solidity: https://docs.soliditylang.org

## Next Steps

1. Implement your contract in `contracts/Example.sol`
2. Write tests in `test/Example.test.ts`
3. Deploy using `npm run deploy`
4. Update documentation in this README

---

Part of the Privacy-Preserving Quality Inspection System - FHEVM Example Hub
