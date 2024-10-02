import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OrderBasedSwapModule = buildModule("OrderBasedSwapModule", (m) => {
  
  const orderBasedSwap = m.contract("OrderBasedSwap");

  return { orderBasedSwap };
});

export default OrderBasedSwapModule;
