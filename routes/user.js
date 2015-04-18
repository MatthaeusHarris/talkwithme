/**
 * Created by mharris on 2/21/15.
 */
var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');
var User = require('../models/user');
var flash = require('../lib/flash');
var config = require('../config/config');

router.get('/user', auth.ensureAuthenticated, function(req, res) {
    var templateVars = {
        authId: req.user.authId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        created: req.user.created,
        nickname: req.user.nickname,
        knownLanguages: [],
        wantedLanguages: [],
        languageList: config.languages
    };
    for (var language in config.languages) {
        templateVars.knownLanguages.push({
            languageName: language,
            displayName: config.languages[language].displayName,
            checked: req.user.languages.known.indexOf(language) !== -1 ? 'checked' : ''
        });
        templateVars.wantedLanguages.push({
            languageName: language,
            displayName: config.languages[language].displayName,
            checked: req.user.languages.wanted.indexOf(language) !== -1 ? 'checked' : ''
        });
    }
    //console.log(req.user);
    //console.log(templateVars);
    res.render('user', templateVars);
});

router.post('/user', auth.ensureAuthenticated, function(req, res) {
    console.log(req.body);
    var query = {
        authId: req.user.authId
    };
    var update = {
        name: req.body.name,
        email: req.body.email,
        nickname: req.body.nickname,
        languages: {
            known: Object.keys(req.body['language-known']),
            wanted: Object.keys(req.body['language-wanted'])
        }
    };
    console.log(update);
    User.findOneAndUpdate(query, update, function(err, user) {
        if (err || !user) {
            flash(req, {
                type: 'error',
                intro: 'User',
                message: err || 'User not found.  How did that happen?'
            });
        } else {
            flash(req, {
                type: 'info',
                intro: 'User',
                message: 'Updated'
            });
        }
        res.redirect(303, '/user');
    });
});

module.exports = router;