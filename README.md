# OrderBasedSwap Contracts

## ERC20 Token

### Overview
This contract can work with any ERC20 token. It includes a minting function that can only be called by the owner of the contract.

### Contract Details
- **Symbol**: Customizable
- **Decimals**: 18
- **Initial Supply**: Customizable

### Functions
- **constructor**: Sets the deployer as the owner and mints the initial supply to the owner.
- **mint**: Allows the owner to mint additional tokens.

### Usage
1. Deploy the ERC20 token contract.
2. The deployer will receive the initial supply of tokens.
3. The owner can mint additional tokens by calling the `mint` function.

## OrderBasedSwap

### Overview
OrderBasedSwap is a contract that allows users to create and fulfill token swap orders. Users can deposit tokens and specify the tokens they want in return.

### Contract Details
- **Order Structure**: Contains depositor, tokenIn, amountIn, tokenOut, amountOut, and fulfilled status.
- **Events**: `OrderCreated` and `OrderFulfilled`.

### Functions
- **createOrder**: Allows users to create a new swap order.
- **fulfillOrder**: Allows users to fulfill an existing swap order.
- **getOrder**: Returns the details of a specific order.

### Usage
1. Deploy the OrderBasedSwap contract.
2. Users can create orders by calling the `createOrder` function and specifying the tokens and amounts.
3. Other users can fulfill orders by calling the `fulfillOrder` function.

## Testing

### Overview
The tests for the contracts are written in TypeScript using the Hardhat framework. The tests cover deployment, order creation, order fulfillment, and edge cases.

### Test Cases
- **Deployment**: Ensures that the contracts are deployed properly.
- **Order Creation**: Tests the creation of swap orders.
- **Order Fulfillment**: Tests the fulfillment of swap orders.
- **Get Order**: Tests retrieving order details.
- **Revert on Fulfilled Order**: Ensures that fulfilling an already fulfilled order reverts.

### Running Tests
1. Install dependencies: `npm install`
2. Run tests: `npx hardhat test`

### Example Test
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("OrderBasedSwap", function () {
  let orderBasedSwap: OrderBasedSwap;

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    orderBasedSwap = await new OrderBasedSwap(deployer.address).deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await orderBasedSwap.owner()).to.equal(deployer.address);
    });
  });

  describe("Order Creation", function () {
    it("Should create an order", async function () {
      await orderBasedSwap.createOrder("0x123", "0x456", 100, "0x789", 200);
      const order = await orderBasedSwap.getOrder(0);
      expect(order.depositor).to.equal(deployer.address);
      expect(order.tokenIn).to.equal("0x123");
      expect(order.amountIn).to.equal(100);
      expect(order.tokenOut).to.equal("0x789");
      expect(order.amountOut).to.equal(200);
      expect(order.fulfilled).to.be.false;
    });
  });

  describe("Order Fulfillment", function () {
    it("Should fulfill an order", async function () {
      await orderBasedSwap.createOrder("0x123", "0x456", 100, "0x789", 200);
      await orderBasedSwap.fulfillOrder(0, deployer.address);
      const order = await orderBasedSwap.getOrder(0);
      expect(order.fulfilled).to.be.true;
    });
  });
});
```