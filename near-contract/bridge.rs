// use this contract for minting

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::json_types::U128;
use near_sdk::NearToken; // Import NearToken for proper conversion

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct NearBridge {}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct MintArgs {
    receiver: AccountId,
    amount: U128,
}

#[near_bindgen]
impl NearBridge {
    #[init]
    pub fn new() -> Self {
        Self {}
    }

    pub fn mint_asset(&mut self, receiver: AccountId, amount: U128) {
        let near_amount = NearToken::from_yoctonear(amount.0);
        let receiver_clone = receiver.clone();

        // Transfer tokens
        Promise::new(receiver).transfer(near_amount);

        // Logging after the transfer
        env::log_str(&format!("✅ Transferred {} yoctoNEAR to {}", amount.0, receiver_clone));
    }
}

// https://explorer.testnet.near.org/transactions/8BXFVUJgMLF7jvWpRLTWi7YSaFvnAyGDZLZLMLus1GMA