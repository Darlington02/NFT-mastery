// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {

    error RandomIpfsNft__RangeOutOfBound();
    error RandomIpfsNft__RequiresMoreEth();
    error RandomIpfsNft__TransferFailed();

    enum Breed {
        Aang,
        Katara,
        Sokka
    }
    
    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    uint64 private immutable subscriptionId;
    bytes32 private immutable gasLane;
    uint32 private immutable callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public requestIdToSender;

    uint256 public tokenCounter; 
    uint256 public MAX_CHANCE_VALUE = 100;
    string[] internal tokenUris;
    uint256 immutable mintfee;

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed breed, address minter);


    constructor(
        address vrfCoordinatorV2,
        uint64 _subscriptionId,
        bytes32 _gasLane,
        uint32 _callbackGasLimit,
        string[3] memory _tokenUris,
        uint256 _mintfee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random NFT", "RNT") {
        vrfCoordinator= VRFCoordinatorV2Interface(vrfCoordinatorV2);
        subscriptionId = _subscriptionId;
        gasLane = _gasLane;
        callbackGasLimit = _callbackGasLimit;
        tokenUris = _tokenUris;
        mintfee = _mintfee;
    }

    function requestNft() public payable returns(uint256 requestId) {
        if(msg.value < mintfee){
            revert RandomIpfsNft__RequiresMoreEth();
        }
        requestId = vrfCoordinator.requestRandomWords(
            gasLane,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );
        requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftOwner = requestIdToSender[requestId];
        uint256 newTokenId = tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Breed nftBreed = getBreedFromModdedRng(moddedRng);
        tokenCounter += 1;
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, tokenUris[uint256(nftBreed)]);

        emit NftMinted(nftBreed, nftOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success){
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng) public view returns(Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for(uint256 i=0; i<chanceArray.length; i++){
            if(moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBound();
    }

    function getChanceArray() public view returns(uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns(uint256) {
        return mintfee;
    }

    function getTokenUris(uint256 index) public view returns(string memory) {
        return tokenUris[index];
    }

    function getTokenCounter() public view returns(uint256) {
        return tokenCounter;
    }
}