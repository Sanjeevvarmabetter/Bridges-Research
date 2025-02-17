const { ethers } = require("ethers");

// Polygon Amoy RPC URL
const POLYGON_AMOY_RPC_URL = "https://rpc-amoy.polygon.technology";

// EVMBridge Contract Address
const EVMBRIDGE_CONTRACT_ADDRESS = "0x5af61f732fe1C56fFe27481c0092F068F82a13D3";

// Ethereum Wallet Private Key (Replace with your private key)
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;

// Provider and Wallet Setup
const provider = new ethers.providers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);


// /// abi import

const EVMBridgeABI = require("./abis/EVMBridgeABI.json");






const evmBridgeContract = new ethers.Contract(
    EVMBRIDGE_CONTRACT_ADDRESS,
    EVMBridgeABI,
    wallet
);

async function lockTokens() {
    try {
        const amount = ethers.utils.parseEther("0.0000002");

        const targetChainTxhash = ethers.utils.formatBytes32String(`unique-tx-hash-${Date.now()}`);

        const feeData = await provider.getFeeData();

        const tx = await evmBridgeContract.lockAsserts(amount, targetChainTxhash, {
            maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),         
            gasLimit: 300000, 
        });

        console.log("Transaction hash:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed! Receipt:", receipt);
    } catch (error) {
        console.error("Error locking tokens:", error);
    }
}

lockTokens();