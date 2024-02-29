// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.16;

contract SignatureChecker {
    struct Pass {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }
    address internal _passSigner;
    mapping(address => mapping(uint256 => bool)) internal _mintedAddresses;

    constructor() {}

    function _isVerifiedPass(
        bytes32 digest,
        Pass memory pass
    ) internal view returns (bool) {
        address signer = ecrecover(digest, pass.v, pass.r, pass.s);
        require(signer != address(0), "ECDSA: invalid signature");
        return signer == _passSigner;
    }

    function _createMessageDigest(
        address _address,
        uint256 nonce,
        uint256 tokenId
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    keccak256(abi.encodePacked(_address, nonce, tokenId))
                )
            );
    }

    modifier checker(
        Pass memory pass,
        uint256 nonce,
        uint256 tokenId
    ) {
        require(
            _isVerifiedPass(
                _createMessageDigest(msg.sender, nonce, tokenId),
                pass
            ),
            "Invalid Pass"
        );
        require(
            !_mintedAddresses[msg.sender][nonce],
            "Already Minted"
        );
        _;
    }

    function _changeSigner(address newSigner) internal {
        _passSigner = newSigner;
    }
}
