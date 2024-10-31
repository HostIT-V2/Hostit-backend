const router = require('express').Router(),
    controller = require('../controllers/user');

router.route('/')
    .get(controller.getAllVerifiedUsers);

router.route('/distribute-poap')
    .post(controller.distributePOAP)

router.route('/get-emails')
    .get(controller.getAllEmails)

module.exports = router;