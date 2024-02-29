const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();
const privateKey = process.env.SIGNER_PRIVATE_KEY;
// below is sample of obj which we can use
// let obj =[{
// address:"0xC35DAF6d1c901FE38F0F7B87BC99bC1Df694c024",
// nonce:2,
// tokenId:2
// },
// ]

async function signGenerator(obj) {
  let output = [];
  for (let i = 0; i < obj.length; i++) {
    let newArr = [];
    let signature = await whiteListUsers(
      obj[i].address,
      obj[i].nonce,
      obj[i].tokenId
    );
    newArr.push(signature.r, signature.s, signature.v);
    output.push(newArr);
  }
  fs.writeFileSync(
    `scripts/arguments/signatures.js`,
    "module.exports = " + JSON.stringify(output) + ";"
  );
  // console.log('Done saving signature please check signatures.js');

  return output;
}

async function whiteListUsers(mintTo, nonce, tokenId) {
  const signer = new ethers.Wallet("0x" + privateKey);
  const message = ethers.utils.solidityKeccak256(
    [`address`, `uint256`, `uint256`],
    [mintTo, nonce, tokenId]
  );
  const signature = await signer.signMessage(ethers.utils.arrayify(message));
  let { r, s, v } = ethers.utils.splitSignature(signature);
  return { r, s, v };
}

module.exports = {
  signGenerator,
};
