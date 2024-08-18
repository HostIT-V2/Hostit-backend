const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    email: {type: String},
    address: {type: String}

}, {timestamps: true})

const VerifiedUser = mongoose.model('verifieduser', userSchema);

module.exports =  VerifiedUser;