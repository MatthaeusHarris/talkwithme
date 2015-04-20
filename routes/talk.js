/**
 * Created by matt on 4/19/15.
 */
var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');

router.get('/talk', auth.ensureAuthenticated, function(req, res) {
    res.render('talk', {user: req.user});
});

module.exports = router;