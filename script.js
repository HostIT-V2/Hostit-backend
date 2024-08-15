require('dotenv').config();
const nodemailer = require('nodemailer'),
    fs = require('fs'),
    path = require('path'),
    hbs = require('nodemailer-express-handlebars'),
    QRcode = require('qrcode');


const generateAndSendTicket = async (email) => {

    // generating an address
    const response = await fetch(process.env.DYNAMIC_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.DYNAMIC_TOKEN}`,
            'content-type': 'application/json'
        },
        body: JSON.stringify({identifier: email, type:"email", chain :"EVM", socialProvider:"emailOnly"})
    })

    console.log(response)

    let data = await response.json();

    // generate a qr with eail and password
    const url = `https://hostit.events/${email}/${data.user.walletPublicKey}`

    console.log(url)
   
    // converting url to qr image
    const image = await QRcode.toDataURL(JSON.stringify({email: email, address: data.user.walletPublicKey}));

    console.log(image)

    let context = {image: image}

    // sendEmail
    sendEmail(email, "WEB3 TICKET", 'tickets', context)
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
        context: context
    }, (err, sent)=>{
        if(err){
            console.log('error send email', err)     
        }else{
            console.log('succesfully sent', sent)
        }
    })
}

generateAndSendTicket("manoahluka@gmail.com");