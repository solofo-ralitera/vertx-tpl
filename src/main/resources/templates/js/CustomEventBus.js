var CustomEventBus = function(options) {
    options = options || {};
    options.listeners = options.listeners || {};

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
            if(message.body.lastmessage) message.body.lastmessage = this.decompress(message.body.lastmessage);
            if(message.body.drawing) message.body.drawing = this.decompress(message.body.drawing);
            if(message.body.textselection) message.body.textselection = this.decompress(message.body.textselection);
            this.listeners.onConnection.call(this, message.body);
        }).bind(this));

        // handle board content
        this.eb.registerHandler('board-message' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.listeners.onMessage.call(this, this.decompress(message.body).escapeTag());
        }).bind(this));

        // handle language change
        this.eb.registerHandler('board-language' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.listeners.onLanguage.call(this, message.body.escapeTag());
        }).bind(this));

        // handle text selection
        this.eb.registerHandler('board-textselection' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.listeners.onSelection.call(this, this.decompress(message.body));
        }).bind(this));

        // handle drawing
        this.eb.registerHandler('board-draw-draw' + this.ebKey, (function(error, message) {
            if(typeof message.body === "undefined") return false;
            this.listeners.onDraw.call(this, message.body.decompressFromUTF16());
        }).bind(this));

        this.eb.registerHandler('board-draw-clear' + this.ebKey, (function(error, message) {
            this.listeners.onDrawClear.call(this, message.body);
        }).bind(this));

    }).bind(this);

    // Handle disconnecting
    this.eb.onclose = (function() {
        this.listeners.onClose.call(this);
    }).bind(this);

};

CustomEventBus.prototype.compress = function(str) {
    if(str !== '') return str.compressToUTF16();
    return str;
};

CustomEventBus.prototype.decompress = function(str) {
    if(str !== '') return str.decompressFromUTF16();
    return str;
};

CustomEventBus.prototype.publish = function(path, data) {
    if(path === 'board-message' || path === 'board-textselection' || path === 'board-draw-draw') {
        if(data !== '') data = this.compress(data);
    }
    if(data.length < 65530) this.eb.publish(path + this.ebKey, data);
    else if(typeof humane !== 'undefined') humane.log('Max length excedeed');
};