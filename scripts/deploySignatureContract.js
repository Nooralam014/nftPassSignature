const { providers } = require("ethers");
const fs = require("fs");
const hardhat = require("hardhat");
var args = [],
  owner;

var contracts = {
  GeneralNFT: {
    address: "",
    contract: "",
    name: "contracts/tokens/GeneralNFT.sol:GeneralNFT",
    uri: "https://ipfs.io/ipfs/QmP2QYSsRjUPN7y12fThwb8x4HJG2Ca7FSS9Z2PHT89fxn/",
    setURI: "setBaseURI",
  }
};

async function main() {
  [owner] = await ethers.getSigners();
  console.log("initializing deployments...");
  console.log(
    "To verify contracts you can execute the './scripts/verifySignaturedContract.sh' command or run individual commands after this script finishes execution..."
  );

  fs.writeFileSync("scripts/verifySignaturedContract.sh", "");



  args.push({
    name: "GeneralNFT",
    arguments: [
      "GeneralTest",
      "GNT",
      process.env.SIGNER
    ],
  });
  await deployContract("GeneralNFT", ...args[args.length - 1].arguments);
  await setURI(contracts.GeneralNFT);

}

async function deployContract(contract, ...args) {
  const deployConfig = await hardhat.ethers.getContractFactory(
    contracts[contract].name
  );
  contracts[contract].contract = await deployConfig.deploy(...args, {
    gasPrice: await hardhat.ethers.provider.getGasPrice(),
  });

  contracts[contract].address = contracts[contract].contract.address;

  let verify =
    "npx hardhat verify --network " +
    process.env.HARDHAT_NETWORK +
    " " +
    contracts[contract].address;
  if (args[0]) verify += ` --constructor-args scripts/arguments/${contract}.js`;
  verify += ";\n";

  fs.appendFile("scripts/verifySignaturedContract.sh", verify, function (err) {
    if (err) {
      return console.log(err);
    }
  });
  if (args[0])
    fs.writeFileSync(
      `scripts/arguments/${contract}.js`,
      "module.exports = " + JSON.stringify(args) + ";"
    );

  await contracts[contract].contract.deployTransaction.wait();

  console.log(contract + ": " + contracts[contract].address);
  console.log(verify);
}

/**
 * Write argument files for contracts
 */
async function setURI(instance) {
  await instance.contract[instance.setURI](instance.uri, {
    gasPrice: await hardhat.ethers.provider.getGasPrice(),
  });
}

/**
 * Write argument files for contracts
 */
async function writeArguments() {
  for (let index = 0; index < args.length; index++) {
    fs.writeFileSync(
      `scripts/arguments/${args[index].name}.js`,
      "module.exports = " + JSON.stringify(args[index].arguments) + ";"
    );
  }
}

/**
 * Write argument files for contracts
 */

main()
  .then(async () => {
    await writeArguments();
  })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
