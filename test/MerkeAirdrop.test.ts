import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture,  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { generateMerkleRoot, generateMerkleProof } from "../generateMerkleTee";


describe("MerkleAirdrop", function () {

    async function deployTokenFixture() {
        const SmartDev = await ethers.getContractFactory("SmartDev");
        const token = await SmartDev.deploy();
        return { token };
    }

    async function deployMerkleAirdrop() {
        const { token } = await loadFixture(deployTokenFixture);
        const signers = await ethers.getSigners();
        const [owner, user1, user2, user3, user4, user5, user6, user7] = signers;
    
    
        const merkleRoot = await generateMerkleRoot();
        const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
        const Airdrop = await ethers.getContractFactory("MerkleAirdrop");
        const airdrop = await Airdrop.deploy(token, BAYC_ADDRESS, merkleRoot);
        const rewardAmount = ethers.parseEther("1000.0");
        

        await token.transfer(await airdrop.getAddress(), rewardAmount);

        return { token, airdrop, merkleRoot, owner, user1, user2, user3, user4, user5, user6, user7, BAYC_ADDRESS };
    }

  it("Should deploy with the correct parameters", async function () {
    const { token, airdrop, merkleRoot, BAYC_ADDRESS } = await loadFixture(deployMerkleAirdrop);
    expect(await airdrop.token()).to.equal( token.target);
    expect(await airdrop.bayc()).to.equal(BAYC_ADDRESS);
    expect(await airdrop.merkleRoot()).to.equal(merkleRoot);
  });


    it('Should allow eligible user to claim airdrop', async function () {
    const { airdrop, owner, user1, token  } = await loadFixture(deployMerkleAirdrop);
    // Define the address of the token holder.
    const TOKEN_HOLDER = "0xaAa2DA255DF9Ee74C7075bCB6D81f97940908A5D";
    const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

    const amount = ethers.parseEther("100.0").toString();
    const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

    // Impersonate the token holder account to perform actions on their behalf.
    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const BAYC_Contract = await ethers.getContractAt("IERC721", BAYC_ADDRESS, impersonatedSigner);        

    console.log("BAYC Wallet Balance: "+ await BAYC_Contract.balanceOf(TOKEN_HOLDER));
    await airdrop.connect(owner).claim(impersonatedSigner.address,amount, proof);
    console.log("Token transfer completed");

    // Check if the user has received the token
    expect(await token.balanceOf(TOKEN_HOLDER)).to.equal(amount);
  });

  it("Should not allow ineligible user to claim airdrop", async function () {
    const { airdrop, user1  } = await loadFixture(deployMerkleAirdrop);
    const TOKEN_HOLDER = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720";
    const amount = ethers.parseEther("100.0").toString();
    const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

    await expect(airdrop.connect(user1).claim(TOKEN_HOLDER,amount, proof)).to.be.revertedWith("Must own a BAYC NFT");
    });

    it("Should not allow double claiming", async function () {
      const { airdrop, user1  } = await loadFixture(deployMerkleAirdrop);
      const TOKEN_HOLDER = "0xaAa2DA255DF9Ee74C7075bCB6D81f97940908A5D";
      const amount = ethers.parseEther("100.0").toString();
      const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

      await airdrop.connect(user1).claim(TOKEN_HOLDER,amount, proof);
      await expect(airdrop.connect(user1).claim(TOKEN_HOLDER,amount, proof)).to.be.revertedWith("Airdrop already claimed");
    });

    it("Should not allow claiming with invalid proof", async function () {
      const { airdrop, user1  } = await loadFixture(deployMerkleAirdrop);
      const TOKEN_HOLDER = "0xe2A83b15FC300D8457eB9E176f98d92a8FF40a49";
      const amount = ethers.parseEther("100.0").toString();
      const invalidProof = await generateMerkleProof(TOKEN_HOLDER, amount);

      await expect(airdrop.connect(user1).claim(TOKEN_HOLDER,amount, invalidProof)).to.be.revertedWith("Invalid Merkle Proof");
    });

    it("Should not allow claiming with zero address", async function () {
      const { airdrop, user1  } = await loadFixture(deployMerkleAirdrop);
      const TOKEN_HOLDER = "0x0000000000000000000000000000000000000000";
      const amount = ethers.parseEther("100.0").toString();
      const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

      await expect(airdrop.connect(user1).claim(TOKEN_HOLDER,amount, proof)).to.be.revertedWith("Invalid address: zero address");
    });

});
