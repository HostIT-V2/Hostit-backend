const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({

    email: {type: String},
    isPresent: {type: Boolean, default: false}

}, {timestamps: true})

const Attendance = mongoose.model('attendance', attendanceSchema);

module.exports = Attendance;