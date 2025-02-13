const { ethers } = require("hardhat");

async function main() {
  const EVMBridge = await ethers.getContractFactory("NEARLightClient");
  const bridge = await EVMBridge.deploy();
  console.log(`EVMBridge deployed at: ${bridge.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  // bridge
  //0x5af61f732fe1C56fFe27481c0092F068F82a13D3

  // near-light client
  // 0xb8354a709D30C7df69Cf80037A2AAfb9960e54a0