/**
 * Created by matt on 4/19/15.
 */

$(function() {
    var chatWindow = $('#chat-history');
    var writeLine = function(actor, type, line) {
        var text =
            '<span class="chat-line ' + type + '">' +
            '  <span class="actor">' + actor + '</span>' +
            '  <span class="text">' + line + '</span>' +
            '</span>';
        chatWindow.append(text);
    };

    writeLine('system', 'system', 'Connecting to server');
    var socket = io.connect('http://localhost:3000');
    socket.on('connected', function (data) {
        console.log(data);
        writeLine('system', 'system', data.status);
        socket.emit('register', {userID: userID});
    });
});