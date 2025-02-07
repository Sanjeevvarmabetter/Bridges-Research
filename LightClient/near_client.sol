pragma solidity ^0.8.0;

contract NEARLightClient {
    struct BlockHeader {
        bytes32 blockHash;
        uint256 timestamp;
    }

    mapping(bytes32 => BlockHeader) public blockHeaders;

    // Add NEAR block header
    function addBlockHeader(bytes32 blockHash, uint256 timestamp) external {
        blockHeaders[blockHash] = BlockHeader(blockHash, timestamp);
    }

    // Verify transaction inclusion using NEAR proof
    function verifyTransactionInclusion(bytes memory proof, bytes32 blockHash) external view returns (bool) {
        // Placeholder for NEAR proof verification logic
        // Implement actual verification using cryptographic libraries
        return true;
    }
}