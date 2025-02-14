const {ethers} = require("ethers");
const dotenv = require("dotenv");
const POLYGON_AMOY_RPC_URL ="https://rpc-amoy.polygon.technology";
const EVMBRIDGE_CONTRACT_ADDRESS = "0x5af61f732fe1C56fFe27481c0092F068F82a13D3";
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);
const wallet  = new ethers.Wallet(PRIVATE_KEY, provider);

const EVMBridgeABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "bytes32", "name": "targetChainTxhash", "type": "bytes32" }
        ],
        "name": "lockAsserts",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const evmBridgeContract = new ethers.Contract(
    EVMBRIDGE_CONTRACT_ADDRESS,
    EVMBridgeABI,
    wallet
);

async function lockTokens() {
    const amount = ethers.utils.parseEther("1");
    const targetChainTxhash = ethers.utils.formatBytes32String("unique-tx-hash");

    const tx = await evmBridgeContract.lockAsserts(amount, targetChainTxhash, {
        maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"), // 30 Gwei
        maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),         // 50 Gwei
        gasLimit: 300000, 
    });    console.log("Transaction hash:", tx.hash);
}

lockTokens().catch((error) => {
    console.error("error locking tokens",error);
});
