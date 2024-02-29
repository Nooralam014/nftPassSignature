const { expect } = require("chai");
const { ethers } = require("hardhat");
const { signGenerator } = require("../scripts/signatureGenerator.js");

var wrongMinter,
  users = [],
  sameTokenIdUser,
  contractInstance,
  contract,
  correctObj = [],
  wrongObj = [];

const deploySignedNFT = async function () {
  contractInstance = await ethers.getContractFactory("GeneralNFT");
  contract = await contractInstance.deploy(
    "Signed General NFT",
    "SGN",
    "0x81840d651101EdCf29fa3FDE6c2C4F562B126A23"
  );
};

const setSigners = async function () {
  [wrongMinter, sameTokenIdUser, ...users] = await ethers.getSigners();
  correctObj.push(
    {
      address: users[0].address,
      nonce: 1,
      tokenId: 1,
    },
    { 
      address: users[1].address,
      nonce: 2, 
      tokenId: 2 }
  );
  wrongObj = {
    address: sameTokenIdUser.address,
    nonce: 3,
    tokenId: 2,
  };
};
const mintWithSignature = async function () {
  await mintCorrectly("pass");
  await mintWrongPass("Invalid Pass");
  await mintWrongAlreadyMinted("Already Minted");
  await mintWrongTokenId("ERC721: token already minted");
};

const mintCorrectly = async function () { 
    const pass = await signGenerator(correctObj);
    for (let i = 0; i < pass.length; i++) {
      await tokenMint(
        users[i],
        pass[i],
        correctObj[i].nonce,
        correctObj[i].tokenId
      );
    }
  }

const tokenMint = async function (by, _sign, _nonce, _tokenId) {
  let args = [_sign, _nonce, _tokenId];
  await contract.connect(by).mintPass(...args);
};


const mintWrongPass = async function (revertMessage) {
  const pass = await signGenerator(correctObj);
  for (let i = 0; i < pass.length; i++) {
    await expect(
      tokenMint(
        wrongMinter,
        pass[i],
        correctObj[i].nonce,
        correctObj[i].tokenId
      )
    ).to.be.revertedWith(revertMessage);
  }
};

const mintWrongAlreadyMinted = async function (revertMessage) {
  const pass = await signGenerator(correctObj);
  for (let i = 0; i < pass.length; i++) {
    await expect(
      tokenMint(users[i], pass[i], correctObj[i].nonce, correctObj[i].tokenId)
    ).to.be.revertedWith(revertMessage);
  }
};

const mintWrongTokenId = async function (revertMessage) {
  const pass = await signGenerator(wrongObj);
  for (let i = 0; i < pass.length; i++) {
    await expect(
      tokenMint(sameTokenIdUser, pass[i], wrongObj[i].nonce, wrongObj.tokenId)
    ).to.be.revertedWith(revertMessage);
  }
};

const verifyURI = async function () {
  await contract.setBaseURI("test/");
  expect(await contract.getBaseURI()).to.be.equal("test/");
  expect(await contract.tokenURI(1)).to.be.equal("test/1.json");
};

describe("Minting ERC721 assets through signed transactions", async function () {
  it("should deploy signedNFT contract", deploySignedNFT);
  it("should set Signers", setSigners);
  it(
    "should mint with correct signature, allowed address and correct/unique tokenId",
    mintWithSignature
  );
  it("should verify URI", verifyURI);
});
