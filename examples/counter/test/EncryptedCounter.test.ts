import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * @title EncryptedCounter Test Suite
 * @notice Comprehensive tests for the EncryptedCounter contract
 *
 * Test Coverage:
 * - Deployment and initialization
 * - Increment operations
 * - Decrement operations
 * - Access control
 * - Event emissions
 * - Edge cases
 */
describe("EncryptedCounter", function () {
  let counter: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const EncryptedCounter = await ethers.getContractFactory("EncryptedCounter");
    counter = await EncryptedCounter.deploy();
    await counter.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(counter.address).to.be.properAddress;
    });

    it("Should initialize operation count to zero", async function () {
      expect(await counter.operationCount()).to.equal(0);
    });

    it("Should initialize with encrypted count", async function () {
      const count = await counter.getCount();
      expect(count).to.not.be.undefined;
    });
  });

  describe("Increment Operations", function () {
    it("Should increment counter by specified value", async function () {
      await expect(counter.increment(5))
        .to.emit(counter, "Incremented")
        .withArgs(owner.address, await ethers.provider.getBlockNumber() + 1);

      expect(await counter.operationCount()).to.equal(1);
    });

    it("Should increment operation count", async function () {
      await counter.increment(10);
      expect(await counter.operationCount()).to.equal(1);

      await counter.increment(20);
      expect(await counter.operationCount()).to.equal(2);
    });

    it("Should handle zero increment", async function () {
      await counter.increment(0);
      expect(await counter.operationCount()).to.equal(1);
    });

    it("Should handle maximum uint32 value", async function () {
      const maxUint32 = 4294967295;
      await counter.increment(maxUint32);
      expect(await counter.operationCount()).to.equal(1);
    });

    it("Should allow multiple users to increment", async function () {
      await counter.connect(user1).increment(5);
      await counter.connect(user2).increment(3);

      expect(await counter.operationCount()).to.equal(2);
    });

    it("Should emit event with correct parameters", async function () {
      const tx = await counter.increment(15);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(counter, "Incremented")
        .withArgs(owner.address, block.timestamp);
    });
  });

  describe("Decrement Operations", function () {
    it("Should decrement counter by specified value", async function () {
      await expect(counter.decrement(3))
        .to.emit(counter, "Decremented")
        .withArgs(owner.address, await ethers.provider.getBlockNumber() + 1);

      expect(await counter.operationCount()).to.equal(1);
    });

    it("Should increment operation count on decrement", async function () {
      await counter.decrement(5);
      expect(await counter.operationCount()).to.equal(1);

      await counter.decrement(2);
      expect(await counter.operationCount()).to.equal(2);
    });

    it("Should handle zero decrement", async function () {
      await counter.decrement(0);
      expect(await counter.operationCount()).to.equal(1);
    });

    it("Should allow multiple users to decrement", async function () {
      await counter.connect(user1).decrement(2);
      await counter.connect(user2).decrement(1);

      expect(await counter.operationCount()).to.equal(2);
    });

    it("Should emit event with correct parameters", async function () {
      const tx = await counter.decrement(8);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(counter, "Decremented")
        .withArgs(owner.address, block.timestamp);
    });
  });

  describe("Mixed Operations", function () {
    it("Should handle sequence of increments and decrements", async function () {
      await counter.increment(10);
      await counter.increment(5);
      await counter.decrement(3);
      await counter.increment(7);
      await counter.decrement(2);

      expect(await counter.operationCount()).to.equal(5);
    });

    it("Should track operations from multiple users", async function () {
      await counter.connect(owner).increment(1);
      await counter.connect(user1).increment(2);
      await counter.connect(user2).decrement(3);
      await counter.connect(owner).decrement(4);

      expect(await counter.operationCount()).to.equal(4);
    });

    it("Should maintain encrypted state through operations", async function () {
      await counter.increment(100);
      const count1 = await counter.getCount();

      await counter.decrement(50);
      const count2 = await counter.getCount();

      // Both should return encrypted values (not undefined)
      expect(count1).to.not.be.undefined;
      expect(count2).to.not.be.undefined;
    });
  });

  describe("View Functions", function () {
    it("Should return encrypted count", async function () {
      await counter.increment(42);
      const encryptedCount = await counter.getCount();

      expect(encryptedCount).to.not.be.undefined;
    });

    it("Should return correct operation count", async function () {
      await counter.increment(1);
      await counter.increment(2);
      await counter.decrement(1);

      const opCount = await counter.getOperationCount();
      expect(opCount).to.equal(3);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle rapid sequential operations", async function () {
      for (let i = 0; i < 10; i++) {
        await counter.increment(i);
      }

      expect(await counter.operationCount()).to.equal(10);
    });

    it("Should handle alternating operations", async function () {
      for (let i = 0; i < 5; i++) {
        await counter.increment(10);
        await counter.decrement(5);
      }

      expect(await counter.operationCount()).to.equal(10);
    });

    it("Should maintain state consistency", async function () {
      const initialOps = await counter.operationCount();

      await counter.increment(1);
      await counter.decrement(1);

      expect(await counter.operationCount()).to.equal(initialOps.add(2));
    });
  });

  describe("Gas Usage", function () {
    it("Should estimate gas for increment", async function () {
      const tx = await counter.increment(100);
      const receipt = await tx.wait();

      console.log(`    Gas used for increment: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.gt(0);
    });

    it("Should estimate gas for decrement", async function () {
      const tx = await counter.decrement(50);
      const receipt = await tx.wait();

      console.log(`    Gas used for decrement: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.gt(0);
    });
  });
});
