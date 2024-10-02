


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
        const { token: smartDevToken } = await loadFixture(deploySmartDevToken);
        const { token: cysToken } = await loadFixture(deployCysToken);
        const signers = await ethers.getSigners();
        const [owner, user1, user2] = signers;
    
        const OrderBasedSwap = await ethers.getContractFactory("OrderBasedSwap");
        const orderBasedSwap = await OrderBasedSwap.deploy();

        // transfer token to the contract
        await smartDevToken.transfer(await orderBasedSwap.getAddress(), ethers.parseEther("1000.0"));
        await cysToken.transfer(await orderBasedSwap.getAddress(), ethers.parseEther("1000.0"));

        return { orderBasedSwap, owner, user1, user2, smartDevToken, cysToken };
    }

    it("Should deploy properly", async function () {
        const { orderBasedSwap, smartDevToken, cysToken } = await loadFixture(deployOrderBasedSwap);
        expect(await orderBasedSwap.getAddress()).to.properAddress;
        expect(await smartDevToken.balanceOf(await orderBasedSwap.getAddress())).to.equal(ethers.parseEther("1000.0"));
        expect(await cysToken.balanceOf(await orderBasedSwap.getAddress())).to.equal(ethers.parseEther("1000.0"));
    });

    it("Should create order properly", async function () {
        const { orderBasedSwap, smartDevToken, cysToken, user1 } = await loadFixture(deployOrderBasedSwap);
        const tokenIn = smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");
    
        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);
    
        // Approve orderBasedSwap contract to spend user1's smartDevToken and cysToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);
    
        // Create order
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);
        const order = await orderBasedSwap.orders(0);
        expect(order.depositor).to.equal(await user1.getAddress());
        expect(order.tokenIn).to.equal(await smartDevToken.getAddress());
        expect(order.amountIn).to.equal(amountIn);
        expect(order.tokenOut).to.equal(await cysToken.getAddress());
        expect(order.amountOut).to.equal(amountOut);
        expect(order.fulfilled).to.be.false;
    });
    
    it("Should fulfill order properly", async function () {
        const { orderBasedSwap, smartDevToken, cysToken, user1, user2 } = await loadFixture(deployOrderBasedSwap);
        const tokenIn = smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");
    
        // Transfer tokens to user1 and user2
        await smartDevToken.transfer(user1.getAddress(), amountIn);
    
        // Transfer tokens to user2
        await cysToken.transfer(user2.getAddress(), amountOut);
    
        // Approve orderBasedSwap contract to spend user1's smartDevToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);

        // Approve user2 to spend cysToken and smartDevToken (this part is now accurate)
        await cysToken.connect(user2).approve(orderBasedSwap.getAddress(), amountOut);
    
        // Create order by user1
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);

        //Create order by user2
        await orderBasedSwap.connect(user2).createOrder(tokenOut, amountOut, tokenIn, amountIn);

        //Fulfill order by user1
        await orderBasedSwap.connect(user1).fulfillOrder(0);
    
        // Fulfill order by user2
        await orderBasedSwap.connect(user2).fulfillOrder(1);
    
        // Verify that the order is fulfilled
        const order1 = await orderBasedSwap.orders(0);  
        const order2 = await orderBasedSwap.orders(1);
        expect(order1.fulfilled).to.be.true;
        expect(order2.fulfilled).to.be.true;
    });

    it("Should get order properly", async function () {
        const { orderBasedSwap, user1, smartDevToken, cysToken } = await loadFixture(deployOrderBasedSwap);
        const tokenIn = await smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = await cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");

        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);

        // Approve orderBasedSwap contract to spend user1's smartDevToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);

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
        const { orderBasedSwap, user1, smartDevToken, cysToken } = await loadFixture(deployOrderBasedSwap);
        const tokenIn = await smartDevToken.getAddress();
        const amountIn = ethers.parseEther("100.0");
        const tokenOut = await cysToken.getAddress();
        const amountOut = ethers.parseEther("200.0");

        // Transfer tokens to user1
        await smartDevToken.transfer(user1.getAddress(), amountIn);

        // Approve orderBasedSwap contract to spend user1's smartDevToken
        await smartDevToken.connect(user1).approve(orderBasedSwap.getAddress(), amountIn);

        // Create order
        await orderBasedSwap.connect(user1).createOrder(tokenIn, amountIn, tokenOut, amountOut);

        // Fulfill order by user1
        await orderBasedSwap.connect(user1).fulfillOrder(0);

        // Try to fulfill the same order again
        await expect(orderBasedSwap.connect(user1).fulfillOrder(0)).to.be.revertedWith("Order already fulfilled");  
    });
    
    
});
