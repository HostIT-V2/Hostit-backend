const router = require('express').Router(),
    controller = require('../controllers/user');

router.route('/')
    .get(controller.getAllVerifiedUsers);


module.exports = router;