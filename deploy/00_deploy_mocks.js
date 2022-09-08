const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]
    // deploy mocks if on local development network
    if(developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks..")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK]
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        log("Mocks Deployed!")
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        log("You are deploying to a local network, you'll need a local network running to interact")
        log(
            "Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!"
        )
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    }
}

module.exports.tags = ["all", "mocks", "main"]