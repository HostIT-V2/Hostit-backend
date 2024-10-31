require('dotenv').config();
const nodemailer = require('nodemailer'),
    fs = require('fs'),
    path = require('path'),
    hbs = require('nodemailer-express-handlebars'),
    QRcode = require('qrcode');
const Attendance = require('./models/attendance');
const VerifiedUser = require('./models/user');


const generateAndSendTicket = async (emails) => {

    // generating an address
    // const response = await fetch(process.env.DYNAMIC_URL, {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${process.env.DYNAMIC_TOKEN}`,
    //         'content-type': 'application/json'
    //     },
    //     body: JSON.stringify({identifier: email, type:"email", chain :"EVM", socialProvider:"emailOnly"})
    // })

    // console.log(response)

    // let data = await response.json();

    emails.forEach(async (email) => {
        // generate a qr with eail and password
        const url = `https://hostit.events/${email}/`

        // /${data.user.walletPublicKey}

        console.log(url)
    
        // converting url to qr image
        const image = await QRcode.toDataURL(JSON.stringify({email: email}));

        const img1 = await QRcode.toBuffer(JSON.stringify({email: email}))

        // , address: data.user.walletPublicKey

        console.log(image)

        let context = {image: image}

        // sendEmail
        sendEmail(email, "WEB3LAGOS CON 024 TICKET", 'tickets', context, img1)
    })

    
}

const distributePOAP = async (emails, poaps) => {

    // const emails = await fetch('http://localhost:5500/api/attendance/verfiedusers')

    // let data = await emails.json()

    // let att = data.data.slice(12, 60)

     emails.forEach((email, index) => {
        let context = {poap: poaps[index]}
        sendEmail(email.email, "WEB3LAGOS CON POAP", 'poap', context)

        // console.log(email.email, index, poaps[index])
    })

    console.log('done')
}

// send email function
const sendEmail = async (email, subject, template, context) => {
    
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./emails/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./emails/'),
    };

    let transport = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        secure: true,
        port: 465,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    transport.use('compile', hbs(handlebarOptions))

    const info = await transport.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject,
        template: template,
        context: context,
        // attachments: [
        //     {
        //       filename: 'qrcode.png',
        //       content: qrCodeBuffer,
        //       cid: 'unique@qr.code' // Same cid as in the HTML img src
        //     }
        //   ]
    }, (err, sent)=>{
        if(err){
            console.log('error send email', err)     
        }else{
            console.log('succesfully sent', sent)
        }
    })
}

const generateAllAddr = async () => {
    const attendees = await fetch('https://web3lagosbackend.onrender.com/api/general-registrations/');

    let attendeeRes = await attendees.json();

    const allAddress = [];

    const test = ['sogobanwo@gmail.com',
    'goodnesskolapo@gmail.com',
    'atokemmy@gmail.com',
    'daveproxy80@gmail.com']

    test.forEach( async (attendee) => {
        const response = await fetch(process.env.DYNAMIC_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DYNAMIC_TOKEN}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({identifier: attendee, type:"email", chain :"EVM", socialProvider:"emailOnly"})
        })

        const data = await response.json()

        await VerifiedUser.create({email: attendee, address: data.user.walletPublicKey})

        console.log(data.user.walletPublicKey)
    })

    console.log(allAddress)

}

// generateAndSendTicket([
//     ''
// ]);

// distributePOAP(['http://POAP.xyz/mint/kz4egv',
// 'http://POAP.xyz/mint/28gaqz',
// 'http://POAP.xyz/mint/nty9fm',
// 'http://POAP.xyz/mint/k800hk',
// 'http://POAP.xyz/mint/0un2rw',
// 'http://POAP.xyz/mint/0jspj1',
// 'http://POAP.xyz/mint/tu0z97',
// 'http://POAP.xyz/mint/l00oq6',
// 'http://POAP.xyz/mint/5i1111',
// 'http://POAP.xyz/mint/sxkhco',
// 'http://POAP.xyz/mint/kz4egv',
// 'http://POAP.xyz/mint/28gaqz',
// 'http://POAP.xyz/mint/nty9fm',
// 'http://POAP.xyz/mint/k800hk',
// 'http://POAP.xyz/mint/0un2rw',
// 'http://POAP.xyz/mint/0jspj1',
// 'http://POAP.xyz/mint/tu0z97',
// 'http://POAP.xyz/mint/l00oq6',
// 'http://POAP.xyz/mint/5i1111',
// 'http://POAP.xyz/mint/sxkhco',
// 'http://POAP.xyz/mint/kz4egv',
// 'http://POAP.xyz/mint/28gaqz',
// 'http://POAP.xyz/mint/nty9fm',
// 'http://POAP.xyz/mint/k800hk',
// 'http://POAP.xyz/mint/0un2rw',
// 'http://POAP.xyz/mint/0jspj1',
// 'http://POAP.xyz/mint/tu0z97',
// 'http://POAP.xyz/mint/l00oq6',
// 'http://POAP.xyz/mint/5i1111',
// 'http://POAP.xyz/mint/sxkhco',
// 'http://POAP.xyz/mint/kz4egv',
// 'http://POAP.xyz/mint/28gaqz',
// 'http://POAP.xyz/mint/nty9fm',
// 'http://POAP.xyz/mint/k800hk',
// 'http://POAP.xyz/mint/0un2rw',
// 'http://POAP.xyz/mint/0jspj1',
// 'http://POAP.xyz/mint/tu0z97',
// 'http://POAP.xyz/mint/l00oq6',
// 'http://POAP.xyz/mint/5i1111',
// 'http://POAP.xyz/mint/sxkhco',
// 'http://POAP.xyz/mint/kz4egv',
// 'http://POAP.xyz/mint/28gaqz',
// 'http://POAP.xyz/mint/nty9fm',
// 'http://POAP.xyz/mint/k800hk',
// 'http://POAP.xyz/mint/0un2rw',
// 'http://POAP.xyz/mint/0jspj1',
// 'http://POAP.xyz/mint/tu0z97',
// 'http://POAP.xyz/mint/l00oq6',
// 'http://POAP.xyz/mint/5i1111'])

// distributePOAP(["manoahluka@gmail.com", "sogobanwo@gmail.com", "atokemmy@gmail.com, daveproxy80@gmail.com"], ["http://POAP.xyz/mint/nedw76", "http://POAP.xyz/mint/mgmj77", "http://POAP.xyz/mint/jksk4l", "http://POAP.xyz/mint/p8ifz4"])

// generateAllAddr()