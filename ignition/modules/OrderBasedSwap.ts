import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

async function setupOrderBasedSwapModule() {
    return buildModule("OrderBasedSwapModule", (m) => {
      const smartDevToken = m.contract("SmartDevToken");
      const cysToken = m.contract("CysToken");
      const orderBasedSwap = m.contract("OrderBasedSwap", [smartDevToken, cysToken]);
  
      return { smartDevToken, cysToken, orderBasedSwap };
    });
  }
  
  export default setupOrderBasedSwapModule;