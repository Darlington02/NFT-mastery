const pinataSdk = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecret = process.env.PINATA_API_SECRET
const pinata = pinataSdk(pinataApiKey, pinataSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading to Pinata!")
    for (fileIndex in files) {
        console.log(`Working on ${fileIndex}...`)
        const readableStreamsForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamsForFile)
            responses.push(response)
        }
        catch(err) {
            console.log(err)
        }
    }
    return {responses, files}
}

async function storeTokenUriMetadata(metadata) {
    try{
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    }
    catch(error){
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }