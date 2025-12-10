import { expect } from "chai";
import { ethers } from "hardhat";

describe("Example", function () {
  let contract: any;
  let owner: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Example = await ethers.getContractFactory("Example");
    contract = await Example.deploy();
    await contract.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(contract.address).to.be.properAddress;
    });
  });

  describe("Basic Operations", function () {
    it("Should get info", async function () {
      const info = await contract.getInfo();
      expect(info).to.be.gt(0);
    });
  });
});
