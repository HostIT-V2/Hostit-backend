require('dotenv').config();
const Attendance = require('../models/attendance'),
    ethers = require('ethers'),
    eventAbi = require('../abis/eventAbi.json'),
    nftAbi = require('../abis/nftAbi.json'),
    fs = require('fs');
const User = require('../models/user');


const provider = new ethers.JsonRpcProvider(process.env.LISK_SEPOLIA_URL);

const encryptedKey = fs.readFileSync("./.encryptKey.json", "utf8");


exports.getAttendeeDetails = async (req, res) => {

    const {email} = req.params

    try {
        const attendee = await fetch('https://web3lagosbackend.onrender.com/api/general-registrations/');
        const speaker = await fetch('https://web3lagosbackend.onrender.com/api/speaker-registrations/');

        let attendeeRes = await attendee.json();
        let speakerRes = await speaker.json();

        const attendeeResult = attendeeRes.filter(item => item.email == email);
        const speakerResult = speakerRes.filter(item => item.email == email);

        if (attendeeResult.length == 1  && speakerResult.length == 1) {
            return res.status(200).json({message: 'success', attendee: attendeeResult, speaker: speakerResult});
        } else if (attendeeResult.length == 1) {
            return res.status(200).json({message: 'success', attendee: attendeeResult})
        } else if (speakerResult.length == 1) {
            return res.status(200).json({message: 'success', speaker: speakerResult})
        } else {
            throw Error('Email not yet registered')
        }

    } catch (error) {
        return res.status(400).json({message: 'failed to get attendee details', error: error.message})
    }
}

exports.verifyAttendance = async (req, res) => {

    let {email, address, day} = req.body;

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const eventContract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, eventAbi, wallet);

        const nftContract = new ethers.Contract(process.env.TICKET_CONTRACT_ADDRESS, nftAbi, wallet);


        // get attendance count
        let foundAtt = await Attendance.find({email})

        let foundUser = await User.findOne({email})

        let balanceOf = await nftContract.balanceOf(address)

        console.log(balanceOf)
        
        // if att count = 0 (user has never marked att)
        if(address == '') {
            
            // generate a wallet address
            const response = await fetch(process.env.DYNAMIC_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.DYNAMIC_TOKEN}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({identifier: email, type:"email", chain :"EVM", socialProvider:"emailOnly"})
            })

            let data = await response.json();
            
            // save to User db
            await User.create({email: email, address: data.user.walletPublicKey})

            // mint single nft to user
            const mintTx = await nftContract.mintSingle(data.user.walletPublicKey)

            const mintReciept = await mintTx.wait();
            
            if(mintReciept.status) {
                
                // mark attendance 
                const markAttTx = await eventContract.w3lc2024__markAttendance(data.user.walletPublicKey, day)

                await markAttTx.wait()

                // add to attendance collection
                const markAtt = await Attendance.create({email: email, isPresent: true})

                // return success and saved data
                return res.status(201).json({message: 'successful', data: markAtt})
            }  

        } else {
            const transaction = await eventContract.w3lc2024__markAttendance(foundUser.address, day);

            const reciept = await transaction.wait();

            // mark users attendance for that day
            let response = await Attendance.create({email: email, isPresent: true});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

exports.markAttendance = async (req, res) => {

    const {email} = req.body

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // const signer = verifyMessage(message, signature)

        // get smart contract instance with ethers
        const contract =  new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, eventAbi, wallet);

        const transaction = await contract.w3lc2024__markAttendance("0xc408235a9A01767d70B41C98d92F2dC7B0d959f4", 1);

        console.log(transaction);

        // await reciept
        const reciept = await transaction.wait();

        
        console.log(reciept);

        // ===================

        // verify if user among top 500 in web3lagos con api

        // Use current date if no date is provided
        const targetDate = new Date();

        // Set targetDate to the start of the day
        targetDate.setHours(0, 0, 0, 0);

        // check if user have been verified for that day in attendance schema
        let foundCheckin = await Attendance.findOne({email, createdAt: {
            $gte: targetDate,
            $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        }}).sort({createdAt: 1});

        if(foundCheckin.length > 0) throw Error('user have checked in Already !');

        // mark users attendance for that day
        let response = await Attendance.create({email: email, isPresent: true});

        return res.status(200).json({message: 'success', data: response});
        
    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

exports.getAllAttendance = async (req, res) => {
    try {
        let response = await Attendance.find({});

        return res.status(200).json({message: "success", data: response})
        
    } catch (error) {
        return res.status(400).json({message: 'failed to get all Attendance', error: error.message})
    }
}

exports.getAttFromContract = async (req, res) => {
    try {
        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const contract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, eventAbi, wallet);

        // make call to contract to create event
        const transaction = await contract.w3lc2024__returnAttendance();

        return res.status(200).json({message: "success", data: transaction})
        
    } catch (error) {
        return res.status(400).json({message: 'failed to get all Attendance', error: error.message})
    }
}

exports.getAttendanceByEmail = async (req, res) => {

    const {email} = req.params

    try {

        let response = await Attendance.findOne({email})

        return res.status(200).json({message: 'success', data: response})
        
    } catch (error) {
        return res.status(400).json({message: 'failed to get Attendance', error: error.message})
    }
}