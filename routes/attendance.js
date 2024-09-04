const router = require('express').Router(),
    controller = require('../controllers/attendance');

router.route('/')
    .get(controller.getAllAttendance)
    .post(controller.markAttendance)

router.route('/verify')
    .post(controller.verifyAttendance)

router.route('/verify-offchain')
    .post(controller.verifyAttendanceOffchain)

router.route('/all')
    .get(controller.getAttFromContract)

router.route('/verfiedusers')
    .get(controller.distributePOAP)

router.route('/:email')
    .get(controller.getAttendeeDetails)

module.exports = router;