require("dotenv").config();
const { ethers } = require("ethers");
const nearAPI = require("near-api-js");

const provider = new ethers.providers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
const near = await nearAPI.connect({
    networkId: "testnet",
    keyStore: new nearAPI.keyStores.InMemoryKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
});

async function listenToEthereum() {
    provider.on("block", async (blockNumber) => {
        const block = await provider.getBlockWithTransactions(blockNumber);
        console.log("New Ethereum block:", block.hash);
        const proof = generateEthereumProof(block);
        submitProofToNear(proof);
    });
}

async function listenToNear() {
    const block = await near.connection.provider.block({ finality: "final" });
    console.log("New NEAR block:", block.header.hash);
    const proof = generateNearProof(block);
    submitProofToEthereum(proof);
}

function generateEthereumProof(block) {
    return "ethereum-proof";
}

function generateNearProof(block) {
    return "near-proof";
}

function submitProofToNear(proof) {
    console.log("Submitting proof to NEAR:", proof);
}

function submitProofToEthereum(proof) {
    console.log("Submitting proof to Ethereum:", proof);
}

listenToEthereum();
listenToNear();
