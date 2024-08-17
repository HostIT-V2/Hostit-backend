const router = require('express').Router(),
    controller = require('../controllers/attendance');

router.route('/')
    .get(controller.getAllAttendance)
    .post(controller.markAttendance)

router.route('/:email')
    .get(controller.getAttendeeDetails)

module.exports = router;