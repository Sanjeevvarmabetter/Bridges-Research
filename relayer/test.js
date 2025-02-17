const { connect, KeyPair, keyStores, utils } = require("near-api-js");

// Configuration
const NEAR_TESTNET_RPC_URL = "https://rpc.testnet.near.org";
const NEAR_PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY; 
const NEAR_ACCOUNT_ID = "sanjeevvarma.testnet"; // 
const NEAR_CONTRACT_ID = "sanjeevvarma.testnet"; // 

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

async function testMintAsset() {
    try {
        // Initialize NEAR connection
        const near = await initNearConnection();
        const account = await near.account(NEAR_ACCOUNT_ID);

        
        const receiver = "sanjeevvarma.testnet"; 
        const amountInNear = "1"; 
        const amountInYoctoNear = utils.format.parseNearAmount(amountInNear); 

        console.log("Calling mint_asset with args:", {
            receiver,
            amount: amountInYoctoNear,
        });

        // Call the mint_asset function on the NEAR bridge contract
        const result = await account.functionCall({
            contractId: NEAR_CONTRACT_ID,
            methodName: "mint_asset",
            args: {
                receiver,
                amount: amountInYoctoNear,
            },
            gas: "300000000000000", 
        });

        console.log("Transaction successful!", result);
    } catch (error) {
        console.error("❌ Error calling mint_asset:", error);
    }
}

// Run the test
testMintAsset();