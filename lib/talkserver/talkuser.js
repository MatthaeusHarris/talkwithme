/**
 * Created by matt on 4/20/15.
 */

var TalkUser = function(user, socket) {
    console.warn("TalkUser instantiated");
    if ((this instanceof TalkUser) === false) {
        return new TalkUser(user, socket);
    }

    this._id = user._id;
    this.nickname = user.nickname;
    this.languages = user.languages;
    this.socket = socket;
    console.log('User: ' + this.nickname + ' created');
};

module.exports = TalkUser;