const router = require('express').Router(),
    controller = require('../controllers/attendance');

router.route('/')
    .get(controller.getAllAttendance)
    .post(controller.markAttendance)

router.route('/verify')
    .post(controller.verifyAttendance)

router.route('/verify-offchain')
    .post(controller.verifyAttendanceOffchain)

router.route('/verify-anambara')
    .post(controller.verifyAttendanceAnambaraTechies)

router.route('/verify-biu')
    .post(controller.verifyAttendanceBiu)

router.route('/verify-borderless')
    .post(controller.verifyAttendanceBorderless)

router.route('/send-tickets')
    .post(controller.sendBulkEmails)

router.route('/all')
    .get(controller.getAttFromContract)

router.route('/verfiedusers')
    .get(controller.distributePOAP)

router.route('/:email')
    .get(controller.getAttendeeDetails)

module.exports = router;