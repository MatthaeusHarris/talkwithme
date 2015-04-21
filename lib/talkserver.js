/**
 * Created by matt on 4/19/15.
 */

var socketIO = require('socket.io');

var User = require('../models/user');
var TalkUser = require('./talkserver/talkuser');

var waitingUsers = [];

module.exports = function(app) {
    io = socketIO(app);

    io.on('connection', function (socket) {
        console.warn("Connection");
        var user;
        socket.emit('connected', {status: 'Connected to server'});
        socket.on('register', function (data) {
            console.warn('REGISTER');
            console.warn(data);
            socket.emit('system', {status: 'Loading user from db'});
            console.warn('SEARCHING FOR USER');
            User.findOne({_id: data.userID}, function(err, data) {
                if (err) {
                    return socket.emit('error', {status: err});
                }
                if (!data) {
                    return socket.emit('error', {status: 'Invalid user'});
                }
                console.log(data);

                socket.emit('system', {status: 'User ' + data._id + ' loaded from db'});
                //socket.emit('debug', data);

                user = new TalkUser(data, socket);
                var matchedUser = findMatchingUser(user);
                if (!matchedUser) {
                    console.warn("Could not find matching user");
                    console.warn(waitingUsers.length);
                    waitingUsers.push(user);
                    console.warn("Pushed");
                } else {
                    console.warn("Found matching user!");
                    console.warn(waitingUsers.length);
                    removeWaitingUser(user);
                    removeWaitingUser(matchedUser);
                    startTalkSession([user, matchedUser], findCommonLanguages(user, matchedUser)[0]);
                }
            });
        });
        socket.on('disconnect', function() {
            if (user) {
                console.warn("User " + user.nickname + " disconnected");
                removeWaitingUser(user);
            }
        });
    });
};

var startTalkSession = function(users, language) {
    console.warn("Starting talk session");
    for (var userNumber in users) {
        console.log("Setting up socket handlers for user " + userNumber);

        users[userNumber].socket.on('sayToServer', (function(speakingUser) {
            return function(data) {
                console.warn(data);
                for (var receivingUserNumber in users) {
                    users[receivingUserNumber].socket.emit('say', {
                        nickname: speakingUser.nickname,
                        message: data.message
                    });
                }
            };
        })(users[userNumber]));

        users[userNumber].socket.on('disconnect', (function(disconnectedUser) {
            return function(data) {
                console.warn(disconnectedUser.nickname + " disconnected");
                for (var receivingUserNumber in users) {
                    if (users[receivingUserNumber] !== disconnectedUser) {
                        users[receivingUserNumber].socket.emit('say', {
                            nickname: disconnectedUser.nickname,
                            message: 'disconnected'
                        });
                    }
                }
            };
        })(users[userNumber]));

        var joinMessage = users.map(function(u) { return u.nickname }).join(' and ') +
            ' are speaking ' + language + ' now.'
        users[userNumber].socket.emit('ready', {message: joinMessage});
    }
};

var findMatchingUser = function(user) {
    var validMatches = waitingUsers.filter(function(waitingUser) {
        return findCommonLanguages(user, waitingUser);
    });
    return validMatches[0];
};

var removeWaitingUser = function(user) {
    var index = waitingUsers.indexOf(user);
    waitingUsers.splice(index, 1);
};


var findCommonLanguages = function(user1, user2) {
    console.log('user1');
    console.log(user1);
    console.log('user2');
    console.log(user2);
    var wantedInersection = user1.languages.wanted.filter(function(language) {
        return (user2.languages.known.indexOf(language) !== -1);
    });

    var knownIntersection = user1.languages.known.filter(function(language) {
        return (user2.languages.wanted.indexOf(language) !== -1);
    });

    return wantedInersection.concat(knownIntersection);
};