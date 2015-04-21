/**
 * Created by matt on 4/19/15.
 */

var socketIO = require('socket.io');

var User = require('../models/user');

var waitingUsers = [];

module.exports = function(app) {
    io = socketIO(app);

    io.on('connection', function (socket) {
        socket.emit('connected', {status: 'Connected to server'});
        socket.emit('debug', waitingUsers);
        socket.on('register', function (data) {
            console.log(data);
            socket.emit('system', {status: 'Loading user from db'});
            User.findOne({_id: data.userID}, function(err, data) {
                if (err) {
                    return socket.emit('error', {status: err});
                }
                if (!data) {
                    return socket.emit('error', {status: 'Invalid user'});
                }
                socket.emit('system', {status: 'User ' + data._id + ' loaded from db'});
                socket.emit('debug', data);
                var matchedUser = findMatchingUser(data);
                if (!matchedUser) {
                    waitingUsers.push(data);
                    socket.emit('debug', waitingUsers);
                }
            });
        });
    });
};

var findMatchingUser = function(user) {
    var validMatches = waitingUsers.filter(function(waitingUser) {
        return findCommonLanguages(user, waitingUser);
    });
    return validMatches[0];
};


var findCommonLanguages = function(user1, user2) {
    var wantedInersection = user1.languages.wanted.filter(function(language) {
        return (user2.languages.known.indexOf(language) !== -1);
    });

    var knownIntersection = user1.languages.known.filter(function(language) {
        return (user2.languages.wanted.indexOf(language) !== -1);
    });

    return wantedInersection.concat(knownIntersection);
};