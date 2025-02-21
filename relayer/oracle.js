// Configuration
const { ethers } = require("ethers");
const { connect, KeyPair, keyStores, utils } = require("near-api-js");
const axios = require("axios");

// Configuration
const POLYGON_AMOY_RPC_URL = "https://rpc-amoy.polygon.technology";
const NEAR_TESTNET_RPC_URL = "https://rpc.testnet.near.org";
const ETH_PRIVATE_KEY = process.env.ETH_PRIVATE_KEY; 
const NEAR_PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY; 
const EVMBRIDGE_CONTRACT_ADDRESS = "0x5af61f732fe1C56fFe27481c0092F068F82a13D3";
const NEARBRIDGE_CONTRACT_ID = "sanjeevvarma.testnet";
const NEAR_ACCOUNT_ID = "sanjeevvarma.testnet";


const provider = new ethers.providers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);
const EVMBridgeABI = require("./abis/EVMBridgeABI.json");

// Connect to NEAR Testnet
async function initNearConnection() {
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = KeyPair.fromString(NEAR_PRIVATE_KEY);
    await keyStore.setKey("testnet", NEAR_ACCOUNT_ID, keyPair);
    return await connect({
        networkId: "testnet",
        nodeUrl: NEAR_TESTNET_RPC_URL,
        keyStore,
    });
}


// Fetch NEAR/USD Price
async function getNearPrice() {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd");
        return response.data.near.usd;
    } catch (error) {
        console.error("❌ Error fetching NEAR price:", error);
        throw new Error("Failed to fetch NEAR price");
    }
}

function parseUsdValue(usdValue) {
    if (typeof usdValue === "string") {

        return Number(BigInt(usdValue));
    }
    return usdValue; // Return as is if already a number
}


async function listenForEvents() {
    const evmBridgeContract = new ethers.Contract(
        EVMBRIDGE_CONTRACT_ADDRESS,
        EVMBridgeABI,
        provider
    );

    console.log("🚀 Listening for AssertLocked events...");
    evmBridgeContract.on("AssertLocked", async (sender, amount, usdValue, targetChainTxHash) => {
        console.log(`🔹 Locked ${amount} tokens (${usdValue} USD) for ${sender} with tx hash ${targetChainTxHash}`);
        try {
            const parsedUsdValue = parseUsdValue(usdValue.toString());
            console.log(`✅ Parsed USD Value: ${parsedUsdValue} USD`);

            const nearPrice = await getNearPrice();
            console.log(`💰 Current NEAR/USD price: $${nearPrice}`);

            const nearAmount = parsedUsdValue / nearPrice;
            console.log(`🔄 ${parsedUsdValue} USD ≈ ${nearAmount.toFixed(6)} NEAR`);

            // Convert NEAR amount to yoctoNEAR
            const yoctoNearAmount = utils.format.parseNearAmount(nearAmount.toFixed(6));
            console.log(`📌 YoctoNEAR Amount: ${yoctoNearAmount}`);

            // Initialize NEAR Connection
            const near = await initNearConnection();
            const account = await near.account(NEAR_ACCOUNT_ID);

            // Sanitize EVM sender address for NEAR compatibility
            const sanitizedReceiver = sender.toLowerCase().replace("0x", "");
            console.log(`Sanitized Receiver: ${sanitizedReceiver}`);

            // Mint the NEAR tokens
            await account.functionCall({
                contractId: NEARBRIDGE_CONTRACT_ID,
                methodName: "mint_asset",
                args: {
                    receiver: sanitizedReceiver,
                    amount: yoctoNearAmount,
                },
                gas: "300000000000000",
            });

            console.log(`✅ Minted ${nearAmount.toFixed(6)} NEAR on NEAR for ${sanitizedReceiver}!`);
        } catch (error) {
            console.error("❌ Error minting on NEAR:", error);
        }
    });
}

// Start the relayer
listenForEvents().catch(console.error);