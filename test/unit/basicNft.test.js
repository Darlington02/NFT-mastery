const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ?describe.skip
    : describe ("Basic NFT unit tests", function() {
        let basicNft, deployer

        beforeEach(async() => {
            let accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["basicnft"])
            basicNft = await ethers.getContract("BasicNFT")
        })

        describe("Constructor", () => {
            it("Initializes the NFT Correctly", async () => {
                const name = await basicNft.name()
                const symbol = await basicNft.symbol()
                const tokenCounter = await basicNft.getTokenCounter()
                assert.equal(name, "Cutie")
                assert.equal(symbol, "CUTE")
                assert.equal(tokenCounter.toString(), "0")
            })
        })

        describe("Mint NFT", () => {
            it("Allow users to mint NFT", async () => {
                const txResponse = await basicNft.mintNft()
                await txResponse.wait(1)
                const tokenURI = await basicNft.tokenURI(0)
                const tokenCounter = await basicNft.getTokenCounter()

                assert.equal(tokenCounter.toString(), "1")
                assert.equal(tokenURI, await basicNft.TOKEN_URI())
            })
        })
    })  