// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EVMBridge {
    address public owner;
    mapping(bytes32 => bool) public processedProofs;
    AggregatorV3Interface internal priceFeed;
    IERC20 public token;

    event AssertLocked(address indexed sender, uint256 amount, uint256 usdValue, bytes32 targetChainTxHash);

    constructor(address _priceFeedAddress, address _tokenAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        token = IERC20(_tokenAddress);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Not the contract owner");
        _;
    }

    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        return uint256(price);
    }

    function lockAssets(uint256 amount, bytes32 targetChainTxHash) external {
        require(amount > 0, "Amount must be greater than zero");
        require(!processedProofs[targetChainTxHash], "Proof already processed");

        token.transferFrom(msg.sender, address(this), amount);
        uint256 exchangeRate = getLatestPrice();
        uint256 usdValue = (amount * exchangeRate) / 1e18;

        emit AssertLocked(msg.sender, amount, usdValue, targetChainTxHash);
        processedProofs[targetChainTxHash] = true;
    }
}