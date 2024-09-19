


import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture,  } from "@nomicfoundation/hardhat-toolbox/network-helpers";


describe("OrderBasedSwap", function () {
    async function deploySmartDevToken() {
        const SmartDev = await ethers.getContractFactory("SmartDevToken");
        const token = await SmartDev.deploy();
        return { token };
    }

    async function deployCysToken() {
        const Cys = await ethers.getContractFactory("CysToken");
        const token = await Cys.deploy();
        return { token };
    }

    async function deployOrderBasedSwap() {
        const signers = await ethers.getSigners();
        const [owner, user1, user2] = signers;
    
        const OrderBasedSwap = await ethers.getContractFactory("OrderBasedSwap");
        const orderBasedSwap = await OrderBasedSwap.deploy();
        return { orderBasedSwap, owner, user1, user2 };
    }

    it("Should deploy properly", async function () {
        const { orderBasedSwap } = await loadFixture(deployOrderBasedSwap);
        expect(await orderBasedSwap.getAddress()).to.properAddress;
    });

    it("Should create order properly", async function () {
        const { orderBasedSwap, user1 } = await loadFixture(deployOrderBasedSwap);
        const { token: smartDevToken } = await loadFixture(deploySmartDevToken);
        const { token: cysToken } = await loadFixture(deployCysToken);
        const tokenIn = smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");
    
        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);
        await cysToken.transfer(user1.getAddress(), amountOut);
    
        // Approve orderBasedSwap contract to spend user1's smartDevToken and cysToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);
        await cysToken.connect(user1).approve(orderBasedSwap.getAddress(), amountOut);
    
        // Create order
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);
    });
    
    it("Should fulfill order properly", async function () {
        const { orderBasedSwap, user1, user2 } = await loadFixture(deployOrderBasedSwap);
        const { token: smartDevToken } = await loadFixture(deploySmartDevToken);
        const { token: cysToken } = await loadFixture(deployCysToken);
        const tokenIn = smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");
    
        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);
        await cysToken.transfer(user1.getAddress(), amountOut);
    
        // Transfer tokens to user2 (this step was missing)
        await cysToken.transfer(user2.getAddress(), amountOut);
    
        // Approve orderBasedSwap contract to spend user1's smartDevToken and user2's cysToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);
        await cysToken.connect(user1).approve(orderBasedSwap.getAddress(), amountOut);
    
        // Approve user2 to spend cysToken and smartDevToken (this part is now accurate)
        await cysToken.connect(user2).approve(orderBasedSwap.getAddress(), amountOut);
    
        // Create order by user1
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);
    
        // Fulfill order by user2
        await orderBasedSwap.connect(user2).fulfillOrder(0);
    
        // Verify that the order is fulfilled
        const order = await orderBasedSwap.orders(0);
        expect(order.fulfilled).to.be.true;
    });

    it("Should get order properly", async function () {
        const { orderBasedSwap, user1 } = await loadFixture(deployOrderBasedSwap);
        const { token: smartDevToken } = await loadFixture(deploySmartDevToken);
        const { token: cysToken } = await loadFixture(deployCysToken);
        const tokenIn = await smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = await cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");

        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);
        await cysToken.transfer(user1.getAddress(), amountOut);

        // Approve orderBasedSwap contract to spend user1's smartDevToken and cysToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);
        await cysToken.connect(user1).approve(orderBasedSwap.getAddress(), amountOut);

        // Create order
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);

        // Get order
        const order = await orderBasedSwap.getOrder(0);
        expect( order.tokenIn).to.equal(tokenIn);
        expect( order.amountIn).to.equal(amountIn);
        expect(order.tokenOut).to.equal(tokenOut);
        expect(order.amountOut).to.equal(amountOut);
        expect( order.fulfilled).to.be.false;
        expect( order.depositor).to.equal(await user1.getAddress());

    });

    it("Should revert if order is already fulfilled", async function () {
        const { orderBasedSwap, user1 } = await loadFixture(deployOrderBasedSwap);
        const { token: smartDevToken } = await loadFixture(deploySmartDevToken);
        const { token: cysToken } = await loadFixture(deployCysToken);
        const tokenIn = await smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = await cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");

        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);
        await cysToken.transfer(user1.getAddress(), amountOut);

        // Approve orderBasedSwap contract to spend user1's smartDevToken and cysToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);
        await cysToken.connect(user1).approve(orderBasedSwap.getAddress(), amountOut);

        // Create order
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);

        // Fulfill order by user1
        await orderBasedSwap.connect(user1).fulfillOrder(0);

        // Try to fulfill the same order again
        await expect(orderBasedSwap.connect(user1).fulfillOrder(0)).to.be.revertedWith("Order already fulfilled");  
    });
    
    
});
