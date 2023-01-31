const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WhiteList", function () {
  let whitelist;
  let whitelistContract;

  beforeEach(async function () {
    whitelist = await ethers.getContractFactory("whitelist");
    [alice, bob, ...addrs] = await ethers.getSigners();
    whitelistContract = await whitelist.deploy(10);
  });

  describe("WhiteLisiting functionality", function () {
    it("it should whitelist address", async () => {
      const tx = await whitelistContract.connect(alice).addAddressToWhitelist();
      await tx.wait();
      const addressWhitelisted = await whitelistContract.whitelistedAddresses(
        alice.address
      );
      expect(addressWhitelisted).to.be.true;
    });

    it("it should equal false if address is not whiteListed", async () => {
      const tx = await whitelistContract.connect(alice).addAddressToWhitelist();
      await tx.wait();
      const addressWhitelisted = await whitelistContract.whitelistedAddresses(
        bob.address
      );
      expect(addressWhitelisted).to.be.false;
    });

    it("it should revert if address is already whiteListed", async () => {
      expect(
        whitelistContract.connect(alice).addAddressToWhitelist()
      ).to.be.revertedWith("Sender has already been whitelisted");
    });
  });
});
