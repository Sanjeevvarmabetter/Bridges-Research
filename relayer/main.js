const { ethers } = require("ethers");
const { connect, KeyPair, keyStores, utils } = require("near-api-js");

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

// Listen for AssertLocked Events on Ethereum (Polygon)
async function listenForEvents() {
    const evmBridgeContract = new ethers.Contract(
        EVMBRIDGE_CONTRACT_ADDRESS,
        EVMBridgeABI,
        provider
    );

    console.log("Listening for AssertLocked events...");
    evmBridgeContract.on("AssertLocked", async (sender, amount, targetChainTxHash) => {
        console.log(`🔹 Locked ${amount} tokens for ${sender} with txHash: ${targetChainTxHash}`);

        try {
                    //work on the conversion
            const nearAmount = utils.format.parseNearAmount(amount.toString());
            if (!nearAmount) {
                throw new Error("Invalid amount conversion to NEAR.");
            }

            // Initialize NEAR connection
            const near = await initNearConnection();
            const account = await near.account(NEAR_ACCOUNT_ID);

            // Call the mint_asset function
            await account.functionCall({
                contractId: NEARBRIDGE_CONTRACT_ID,
                methodName: "mint_asset",
                args: {
                    receiver: NEAR_ACCOUNT_ID.toLowerCase(), 
                    amount: "1", // Amount in yoctoNEAR
                    proof: targetChainTxHash.toString(), // Use the     transaction hash as proof
                },
                gas: "30000000000000", // Adjust gas as needed
            });

            console.log(`✅ Minted ${amount} tokens on NEAR for proof: ${targetChainTxHash}`);
        } catch (error) {
            console.error("❌ Error minting on NEAR:", error);
        }
    });
}

// Start the relayer
listenForEvents().catch((error) => {
    console.error("Relayer error:", error);
});