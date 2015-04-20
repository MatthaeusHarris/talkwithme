/**
 * Created by matt on 4/19/15.
 */

var socketIO = require('socket.io');

module.exports = function(app) {
    io = socketIO(app);

    io.on('connection', function (socket) {
        socket.emit('connected', {status: 'waiting for partner'});
        socket.on('register', function (data) {
            console.log(data);
        });
    });
};