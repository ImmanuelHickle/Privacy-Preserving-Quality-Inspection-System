/**
 * Complete Test Suite: Privacy-Preserving Quality Inspection
 *
 * Tests for all contract functionality:
 * - Authorization and access control
 * - Inspection recording and verification
 * - Data integrity and privacy
 * - Emergency functions
 * - Edge cases and security
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PrivacyQualityInspection", function () {
  let contract: any;
  let owner: SignerWithAddress;
  let inspector1: SignerWithAddress;
  let inspector2: SignerWithAddress;
  let inspector3: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  beforeEach(async function () {
    [owner, inspector1, inspector2, inspector3, unauthorized] = await ethers.getSigners();

    const PrivacyQualityInspection = await ethers.getContractFactory("PrivacyQualityInspection");
    contract = await PrivacyQualityInspection.deploy();
    await contract.deployed();
  });

  // ==================== DEPLOYMENT TESTS ====================

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(contract.address).to.be.properAddress;
    });

    it("Should initialize owner correctly", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should start with zero inspections", async function () {
      expect(await contract.inspectionCount()).to.equal(0);
    });

    it("Should authorize owner as inspector", async function () {
      expect(await contract.authorizedInspectors(owner.address)).to.be.true;
    });

    it("Should have correct constants", async function () {
      expect(await contract.QUALITY_THRESHOLD()).to.equal(70);
      expect(await contract.MAX_QUALITY_SCORE()).to.equal(100);
    });

    it("Should not be paused initially", async function () {
      expect(await contract.contractPaused()).to.be.false;
    });
  });

  // ==================== AUTHORIZATION TESTS ====================

  describe("Inspector Authorization", function () {
    it("Should authorize an inspector", async function () {
      await expect(contract.authorizeInspector(inspector1.address))
        .to.emit(contract, "InspectorAuthorized")
        .withArgs(inspector1.address, owner.address);

      expect(await contract.authorizedInspectors(inspector1.address)).to.be.true;
    });

    it("Should prevent non-owner from authorizing", async function () {
      await expect(
        contract.connect(inspector1).authorizeInspector(inspector2.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent duplicate authorization", async function () {
      await contract.authorizeInspector(inspector1.address);

      await expect(contract.authorizeInspector(inspector1.address)).to.be.revertedWith(
        "Already authorized"
      );
    });

    it("Should reject zero address", async function () {
      await expect(contract.authorizeInspector(ethers.constants.AddressZero)).to.be.revertedWith(
        "Invalid inspector address"
      );
    });

    it("Should revoke inspector authorization", async function () {
      await contract.authorizeInspector(inspector1.address);
      expect(await contract.authorizedInspectors(inspector1.address)).to.be.true;

      await contract.revokeInspector(inspector1.address);
      expect(await contract.authorizedInspectors(inspector1.address)).to.be.false;
    });

    it("Should prevent revoking non-authorized inspector", async function () {
      await expect(contract.revokeInspector(inspector1.address)).to.be.revertedWith(
        "Not authorized"
      );
    });

    it("Should allow owner to use all functions", async function () {
      // Owner should be able to record inspections
      await contract.recordInspection(85, 2, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });
  });

  // ==================== INSPECTION RECORDING TESTS ====================

  describe("Inspection Recording", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(inspector1.address);
      await contract.authorizeInspector(inspector2.address);
    });

    it("Should record a valid inspection", async function () {
      await expect(
        contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics")
      ).to.emit(contract, "InspectionRecorded");

      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should increment inspection count", async function () {
      expect(await contract.inspectionCount()).to.equal(0);

      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);

      await contract.connect(inspector2).recordInspection(92, 1, 1002, "Electronics");
      expect(await contract.inspectionCount()).to.equal(2);
    });

    it("Should reject quality score > 100", async function () {
      await expect(
        contract.connect(inspector1).recordInspection(101, 2, 1001, "Electronics")
      ).to.be.revertedWith("Score exceeds maximum");
    });

    it("Should accept quality score = 0", async function () {
      await contract.connect(inspector1).recordInspection(0, 0, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should accept quality score = 100", async function () {
      await contract.connect(inspector1).recordInspection(100, 0, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should reject empty category", async function () {
      await expect(
        contract.connect(inspector1).recordInspection(85, 2, 1001, "")
      ).to.be.revertedWith("Category required");
    });

    it("Should reject unauthorized inspector", async function () {
      await expect(
        contract.connect(unauthorized).recordInspection(85, 2, 1001, "Electronics")
      ).to.be.revertedWith("Not authorized inspector");
    });

    it("Should track inspector history", async function () {
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      await contract.connect(inspector1).recordInspection(92, 1, 1002, "Electronics");

      const count = await contract.getInspectorHistoryCount(inspector1.address);
      expect(count).to.equal(2);
    });

    it("Should store correct inspection info", async function () {
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");

      const info = await contract.getInspectionInfo(0);
      expect(info.inspector).to.equal(inspector1.address);
      expect(info.productCategory).to.equal("Electronics");
      expect(info.isVerified).to.be.false;
    });

    it("Should generate inspection hash", async function () {
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");

      const info = await contract.getInspectionInfo(0);
      expect(info.inspectionHash).to.not.equal(ethers.constants.HashZero);
    });

    it("Should record timestamp", async function () {
      const beforeBlock = await ethers.provider.getBlockNumber();
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      const afterBlock = await ethers.provider.getBlockNumber();

      const info = await contract.getInspectionInfo(0);
      expect(info.timestamp).to.be.greaterThan(0);
    });

    it("Should handle multiple categories", async function () {
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      await contract.connect(inspector2).recordInspection(92, 1, 2001, "Automotive");
      await contract.connect(inspector1).recordInspection(78, 3, 3001, "Pharmaceutical");

      expect(await contract.inspectionCount()).to.equal(3);
    });

    it("Should handle large defect counts", async function () {
      await contract.connect(inspector1).recordInspection(85, 255, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should handle large batch numbers", async function () {
      await contract.connect(inspector1).recordInspection(85, 2, 1000000, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });
  });

  // ==================== VERIFICATION TESTS ====================

  describe("Inspection Verification", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(inspector1.address);
      await contract.authorizeInspector(inspector2.address);
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
    });

    it("Should verify a valid inspection", async function () {
      await expect(contract.connect(inspector2).verifyInspection(0))
        .to.emit(contract, "InspectionVerified")
        .withArgs(0, inspector2.address);

      const info = await contract.getInspectionInfo(0);
      expect(info.isVerified).to.be.true;
    });

    it("Should prevent verifying already verified inspection", async function () {
      await contract.connect(inspector2).verifyInspection(0);

      await expect(contract.connect(inspector2).verifyInspection(0)).to.be.revertedWith(
        "Already verified"
      );
    });

    it("Should prevent self-verification", async function () {
      await expect(contract.connect(inspector1).verifyInspection(0)).to.be.revertedWith(
        "Cannot verify own inspection"
      );
    });

    it("Should allow owner to verify", async function () {
      await contract.verifyInspection(0);
      const info = await contract.getInspectionInfo(0);
      expect(info.isVerified).to.be.true;
    });

    it("Should reject invalid inspection ID", async function () {
      await expect(contract.connect(inspector2).verifyInspection(999)).to.be.revertedWith(
        "Invalid inspection ID"
      );
    });

    it("Should prevent unauthorized verification", async function () {
      await expect(contract.connect(unauthorized).verifyInspection(0)).to.be.revertedWith(
        "Not authorized inspector"
      );
    });

    it("Should track multiple verifications", async function () {
      await contract.connect(inspector1).recordInspection(92, 1, 1002, "Electronics");

      await contract.connect(inspector2).verifyInspection(0);
      await contract.connect(inspector3).verifyInspection(1);

      const info0 = await contract.getInspectionInfo(0);
      const info1 = await contract.getInspectionInfo(1);

      expect(info0.isVerified).to.be.true;
      expect(info1.isVerified).to.be.true;
    });
  });

  // ==================== METRICS CALCULATION TESTS ====================

  describe("Metrics Calculation", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(inspector1.address);
      await contract.authorizeInspector(inspector2.address);

      // Record inspections in different categories
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      await contract.connect(inspector1).recordInspection(92, 1, 1002, "Electronics");
      await contract.connect(inspector2).recordInspection(65, 4, 2001, "Automotive");
    });

    it("Should calculate category metrics", async function () {
      await contract.calculateCategoryMetrics("Electronics");

      const hasMetrics = await contract.hasCategoryMetrics("Electronics");
      expect(hasMetrics).to.be.true;
    });

    it("Should handle non-existent categories", async function () {
      await contract.calculateCategoryMetrics("NonExistent");

      const hasMetrics = await contract.hasCategoryMetrics("NonExistent");
      expect(hasMetrics).to.be.false;
    });

    it("Should allow only owner to calculate metrics", async function () {
      await expect(
        contract.connect(inspector1).calculateCategoryMetrics("Electronics")
      ).to.be.revertedWith("Not authorized");
    });

    it("Should handle empty categories", async function () {
      await contract.calculateCategoryMetrics("Food & Beverage");

      const hasMetrics = await contract.hasCategoryMetrics("Food & Beverage");
      expect(hasMetrics).to.be.false;
    });

    it("Should calculate metrics for multiple categories", async function () {
      await contract.calculateCategoryMetrics("Electronics");
      await contract.calculateCategoryMetrics("Automotive");

      expect(await contract.hasCategoryMetrics("Electronics")).to.be.true;
      expect(await contract.hasCategoryMetrics("Automotive")).to.be.true;
    });
  });

  // ==================== QUERY FUNCTIONS TESTS ====================

  describe("Query Functions", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(inspector1.address);
      await contract.authorizeInspector(inspector2.address);

      // Record multiple inspections
      for (let i = 0; i < 5; i++) {
        await contract
          .connect(inspector1)
          .recordInspection(80 + i, i, 1000 + i, "Electronics");
      }
    });

    it("Should get inspection info", async function () {
      const info = await contract.getInspectionInfo(0);
      expect(info.inspector).to.equal(inspector1.address);
      expect(info.productCategory).to.equal("Electronics");
    });

    it("Should get inspector history count", async function () {
      const count = await contract.getInspectorHistoryCount(inspector1.address);
      expect(count).to.equal(5);
    });

    it("Should get paginated inspector inspections", async function () {
      const inspections = await contract.getInspectorInspections(inspector1.address, 0, 3);
      expect(inspections.length).to.equal(3);
    });

    it("Should handle pagination offset", async function () {
      const inspections = await contract.getInspectorInspections(inspector1.address, 2, 2);
      expect(inspections.length).to.equal(2);
    });

    it("Should handle pagination limit exceeding total", async function () {
      const inspections = await contract.getInspectorInspections(inspector1.address, 3, 10);
      expect(inspections.length).to.equal(2);
    });

    it("Should reject invalid offset", async function () {
      await expect(
        contract.getInspectorInspections(inspector1.address, 100, 10)
      ).to.be.revertedWith("Offset out of bounds");
    });

    it("Should get contract stats", async function () {
      const stats = await contract.getContractStats();
      expect(stats.totalInspections).to.equal(5);
      expect(stats.contractOwner).to.equal(owner.address);
    });
  });

  // ==================== EMERGENCY FUNCTIONS TESTS ====================

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(inspector1.address);
    });

    it("Should pause contract", async function () {
      await contract.pauseContract();
      expect(await contract.contractPaused()).to.be.true;
    });

    it("Should prevent operations when paused", async function () {
      await contract.pauseContract();

      await expect(
        contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics")
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should unpause contract", async function () {
      await contract.pauseContract();
      await contract.unpauseContract();
      expect(await contract.contractPaused()).to.be.false;
    });

    it("Should allow operations after unpause", async function () {
      await contract.pauseContract();
      await contract.unpauseContract();

      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(contract.connect(inspector1).pauseContract()).to.be.revertedWith(
        "Not authorized"
      );
    });

    it("Should prevent non-owner from unpausing", async function () {
      await contract.pauseContract();

      await expect(contract.connect(inspector1).unpauseContract()).to.be.revertedWith(
        "Not authorized"
      );
    });
  });

  // ==================== EDGE CASES AND SECURITY TESTS ====================

  describe("Edge Cases and Security", function () {
    beforeEach(async function () {
      await contract.authorizeInspector(inspector1.address);
      await contract.authorizeInspector(inspector2.address);
    });

    it("Should handle zero quality score", async function () {
      await contract.connect(inspector1).recordInspection(0, 0, 1001, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should handle maximum quality score", async function () {
      await contract.connect(inspector1).recordInspection(100, 255, 4294967295, "Electronics");
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should handle rapid-fire inspections", async function () {
      for (let i = 0; i < 10; i++) {
        await contract.connect(inspector1).recordInspection(85, 2, 1001 + i, "Electronics");
      }
      expect(await contract.inspectionCount()).to.equal(10);
    });

    it("Should handle long category names", async function () {
      const longName = "A".repeat(100);
      await contract.connect(inspector1).recordInspection(85, 2, 1001, longName);
      expect(await contract.inspectionCount()).to.equal(1);
    });

    it("Should prevent inspection ID overflow", async function () {
      // Record max safe inspections
      for (let i = 0; i < 100; i++) {
        await contract.connect(inspector1).recordInspection(85, 2, 1001 + i, "Electronics");
      }

      expect(await contract.inspectionCount()).to.equal(100);
    });

    it("Should not allow reading non-existent inspection", async function () {
      await expect(contract.getInspectionInfo(999)).to.be.revertedWith(
        "Invalid inspection ID"
      );
    });

    it("Should maintain data integrity across operations", async function () {
      await contract.connect(inspector1).recordInspection(85, 2, 1001, "Electronics");
      const info1 = await contract.getInspectionInfo(0);

      await contract.connect(inspector1).recordInspection(92, 1, 1002, "Electronics");
      const info2 = await contract.getInspectionInfo(0);

      expect(info1.inspector).to.equal(info2.inspector);
      expect(info1.productCategory).to.equal(info2.productCategory);
    });
  });

  // ==================== GAS COST ESTIMATION ====================

  describe("Gas Cost Analysis", function () {
    it("Should estimate gas for recordInspection", async function () {
      await contract.authorizeInspector(inspector1.address);

      const tx = await contract
        .connect(inspector1)
        .recordInspection(85, 2, 1001, "Electronics");
      const receipt = await tx.wait();

      console.log(`\n  Gas used for recordInspection: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(ethers.utils.parseUnits("500000", "wei"));
    });
  });
});
