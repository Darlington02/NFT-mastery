// random nft deploy script

const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const {storeImages, storeTokenUriMetadata} = require("../utils/uploadToPinata")

const imagesLocation = "./images/random"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            ability: "Waterbending"
        }
    ]
}

module.exports = async function({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // ipfs hashes of our images
    if(process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId

    if(developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("---------------------------")
    // const args = [
    //     vrfCoordinatorV2Address,
    //     subscriptionId,
    //     networkConfig[chainId].gasLane,
    //     networkConfig[chainId].callbackGasLimit,
    //     networkConfig[chainId].mintFee
    // ]

}

async function handleTokenUris() {
    tokenUris = []
    // store image in IPFS
    const {responses: imageUploadResponses, files} = await storeImages(imagesLocation)

    for(imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = {...metadataTemplate}

        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "").replace(".webp", "")
        tokenUriMetadata.description = `${tokenUriMetadata.name} is an animated figure from the popular nickelodeon webtoon Avatar Aang: the last airbender`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`uploading ${tokenUriMetadata.name}....`)
        // store the json to pinata
        const metadataUplodResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUplodResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]