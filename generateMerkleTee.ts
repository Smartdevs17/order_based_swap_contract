import fs from 'fs';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import csv from 'csv-parser';
import { ethers } from "hardhat";



  async function generateMerkleRoot(): Promise<string> {
    return new Promise((resolve, reject) => {
      let results: Buffer[] = [];
  
      fs.createReadStream('airdrop.csv')
        .pipe(csv())
        .on('data', (row: { address: string; amount: string }) => {  
          const address = row.address;
          const amount = row.amount;
          const leaf = keccak256(
            ethers.solidityPacked(["address", "uint256"], [address, amount])
          );
          results.push(leaf);
        })
        .on('end', () => {
          const tree = new MerkleTree(results, keccak256, {
            sortPairs: true,
          });
  
          const roothash = tree.getHexRoot();
          console.log('Merkle Root:', roothash);
  
          resolve(roothash);  
        })
        .on('error', reject); 
    });
  }


  // The function then generates a proof for the target address and amount, and returns the proof.
async function generateMerkleProof( targetAddress: string, targetAmount: string, ): Promise<string[]> {
    const userData = await getUserDataFromCSV();
    
    return new Promise((resolve, reject) => {
      console.log(`Starting to generate proof for address: ${targetAddress}, amount: ${targetAmount}`);
  
      let results: Buffer[] = userData.map((user) => 
        keccak256(
          ethers.solidityPacked(["address", "uint256"], [user.address, user.amount])
        )
      );
  
      const tree = new MerkleTree(results, keccak256, {
        sortPairs: true,
      });
  
      const targetLeaf = keccak256(
        ethers.solidityPacked(["address", "uint256"], [targetAddress, targetAmount])
      );
  
      const proof = tree.getHexProof(targetLeaf);
    //   console.log(proof);
      
      resolve(proof);
    });
  }
  
  // It first fetches the user data from the CSV file, then constructs a Merkle tree using the user data.
  async function getUserDataFromCSV(): Promise<{ address: string, amount: string }[]> {
    return new Promise((resolve, reject) => {
      let userData: { address: string, amount: string }[] = [];
  
      fs.createReadStream('airdrop.csv')
        .pipe(csv())
        .on('data', (row: { address: string; amount: string }) => { 
          userData.push({ address: row.address, amount: row.amount });
        })
        .on('end', () => {
          resolve(userData);
        })
        .on('error', reject);
    });
  }

  export { generateMerkleRoot, generateMerkleProof};