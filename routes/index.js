/**
 * Created by mharris on 2/21/15.
 */
var express = require('express');
var router = express.Router();
var gitLog = require('../lib/gitlog');
var marked = require('marked');
var fs = require('fs');

//We can cache the README.md, so let's do so.
var mdText = fs.readFileSync('README.md').toString();

router.get('/', function(req, res) {
    res.render('about', {log: gitLog.log, readme: marked(mdText)});
});

router.get('/about', function(req, res) {
    res.render('about', {log: gitLog.log});
});

module.exports = router;