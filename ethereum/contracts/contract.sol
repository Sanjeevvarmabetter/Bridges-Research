pragma solidity ^0.8.0;

contract EVMBridge {
    address public owner;
    mapping(bytes32 => bool) public processedProofs;

    event AssertLocked(address indexed sender,uint256 amount,bytes32 targetChainTxHash);
    event AssertUnlocked(address indexed receiver,uint256 amount);



    constructor() {
        owner = msg.sender;
    } 

    modifier onlyOwner() {
        require(owner == msg.sender,"not the contract owner");
        _;

    }
    //this is for locking the asserts
    function lockAsserts(uint256 amount,bytes32 targetChainTxhash) external {
        require(amount > 0,"Amount must be greater than zero");
        require(!processedProofs[targetChainTxhash],"Proof must be greater than zero");

        processedProofs[targetChainTxhash] = true;

        emit AssertLocked(msg.sender, amount, targetChainTxhash);

    }

    //this is for unlocking the asserts
    function unlockAssert(address receiver,uint256 amount,bytes memory proof) external onlyOwner() {
            require(verifyProof(proof),"Invalid Proof");

            emit AssertUnlocked(receiver, amount);
    }

    function verifyProof(bytes memory  proof) internal pure returns (bool) {
        // light client verification

        return true;
    }


}