const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethusdpriceFeedAddress

    if(developmentChains.includes(network.name)) {
        const ETHUSDAggregator = await ethers.getContract("MockV3Aggregator")
        ethusdpriceFeedAddress = ETHUSDAggregator.address
    }
    else{
        ethusdpriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSVG = await fs.readFileSync("./images/dynamic/frown.svg", { encoding: "utf-8" })

    const highSVG = await fs.readFileSync("./images/dynamic/happy.svg", { encoding: "utf-8" })

    args = [ethusdpriceFeedAddress, lowSVG, highSVG]

    log("---------------------------")
    const dynamicNft = await deploy("DynamicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying.....")
        await verify(dynamicNft.address, args)
    }

}

module.exports.tags = ["all", "dynamicnft", "main"]