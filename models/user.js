require('dotenv').config();
const mongoose = require('mongoose'),
nodemailer = require('nodemailer'),
fs = require('fs'),
path = require('path'),
hbs = require('nodemailer-express-handlebars');
const { type } = require('os');

const userSchema = new mongoose.Schema({

    event: {type: String},
    email: {type: String},
    address: {type: String}

}, {timestamps: true})

// send email function
userSchema.statics.sendEmail = async (email, subject, template, context) => {
    
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('../emails/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('../hostit-backend/emails/'),
    };

    let transport = nodemailer.createTransport({
        host: 'smtp.mailgun.org',
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

const VerifiedUser = mongoose.model('verifieduser', userSchema);

module.exports =  VerifiedUser;