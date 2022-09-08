const { ethers, network } = require("hardhat")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // BASIC NFT
    const basicNft = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            resolve()
        })
        if (chainId == 31337) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)


    // Dynamic SVG  NFT
    const highValue = ethers.utils.parseEther("3500")
    const dynamicSvgNft = await ethers.getContract("DynamicNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)

}

module.exports.tags = ["all", "mint"]

// BASIC NFT - 0xe7165234E2a60A94a6E6214f8321E1933BF2da51
// RANDOM NFT - 0x915D42a49D0C89798C5E0BABfC660F9c2d4D8dAe
// DYNAMIC NFT - 0xC7b180e4c45d70468474890C8754d9ef581Dbdfd
