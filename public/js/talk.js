/**
 * Created by matt on 4/19/15.
 */
console.log("talk.js loaded...");
$(function() {
    console.log("Starting our run");
    var chatWindow = $('#chat-history');
    var chatTextarea = $('#chat-textarea');

    var writeLine = function(actor, type, line) {
        var text =
            '<span class="chat-line ' + type + '">' +
            '  <span class="actor">' + actor + '</span>' +
            '  <span class="text">' + line + '</span>' +
            '</span>';
        chatWindow.append(text);
    };

    writeLine('system', 'system', 'Connecting to server');
    var socket = io.connect('http://localhost:3000', {'forceNew': true});
    socket.on('connected', function (data) {
        console.log(data);
        writeLine('system', 'system', data.status);
        socket.emit('register', {userID: userID});
    });

    socket.on('error', function(data) {
        console.log(data);
        writeLine('system', 'error', data.status);
    });

    socket.on('system', function(data) {
        console.log(data);
        writeLine('system', 'system', data.status);
    });

    socket.on('debug', function(data) {
       console.log(data);
        writeLine('debug', 'debug', '<pre>' + JSON.stringify(data, null, 2) + '</pre>')
    });

    socket.on('say', function(data) {
        writeLine(data.nickname, 'utterance', data.message);
    });

    socket.on('ready', function(data) {
        writeLine('system', 'system', data.message);
    });

    chatTextarea.on('keypress', function(event) {
        if (event.keyCode == 13 && event.shiftKey == false) {
            event.preventDefault();
            socket.emit('sayToServer', {message: chatTextarea.val()});
            chatTextarea.val('');
        }
    });
});