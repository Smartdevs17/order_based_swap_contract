// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrderBasedSwap {
    struct Order {
        address depositor;
        address tokenIn;
        uint256 amountIn;
        address tokenOut;
        uint256 amountOut;
        bool fulfilled;
    }

    Order[] public orders;

    event OrderCreated(uint256 orderId, address indexed depositor, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut);
    event OrderFulfilled(uint256 orderId, address indexed fulfiller);

    function createOrder(address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut) external {
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        orders.push(Order({
            depositor: msg.sender,
            tokenIn: tokenIn,
            amountIn: amountIn,
            tokenOut: tokenOut,
            amountOut: amountOut,
            fulfilled: false
        }));

        emit OrderCreated(orders.length - 1, msg.sender, tokenIn, amountIn, tokenOut, amountOut);
    }

    function fulfillOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(!order.fulfilled, "Order already fulfilled");
        require(IERC20(order.tokenOut).transferFrom(msg.sender, order.depositor, order.amountOut), "Transfer failed");

        order.fulfilled = true;
        require(IERC20(order.tokenIn).transfer(msg.sender, order.amountIn), "Transfer failed");

        emit OrderFulfilled(orderId, msg.sender);
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

}
