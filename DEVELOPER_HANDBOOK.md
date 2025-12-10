# Developer Handbook
## Adding New Examples & Maintaining the FHEVM Example Hub

This guide explains how to add new FHEVM examples, update dependencies, and maintain the project for future versions.

---

## 📚 Table of Contents

1. [Adding a New Example](#adding-a-new-example)
2. [Example Structure](#example-structure)
3. [Documentation Standards](#documentation-standards)
4. [Testing Requirements](#testing-requirements)
5. [Automation Tools](#automation-tools)
6. [Updating Dependencies](#updating-dependencies)
7. [Version Management](#version-management)
8. [Best Practices](#best-practices)

---

## 🆕 Adding a New Example

### Method 1: Using the Generator (Recommended)

```bash
npx ts-node scripts/create-fhevm-example.ts \
  --name YourExample \
  --category basic \
  --description "Description of your example"
```

This creates:
- Complete directory structure
- Template contract
- Template tests
- Package.json
- README template

### Method 2: Manual Creation

1. **Create Directory**
```bash
mkdir -p examples/your-example/{contracts,test,scripts}
```

2. **Copy Base Template**
```bash
cp -r base-template/* examples/your-example/
```

3. **Customize Files**
- Update contract name
- Modify test suite
- Edit README
- Update package.json

---

## 📁 Example Structure

Every example must follow this structure:

```
examples/your-example/
├── contracts/
│   └── YourContract.sol          # Main contract
├── test/
│   └── YourContract.test.ts      # Test suite
├── scripts/
│   └── deploy.ts                 # Deployment script
├── hardhat.config.ts             # Hardhat configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── README.md                     # Documentation
```

### File Requirements

#### ✅ Must Have
- `contracts/*.sol` - At least one Solidity contract
- `test/*.test.ts` - Comprehensive test suite
- `scripts/deploy.ts` - Deployment script
- `README.md` - Complete documentation
- `package.json` - With all dependencies

#### 🔄 Optional
- Multiple contracts
- Multiple test files
- Helper scripts
- Additional documentation

---

## 📝 Documentation Standards

### README.md Template

Every example README must include:

```markdown
# [Example Name]

Brief description (1-2 sentences)

## 📚 Chapter: [Category]

This example demonstrates:
- Key concept 1
- Key concept 2
- Key concept 3

## 🎯 Learning Objectives

After completing this example, you will understand:
1. Objective 1
2. Objective 2
3. Objective 3

## 🔐 Key Concepts

### [Main Concept]
Detailed explanation...

## 📖 Smart Contract

Code snippets and explanations...

## 🧪 Testing

Test commands and expected results...

## 🚀 Quick Start

Step-by-step setup instructions...

## 🔍 Comparison: Regular vs FHE

Side-by-side comparison...

## ⚠️ Important Notes

Important caveats and warnings...

## 🎓 Next Steps

Suggested next examples...

## 📚 Related Examples

Links to related examples...

## 🔗 Resources

External resources...

---

**Category**: [Easy/Medium/Hard]
**Difficulty**: [Beginner/Intermediate/Advanced]
**Time**: [X] minutes
```

### Contract Documentation

Use JSDoc-style comments:

```solidity
/**
 * @title ContractName
 * @notice Brief description
 * @dev Implementation details
 *
 * @chapter [Category Name]
 *
 * Key Concepts:
 * - Concept 1
 * - Concept 2
 *
 * Learn how to:
 * - Skill 1
 * - Skill 2
 */
contract Example {
    /**
     * @notice What this function does
     * @param paramName Description of parameter
     * @return Description of return value
     *
     * @dev Implementation notes
     * Important details about gas costs, edge cases, etc.
     */
    function exampleFunction(uint256 paramName) external returns (uint256) {
        // Implementation
    }
}
```

### Test Documentation

Include descriptive test names and comments:

```typescript
/**
 * @title ContractName Test Suite
 * @notice Comprehensive tests for ContractName
 *
 * Test Coverage:
 * - Deployment
 * - Core functionality
 * - Edge cases
 * - Gas usage
 */
describe("ContractName", function () {
  describe("Feature Group", function () {
    it("Should perform specific action correctly", async function () {
      // Test implementation
    });
  });
});
```

---

## 🧪 Testing Requirements

### Minimum Test Coverage

Every example must have:

✅ **Deployment Tests**
```typescript
describe("Deployment", function () {
  it("Should deploy successfully");
  it("Should initialize state correctly");
});
```

✅ **Core Functionality Tests**
```typescript
describe("Core Functions", function () {
  it("Should perform main operation");
  it("Should handle edge cases");
  it("Should revert on invalid input");
});
```

✅ **Access Control Tests** (if applicable)
```typescript
describe("Access Control", function () {
  it("Should allow authorized users");
  it("Should deny unauthorized users");
});
```

✅ **Event Tests**
```typescript
describe("Events", function () {
  it("Should emit correct events");
});
```

✅ **Gas Usage Tests**
```typescript
describe("Gas Usage", function () {
  it("Should estimate gas for operations");
});
```

### Testing Best Practices

1. **Test Naming**: Use clear, descriptive names
```typescript
// Good
it("Should increment counter by specified value")

// Bad
it("Test increment")
```

2. **Test Organization**: Group related tests
```typescript
describe("Feature", function () {
  describe("Sub-feature", function () {
    it("Specific test");
  });
});
```

3. **Assertions**: Use specific matchers
```typescript
// Good
expect(value).to.equal(expected);
expect(tx).to.emit(contract, "EventName");

// Avoid
expect(value).to.be.ok;
```

4. **Edge Cases**: Test boundaries
```typescript
it("Should handle zero value");
it("Should handle maximum value");
it("Should handle empty input");
```

---

## 🤖 Automation Tools

### create-fhevm-example.ts

Generates standalone example repositories.

**Usage:**
```bash
npx ts-node scripts/create-fhevm-example.ts \
  --name ExampleName \
  --category basic \
  --description "Your description"
```

**Options:**
- `--name`: Example name (required)
- `--category`: basic|encryption|decryption|access-control|advanced
- `--description`: Brief description

### generate-docs.ts

Auto-generates API documentation from code.

**Usage:**
```bash
npx ts-node scripts/generate-docs.ts
```

**Features:**
- Extracts JSDoc comments
- Generates Markdown files
- Creates API reference
- Builds index

### create-fhevm-category.ts

Creates category-based project collections.

**Usage:**
```bash
npx ts-node scripts/create-fhevm-category.ts --category basic
```

**Categories:**
- `basic`: Counter, arithmetic, equality
- `encryption`: Single/multiple value encryption
- `decryption`: User/public decryption
- `access-control`: Allow patterns, RBAC
- `advanced`: Blind auction, voting

---

## 🔄 Updating Dependencies

### When to Update

Update dependencies when:
- New FHEVM version released
- Security vulnerabilities found
- New Hardhat features needed
- Solidity compiler updates

### Update Process

1. **Check Current Versions**
```bash
npm outdated
```

2. **Update FHEVM**
```bash
npm install @fhevm/solidity@latest
```

3. **Update Hardhat**
```bash
npm install --save-dev hardhat@latest
```

4. **Test All Examples**
```bash
cd examples
for dir in */; do
  cd "$dir"
  npm install
  npm test
  cd ..
done
```

5. **Update Documentation**
- Update version numbers in README
- Update code examples if APIs changed
- Update deployment instructions

### Version Compatibility

Maintain compatibility matrix:

| FHEVM | Solidity | Hardhat | Status |
|-------|----------|---------|--------|
| 0.3.0 | ^0.8.24  | ^2.17.0 | ✅ Current |
| 0.2.x | ^0.8.20  | ^2.14.0 | ⚠️ Legacy |

---

## 🏷️ Version Management

### Semantic Versioning

Follow semver for all packages:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Updating Example Versions

When updating an example:

```json
{
  "version": "1.2.3",  // Increment appropriately
  "dependencies": {
    "@fhevm/solidity": "^0.3.0"  // Update when needed
  }
}
```

### Changelog

Maintain CHANGELOG.md:

```markdown
# Changelog

## [1.2.0] - 2025-12-15

### Added
- New example: Blind Auction
- Gas optimization in Counter

### Changed
- Updated FHEVM to 0.3.0
- Improved test coverage

### Fixed
- Bug in arithmetic example
```

---

## ✅ Best Practices

### Code Quality

1. **Solidity Style**
```solidity
// Use clear variable names
euint32 private encryptedValue;  // Good
euint32 private ev;              // Bad

// Comment FHE operations
euint32 result = FHE.add(a, b);  // Add encrypted values
```

2. **TypeScript Style**
```typescript
// Use descriptive names
async function deployCounter(): Promise<Contract>  // Good
async function deploy(): Promise<any>              // Bad

// Add types
let counter: Contract;  // Good
let counter;            // Bad
```

3. **Gas Optimization**
```solidity
// Cache storage reads
euint32 cachedValue = _count;  // Read once
result = FHE.add(cachedValue, newValue);

// Use appropriate data types
euint8 smallValue;   // 0-255
euint32 mediumValue; // Larger range
```

### Security

1. **Input Validation**
```solidity
require(value <= MAX_VALUE, "Value too large");
require(bytes(category).length > 0, "Empty category");
```

2. **Access Control**
```solidity
modifier onlyAuthorized() {
    require(authorized[msg.sender], "Not authorized");
    _;
}
```

3. **FHE Permissions**
```solidity
FHE.allowThis(encryptedValue);  // Contract access
FHE.allow(encryptedValue, user); // User access
```

### Documentation

1. **Keep README Updated**
- Update after any code changes
- Include recent examples
- Fix broken links

2. **Maintain Code Comments**
- Explain complex logic
- Document FHE operations
- Note gas costs

3. **Update Tests**
- Add tests for new features
- Update assertions when behavior changes
- Document test coverage

---

## 🔧 Maintenance Checklist

### Weekly
- [ ] Check for dependency updates
- [ ] Review new issues
- [ ] Test examples still work
- [ ] Update documentation if needed

### Monthly
- [ ] Run full test suite
- [ ] Update dependencies
- [ ] Review and update documentation
- [ ] Check for FHEVM updates

### Per Release
- [ ] Update all examples
- [ ] Run comprehensive tests
- [ ] Update version numbers
- [ ] Create changelog entry
- [ ] Tag release in git

---

## 📞 Getting Help

### Resources
- **FHEVM Docs**: https://docs.zama.ai
- **Hardhat Docs**: https://hardhat.org
- **Community Forum**: https://www.zama.ai/community

### Contributing
See CONTRIBUTING.md for:
- Code of conduct
- Pull request process
- Issue reporting
- Development setup

---

**Maintain quality. Document thoroughly. Test extensively. Build privacy-first!** 🚀
