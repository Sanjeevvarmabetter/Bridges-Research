use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]

pub struct NearBridge {
    processed_proofs: Vec<String>,
}

#[near_bindgen]

impl NearBridge {
    #[init]

    pub fn new() -> Self {
        Self {
            processed_proofs: Vec::new(),
        }
    }
    //locked on evm
    pub fn mint_asset(&mut self,receiver: AccountId,amount: u128,proof: String) {
        assert!(!self.processed_proofs.contains(&proof), "Proof processed alreaady");
        assert!(self.verify_proof(&proof),"Invalid Proof");

        // mintinng

        Promise::new(receiver).transfer(amount); //promise ussed becaues of transfer
        self.processed_proofs.push(proof);
    }


    fn verify_proof(&self,proof: &str) -> bool {

        true
    }

}