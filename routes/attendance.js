const router = require('express').Router(),
    controller = require('../controllers/attendance');

router.route('/:email')
    .get(controller.getAttendeeDetails)

router.route('/')
    .get(controller.getAllAttendance)
    .post(controller.markAttendance)

module.exports = router;