// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../utils/SignatureChecker.sol";

contract GeneralNFT is ERC721, Ownable, SignatureChecker {
    string private baseURI;

    constructor(
        string memory _name,
        string memory _symbol,
        address signer
    ) ERC721(_name, _symbol) {
        _passSigner = signer;
    }

    event BaseURIChanged(
        string indexed oldBaserURI,
        string indexed newBaserURI
    );
    event SignerChanged(
        address indexed oldSigner,
        address indexed newSigner
    );

    function setBaseURI(string memory _baseURI) external onlyOwner {
        require(bytes(_baseURI).length > 0, "baseURI cannot be empty");
        emit BaseURIChanged(baseURI, _baseURI);
        baseURI = _baseURI;
    }

    function getBaseURI() public view returns (string memory) {
        return baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return
            string(
                abi.encodePacked(baseURI, Strings.toString(tokenId), ".json")
            );
    }

    function mintPass(
        Pass memory pass,
        uint256 nonce,
        uint256 tokenId
    ) public checker(pass, nonce, tokenId) {
        _safeMint(msg.sender, tokenId);
        _mintedAddresses[msg.sender][nonce] = true;
    }

    function changeSigner(address newSigner) public onlyOwner {
        emit SignerChanged(_passSigner, newSigner);
        _changeSigner(newSigner);
    }
}
