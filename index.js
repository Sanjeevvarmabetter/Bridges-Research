const dotenv = require("dotenv");
dotenv.config();

const { ethers } = require("ethers");
const nearAPI = require("near-api-js");

// Ethereum Setup
const ethProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const ethWallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, ethProvider);
const ethContract = new ethers.Contract(process.env.ETH_CONTRACT_ADDRESS, [
    "function receiveProof(string memory proof) public"
], ethWallet);

// NEAR Setup
const near = await nearAPI.connect({
    networkId: "testnet",
    keyStore: new nearAPI.keyStores.InMemoryKeyStore(),
    nodeUrl: process.env.NEAR_RPC_URL,
});
const nearAccount = await near.account("sanjeevvarma.testnet");

// Listen for Ethereum Blocks
async function listenToEthereum() {
    ethProvider.on("block", async (blockNumber) => {
        const block = await ethProvider.getBlockWithTransactions(blockNumber);
        console.log("New Ethereum block:", block.hash);
        const proof = generateEthereumProof(block);
        await submitProofToNear(proof);
    });
}

// Listen for NEAR Blocks
async function listenToNear() {
    const block = await near.connection.provider.block({ finality: "final" });
    console.log("New NEAR block:", block.header.hash);
    const proof = generateNearProof(block);
    await submitProofToEthereum(proof);
}

// Generate Proofs (Replace with real proof mechanism)
function generateEthereumProof(block) {
    return `eth-proof-${block.hash}`;
}

function generateNearProof(block) {
    return `near-proof-${block.header.hash}`;
}

// Submit Proof to NEAR
async function submitProofToNear(proof) {
    console.log("Submitting proof to NEAR:", proof);
    try {
        await nearAccount.functionCall({
            contractId: process.env.NEAR_CONTRACT_ADDRESS,
            methodName: "receiveProof",
            args: { proof },
            gas: "300000000000000",
            attachedDeposit: "0"
        });
    } catch (error) {
        console.error("Error submitting proof to NEAR:", error);
    }
}

// Submit Proof to Ethereum
async function submitProofToEthereum(proof) {
    console.log("Submitting proof to Ethereum:", proof);
    try {
        const tx = await ethContract.receiveProof(proof);
        await tx.wait();
        console.log("Proof submitted to Ethereum:", tx.hash);
    } catch (error) {
        console.error("Error submitting proof to Ethereum:", error);
    }
}

// Start Relayer
listenToEthereum();
listenToNear();
