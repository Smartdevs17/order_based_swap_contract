// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
contract MerkleAirdrop {
    IERC20 public token;
    IERC721 public bayc;
    bytes32 public merkleRoot;
    mapping(address => bool) public claimed;

    constructor(address _token, address _bayc, bytes32 _merkleRoot) {
        token = IERC20(_token);
        bayc = IERC721(_bayc);
        merkleRoot = _merkleRoot;
    }

    function claim(address user,uint256 amount, bytes32[] calldata merkleProof) external {
        console.log("Claiming amount:", amount);
        require(user != address(0), "Invalid address: zero address");
        require(bayc.balanceOf(user) > 0, "Must own a BAYC NFT");
        require(!claimed[user], "Airdrop already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Merkle Proof");
        console.log("Merkle Proof verified");
        claimed[user] = true;
        console.log("Token transfer started");
        require(token.transfer(user, amount), "Token transfer failed");
        console.log("Token transfer completed");
    }
}