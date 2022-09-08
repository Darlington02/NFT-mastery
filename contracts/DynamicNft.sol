// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "base64-sol/base64.sol";

contract DynamicNft is ERC721 {

    uint256 private tokenCounter;
    string private lowImageUri;
    string private highImageUri;
    string private constant base64prefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable priceFeed;
    mapping (uint256 => int256) public tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(address priceFeedAddress, string memory lowSvg, string memory highSvg) ERC721("Dynamic NFT", "DNT") {
        tokenCounter = 0;
        lowImageUri = svgToImageURI(lowSvg);
        highImageUri = svgToImageURI(highSvg);
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns(string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64prefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        tokenIdToHighValue[tokenCounter] = highValue;
        _safeMint(msg.sender, tokenCounter);
        tokenCounter += 1;
        emit CreatedNFT(tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");

        (, int256 price, , , ) = priceFeed.latestRoundData();

        string memory imageURI = lowImageUri;

        if (price >= tokenIdToHighValue[tokenId]) {
            imageURI = highImageUri;
        }

        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(bytes(abi.encodePacked(
                    '{"name":"',
                    name(), // You can add whatever name here
                    '", "description":"An NFT that changes based on the Chainlink Feed", ',
                    '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                    imageURI,
                    '"}'
                )))
            )   
        );
    } 
}