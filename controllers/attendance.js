const Attendance = require('../models/attendance');


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

exports.markAttendance = async (req, res) => {

    const {email} = req.body

    try {

         // verify if user among top 500 in web3lagos con api

        // check if user have been verified for that day in attendance schema

        // mark users attendance for that day
        let response = await Attendance.create({email, isPresent: true});

        if (!response) throw Error("Attendance not marked");

        return res.status(200).json({message: 'success', data: response});
        
    } catch (error) {
        return res.status(400).json({message: 'failed to verify', error: error.message})
    }
}

exports.getAttendanceByEmail = async (req, res) => {

    const {email} = req.params

    try {
        
    } catch (error) {
        return res.status(400).json({message: 'failed to get Attendance', error: error.message})
    }
}