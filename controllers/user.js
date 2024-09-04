require('dotenv').config();
const Attendance = require('../models/attendance'),
    ethers = require('ethers'),
    eventAbi = require('../abis/eventAbi.json'),
    nftAbi = require('../abis/nftAbi.json'),
    fs = require('fs');
const VerifiedUser = require('../models/user');


exports.getAllVerifiedUsers = async (req, res) => {
    try {
        let response = await VerifiedUser.find({});

        return res.status(200).json({message: "success", data: response})

    } catch (error) {
        return res.status(400).json({message: 'failed to get verified users', error: error.message})       
    }
}


module.exports = exports;