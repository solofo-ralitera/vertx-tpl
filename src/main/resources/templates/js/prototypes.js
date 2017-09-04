String.prototype.escapeTag = function() {
    return this.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
String.prototype.escapeReg = function() {
    return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

Function.prototype.throttle = function(delay) {
    var fn = this
    return function() {
        var now = (new Date).getTime()
        if (!fn.lastExecuted || fn.lastExecuted + delay < now) {
            fn.lastExecuted = now
            fn.apply(fn, arguments)
        }
    }
};

Function.prototype.debounce = function(delay) {
    var fn = this
    return function() {
        fn.args = arguments
        fn.timeout_id && clearTimeout(fn.timeout_id)
        fn.timeout_id = setTimeout(function() { return fn.apply(fn, fn.args) }, delay)
    }
};
