# Merkle Airdrop Project

This project demonstrates a Merkle Airdrop system using Solidity and Hardhat. The airdrop allows eligible users to claim tokens based on their inclusion in a Merkle tree.

## Project Structure

- `contracts/`: Contains the Solidity smart contract for the Merkle Airdrop.
- `test/`: Contains the test scripts for the Merkle Airdrop contract.
- `scripts/`: Contains the scripts to generate the Merkle root and proofs.
- `airdrop.csv`: Contains the list of addresses and amounts eligible for the airdrop.

## Setup

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file and add your Alchemy API key and private key:
   ```sh
   ALCHEMY_API_KEY=your-alchemy-api-key
   PRIVATE_KEY=your-private-key
   ```

## Usage

### Generating Merkle Root and Proofs

1. Generate the Merkle root:
   ```sh
   npx hardhat run scripts/generateMerkleRoot.ts
   ```

2. Generate a Merkle proof for a specific address and amount:
   ```sh
   npx hardhat run scripts/generateMerkleProof.ts --address <address> --amount <amount>
   ```

### Running Tests

Run the tests to ensure the contract works as expected:
   ```sh
   npx hardhat test
   ```

### Deploying the Contract

Deploy the Merkle Airdrop contract to a network:
   ```sh
   npx hardhat run scripts/deploy.ts --network <network-name>
   ```

## Contract Details

### MerkleAirdrop.sol

The `MerkleAirdrop` contract allows users to claim tokens if they are part of the Merkle tree. The contract verifies the user's proof and ensures they own a BAYC NFT before allowing the claim.

### Functions

- `constructor(address _token, address _bayc, bytes32 _merkleRoot)`: Initializes the contract with the token address, BAYC address, and Merkle root.
- `claim(address user, uint256 amount, bytes32[] calldata merkleProof)`: Allows a user to claim their tokens if they provide a valid Merkle proof.

## Testing

The test suite includes tests for:

- Deploying the contract with correct parameters.
- Allowing eligible users to claim the airdrop.
- Preventing ineligible users from claiming the airdrop.
- Preventing double claiming.
- Handling invalid proofs and zero address claims.

### Test Cases

1. **Deployment Tests**:
   - Ensure the contract is deployed with the correct parameters.

2. **Claim Tests**:
   - Allow eligible users to claim the airdrop.
   - Prevent ineligible users from claiming the airdrop.
   - Prevent double claiming.
   - Handle invalid proofs.
   - Handle zero address claims.

## License

This project is licensed under the MIT License.

