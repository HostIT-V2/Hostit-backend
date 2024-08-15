const router = require('express').Router(),
    controller = require('../controllers/attendance');

router.route('/:email')
    .get(controller.getAttendeeDetails)
    .post()

module.exports = router;