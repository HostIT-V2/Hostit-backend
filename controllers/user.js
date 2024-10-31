require('dotenv').config();
const Attendance = require('../models/attendance'),
    ethers = require('ethers'),
    eventAbi = require('../abis/eventAbi.json'),
    nftAbi = require('../abis/nftAbi.json'),
    fs = require('fs');
const VerifiedUser = require('../models/user');
const path = require('path');


exports.getAllVerifiedUsers = async (req, res) => {
    try {
        let response = await VerifiedUser.find({});

        return res.status(200).json({message: "success", data: response})

    } catch (error) {
        return res.status(400).json({message: 'failed to get verified users', error: error.message})       
    }
}

exports.distributePOAP = async (req, res) => {

    const {emailsString, poapsString} = req.body;
    try {

        let emails = emailsString.split(',')

        let poaps = poapsString.split(',')

        emails.forEach(async (email, index) => {
            let context = {poap: poaps[index]}
            // sendEmail(email.email, "WEB3LAGOS CON POAP", 'poap', context)

            await VerifiedUser.sendEmail(email, "Your Exclusive Web3Lagos 3.0 POAP Awaits!", "poap", context)

            console.log(email, index, poaps[index])
        })
    
        return res.status(200).json({message: "success"})

    } catch (error) {
        return res.status(400).json({message: 'failed to send', error: error.message})       
    }
}

exports.getAllEmails = async (req, res) => {
    try {

        let arrayOfMails = []

        let response = await VerifiedUser.find({}).select('email')

        const filePath = path.join(__dirname, 'emails.txt');

        fs.writeFileSync(filePath, '', 'utf8');

        response.forEach((item) => {
            arrayOfMails.push(item.email)

            fs.appendFileSync(filePath, `${item.email}\n`, 'utf8');
        })

        console.log(arrayOfMails)

    } catch (error) {
        return res.status(400).json({message: 'failed to get verified users emails', error: error.message})       
    }
}


module.exports = exports;