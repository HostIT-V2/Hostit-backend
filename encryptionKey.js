require("dotenv").config();
const {ethers} = require("ethers");
const fs = require("fs");


async function main () {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const encryptedJsonKey = await wallet.encrypt(process.env.PRIVATE_KEY_PASSWORD);
    fs.writeFileSync("./.encryptKey.json", encryptedJsonKey);  
}


main()
    .then(()=> process.exit(0))
    .catch((error)=> {
        console.log(error) 
        process.exit(0)
    })
