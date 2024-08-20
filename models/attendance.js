const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({

    email: {type: String},
    isPresent: {type: Boolean},
    day: {type: Number}

}, {timestamps: true})

const Attendance = mongoose.model('attendance', attendanceSchema);

module.exports = Attendance;