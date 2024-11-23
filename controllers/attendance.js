require('dotenv').config();
const Attendance = require('../models/attendance'),
    ethers = require('ethers'),
    eventAbi = require('../abis/eventAbi.json'),
    nftAbi = require('../abis/nftAbi.json'),
    borderlessAbi = require('../abis/borderlessEventAbi.json'),
    anambaraAbi = require('../abis/anabaraEventAbi.json'),
    biuAbi = require('../abis/biuEventAbi.json'),
    itcAbi = require('../abis/itcEventAbi.json'),
    fs = require('fs'),
    QRcode = require('qrcode');
const VerifiedUser = require('../models/user');
const User = require('../models/user');
const { sendEmail } = require('../script');



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

    let {email, day} = req.body;

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const eventContract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, eventAbi, wallet);

        const nftContract = new ethers.Contract(process.env.TICKET_CONTRACT_ADDRESS, nftAbi, wallet);

        let foundUser = await VerifiedUser.findOne({email})

       
        if(!foundUser) {
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
            await VerifiedUser.create({email: email, address: data.user.walletPublicKey})
                
            // mark attendance 
            const markAttTx = await eventContract.w3lc2024__markAttendance(data.user.walletPublicKey, day)

            await markAttTx.wait()

            // add to attendance collection
            const markAtt = await Attendance.create({email: email, isPresent: true, day: day})

            // return success and saved data
            return res.status(201).json({message: 'successful', data: markAtt})

        } else {

            const transaction = await eventContract.w3lc2024__markAttendance(foundUser.address, day);

            const reciept = await transaction.wait();

            if(!reciept.status) throw Error("Attendance not marked on contract");

            // mark users attendance for that day
            let response = await Attendance.create({email: email, isPresent: true, day: day});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

exports.verifyAttendanceOffchain = async (req, res) => {

    let {email, day} = req.body;

    try {

        let foundUser = await VerifiedUser.findOne({email})

        let foundAtt = await Attendance.findOne({email: email, day: day})
       
        if(!foundUser) {
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
            await VerifiedUser.create({email: email, address: data.user.walletPublicKey})

            // add to attendance collection
            const markAtt = await Attendance.create({email: email, isPresent: true, day: day})

            // return success and saved data
            return res.status(201).json({message: 'successful', data: markAtt})

        } else if(foundUser && foundAtt) {
            throw Error('Already verified');
        }
        else {

            // mark users attendance for that day
            let response = await Attendance.create({email: email, isPresent: true, day: day});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

// not in use
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

exports.sendTickets = async (req, res) => {
    try {

        let response = await fetch('https://web3lagosbackend.onrender.com/api/general-registrations/');

        let users = await response.json()

        // let users = [{email: 'sogobanwo@gmail.com'}, {email: "daveproxy80@gmail.com"}, {email: "manoahluka@gmail.com"}]

        for (const user of users) {
            const img1 = await QRcode.toBuffer(JSON.stringify({email: user.email}))
            await VerifiedUser.sendEmail(user.email, "WEB3 lagos conf. 2024 Ticket", "tickets", img1)
            console.log('done')
        }

        console.log('done')
        
    } catch (error) {
        return res.status(400).json({message: 'failed to send emails', error: error.message})
    }
}

exports.sendBulkEmails = async (req, res) => {
    try {
        // Fetch users from your API or database
        const response = await fetch('https://web3lagosbackend.onrender.com/api/general-registrations/');
        const users = await response.json();  

        const batchSize = 40;
        let index = 0;

        const sendBatch = () => {

            if (index >= users.length) {
                console.log('All emails sent.');
                return;
            }
    
            // Get the next batch of emails to send
            const batch = users.slice(index, index + batchSize);
            index += batchSize;
    
            // Send the batch of emails
            batch.forEach(async (user) => {
                try {
                    const img1 = await QRcode.toBuffer(JSON.stringify({email: user.email}))
                    await VerifiedUser.sendEmail(user.email, "WEB3 lagos conf. 2024 Ticket", "tickets", img1)
                    console.log(`Email sent to ${user.email}`);
                } catch (error) {
                    console.error(`Failed to send email to ${user.email}:`, error.message);
                }
            });
        };
    
        // Send 40 emails every minute
        const interval = setInterval(() => {
            sendBatch();
    
            if (index >= users.length) {
                clearInterval(interval);  // Stop the interval when all emails are sent
            }
        }, 60 * 1000); 

    } catch (error) {
        return res.status(400).json({message: 'failed to send emails', error: error.message});
    }
}

exports.distributePOAP = async (req, res) => {
    try {

        let users = await VerifiedUser.find({})

        for (const user of users) {
            await VerifiedUser.sendEmail(user.email, "WEB3 lagos conf. 2024 POAP", "poap")
            console.log('done')
        }

        return res.status(200).json({message: "success", data: users})
        
    } catch (error) {
        return res.status(400).json({message: 'failed to distribute POAP', error: error.message})
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


// custom verifications

// borderless

exports.verifyAttendanceBorderless = async (req, res) => {

    let {email, day} = req.body;

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const eventContract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, borderlessAbi, wallet);

        let foundUser = await VerifiedUser.findOne({event: 'borderless', email: email})

       
        if(!foundUser) {
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
            await VerifiedUser.create({event: 'borderless', email: email, address: data.user.walletPublicKey})
                
            // mark attendance 
            const markAttTx = await eventContract.bdrls2024__markAttendance(data.user.walletPublicKey, day)

            await markAttTx.wait()

            // add to attendance collection
            const markAtt = await Attendance.create({event: 'borderless', email: email, isPresent: true, day: day})

            // return success and saved data
            return res.status(201).json({message: 'successful', data: markAtt})

        } else {

            const transaction = await eventContract.bdrls2024__markAttendance(foundUser.address, day);

            const reciept = await transaction.wait();

            if(!reciept.status) throw Error("Attendance not marked on contract");

            // mark users attendance for that day
            let response = await Attendance.create({event: 'borderless', email: email, isPresent: true, day: day});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

// Anambara techies

exports.verifyAttendanceAnambaraTechies = async (req, res) => {

    let {email, day} = req.body;

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const eventContract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, anambaraAbi, wallet);

        let foundUser = await VerifiedUser.findOne({event: 'anambara', email: email})

       
        if(!foundUser) {
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
            await VerifiedUser.create({event: 'anambara', email: email, address: data.user.walletPublicKey})
                
            // mark attendance 
            const markAttTx = await eventContract.aw3c2024__markAttendance(data.user.walletPublicKey, day)

            await markAttTx.wait()

            // add to attendance collection
            const markAtt = await Attendance.create({event: 'anambara', email: email, isPresent: true, day: day})

            // return success and saved data
            return res.status(201).json({message: 'successful', data: markAtt})

        } else {

            const transaction = await eventContract.aw3c2024__markAttendance(foundUser.address, day);

            const reciept = await transaction.wait();

            if(!reciept.status) throw Error("Attendance not marked on contract");

            // mark users attendance for that day
            let response = await Attendance.create({event: 'anambara', email: email, isPresent: true, day: day});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

exports.verifyAttendanceBiu = async (req, res) => {

    let {email, day} = req.body;

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const eventContract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, biuAbi, wallet);

        let foundUser = await VerifiedUser.findOne({event: 'biu', email: email})

       
        if(!foundUser) {
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
            await VerifiedUser.create({event: 'biu', email: email, address: data.user.walletPublicKey})
                
            // mark attendance 
            const markAttTx = await eventContract.biuc2024__markAttendance(data.user.walletPublicKey, day)

            await markAttTx.wait()

            // add to attendance collection
            const markAtt = await Attendance.create({event: 'biu', email: email, isPresent: true, day: day})

            // return success and saved data
            return res.status(201).json({message: 'successful', data: markAtt})

        } else {

            const transaction = await eventContract.biuc2024__markAttendance(foundUser.address, day);

            const reciept = await transaction.wait();

            if(!reciept.status) throw Error("Attendance not marked on contract");

            // mark users attendance for that day
            let response = await Attendance.create({event: 'biu', email: email, isPresent: true, day: day});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

exports.verifyAttendanceItc = async (req, res) => {

    let {email, day} = req.body;

    try {

        let wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, process.env.PRIVATE_KEY_PASSWORD);

        wallet = wallet.connect(provider);

        // get smart contract instance with ethers
        const eventContract = new ethers.Contract(process.env.LISK_CONTRACT_ADDRESS, itcAbi, wallet);

        let foundUser = await VerifiedUser.findOne({event: 'itc', email: email})

       
        if(!foundUser) {
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
            await VerifiedUser.create({event: 'itc', email: email, address: data.user.walletPublicKey})
                
            // mark attendance 
            const markAttTx = await eventContract.itc2024__markAttendance(data.user.walletPublicKey, day)

            await markAttTx.wait()

            // add to attendance collection
            const markAtt = await Attendance.create({event: 'itc', email: email, isPresent: true, day: day})

            // return success and saved data
            return res.status(201).json({message: 'successful', data: markAtt})

        } else {

            const transaction = await eventContract.itc2024__markAttendance(foundUser.address, day);

            const reciept = await transaction.wait();

            if(!reciept.status) throw Error("Attendance not marked on contract");

            // mark users attendance for that day
            let response = await Attendance.create({event: 'itc', email: email, isPresent: true, day: day});

            return res.status(200).json({message: 'success', data: response});

        }

    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}
