var CustomEventBus = function(options) {
    options = options || {};
    options.listeners = options.listeners || {};

    this.messagesBuffer = [];
    this.url = options.url;
    this.ebKey = options.ebKey || '';
    this.listeners = options.listeners || {};

    this.listeners.onConnection = options.listeners.onConnection || function(){};
    this.listeners.onClose = options.listeners.onClose || function(){};
    this.listeners.onMessage = options.listeners.onMessage || function(){};
    this.listeners.onLanguage = options.listeners.onLanguage || function(){};
    this.listeners.onSelection = options.listeners.onSelection || function(){};
    this.listeners.onDraw = options.listeners.onDraw || function(){};
    this.listeners.onDrawClear = options.listeners.onDrawClear || function(){};

    this.eb = new EventBus(this.url, {
        server : this.ebKey
    });

    this.eb.onopen = (function() {
        // handle new connection
        this.eb.registerHandler('board-newconnection', (function(error, message) {
            if(error) return false;
            if(typeof message.body === "undefined") return false;
            if(message.body.lastmessage) message.body.lastmessage = this.getMessage(message.body.lastmessage, true);
            if(message.body.drawing) message.body.drawing = this.getMessage(message.body.drawing, true);
            if(message.body.textselection) message.body.textselection = this.getMessage(message.body.textselection, true);
            if(message.body.language) message.body.language = this.getMessage(message.body.language, false);
            this.listeners.onConnection.call(this, message.body);
        }).bind(this));

        // handle board content
        this.eb.registerHandler('board-message' + this.ebKey, (function(error, message) {
            if(error) console.log(error);
            if(typeof message.body === "undefined") return false;
            this.processMessage(this.listeners.onMessage, message.body.escapeTag(), true);
        }).bind(this));

        // handle language change
        this.eb.registerHandler('board-language' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.processMessage(this.listeners.onLanguage, message.body, false);
        }).bind(this));

        // handle text selection
        this.eb.registerHandler('board-textselection' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.processMessage(this.listeners.onSelection, message.body.escapeTag(), true);
        }).bind(this));

        // handle drawing
        this.eb.registerHandler('board-draw-draw' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.processMessage(this.listeners.onDraw, message.body, true);
        }).bind(this));

        this.eb.registerHandler('board-draw-clear' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.processMessage(this.listeners.onDrawClear, message.body, false);
        }).bind(this));

    }).bind(this);

    // Handle disconnecting
    this.eb.onclose = (function() {
        this.listeners.onClose.call(this);
    }).bind(this);

};

CustomEventBus.prototype.getMessage = function(message, compress) {
    if(compress) message = this.decompress(message);
    var aMessage = message.split('::');
    var key = aMessage[0];
    var nums = aMessage[1].split('-');
    var msg = aMessage[2];

    if(! this.messagesBuffer[key]) this.messagesBuffer[key] = [''];
    this.messagesBuffer[key][nums[0]] = msg;

    // Message complete
    if(this.messagesBuffer[key].length === parseInt(nums[1])) {
        message = this.messagesBuffer[key].join('');
        this.messagesBuffer.removeItem(key);
        return message;
    }
    return false;
};

CustomEventBus.prototype.processMessage = function(callback, message, decompress) {
    message = this.getMessage(message, decompress);
    if(message !== false) callback.call(this, message);
    return this;
};

CustomEventBus.prototype.compress = function(str) {
    if(str !== '') return str.compressToBase64();
    return str;
};

CustomEventBus.prototype.decompress = function(str) {
    if(str !== '') return str.decompressFromBase64();
    return str;
};

CustomEventBus.prototype.publish = function(path, data) {
    //humane.log('Max length excedeed');
    var bufferSize = 32 * 1024;
    var aData = data.truncate(bufferSize);
    var messageKey = String.random(10);
    console.log(aData.length);
    aData.map((function(item, idx, originalArray) {
        item = [messageKey, idx + '-' + originalArray.length, item].join('::');
        if(path === 'board-message' || path === 'board-textselection' || path === 'board-draw-draw') {
            if(item !== '') item = this.compress(item);
        }
        this.eb.publish(path + this.ebKey, item);
    }).bind(this));
};