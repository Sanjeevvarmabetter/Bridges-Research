const { ethers } = require("ethers");
const { connect, KeyPair, keyStores, utils } = require("near-api-js");

// Configuration
const POLYGON_AMOY_RPC_URL = "https://rpc-amoy.polygon.technology";
const NEAR_TESTNET_RPC_URL = "https://rpc.testnet.near.org";
const ETH_PRIVATE_KEY = process.env.ETH_PRIVATE_KEY; // Ensure this is set in your environment
const NEAR_PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY;
const EVMBRIDGE_CONTRACT_ADDRESS = "0x5af61f732fe1C56fFe27481c0092F068F82a13D3";
const NEARBRIDGE_CONTRACT_ID = "sanjeevvarma.testnet";
const NEAR_ACCOUNT_ID = "sanjeevvarma.testnet";

// Polygon Amoy Provider
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

// Listen for AssertLocked Events on Polygon Amoy
async function listenForEvents() {
    const evmBridgeContract = new ethers.Contract(
        EVMBRIDGE_CONTRACT_ADDRESS,
        EVMBridgeABI,
        provider
    );

    console.log("Listening for AssertLocked events...");

    evmBridgeContract.on("AssertLocked", async (sender, amount, targetChainTxHash) => {
        console.log(`🔹 Locked ${amount} tokens for ${sender} with tx hash ${targetChainTxHash}`);

        try {
            // Convert the amount to yoctoNEAR (1 NEAR = 1e24 yoctoNEAR)
            const nearAmount = utils.format.parseNearAmount(amount.toString());
            if (!nearAmount) {
                throw new Error("Invalid amount conversion to NEAR.");
            }

            // Initialize NEAR connection
            const near = await initNearConnection();
            const account = await near.account(NEAR_ACCOUNT_ID);

            // Define the receiver account ID
            const receiver = "sanjeevvarma.testnet"; 
            const sanitizedReceiver = receiver.toLowerCase();

            // Log the arguments for debugging
            console.log("Calling mint_asset with args:", {
                receiver: sanitizedReceiver,
                amount: nearAmount,
            });

            await account.functionCall({
                contractId: NEARBRIDGE_CONTRACT_ID,
                methodName: "mint_asset",
                args: {
                    receiver: sanitizedReceiver,
                    amount: "1",         
                },
                gas: "300000000000000", 
            });

            console.log(`✅ Minted ${amount} tokens on NEAR!`);
        } catch (error) {
            console.error("❌ Error minting on NEAR:", error);
        }
    });
}

// Start the relayer
listenForEvents().catch((error) => {
    console.error("Relayer error:", error);
});