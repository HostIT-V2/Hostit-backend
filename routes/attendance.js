const router = require('express').Router(),
    controller = require('../controllers/attendance');

router.route('/')
    .get(controller.getAttendeeDetails)
    .post()

module.exports = router;