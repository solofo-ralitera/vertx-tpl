var TextBoard = function(options) {
    this.highlightBoard = false;
    this.lastmessage = '';


    this.container = options.container;
    this.editable = options.editable;
    //this.sketchtextapp = document.createElement('div');

    this.textarea = document.createElement('textarea');
    this.textarea.style.width = '99%';
    this.textarea.style.height = '80%';
    this.textarea.style['max-height'] = '600px';
    this.textarea.addEventListener('keyup', (function(e) {
        if(window.getSelection().toString() === '')
            this.onKeyUp.call(this, e.target.value)
    }).bind(this), false);
    this.textarea.addEventListener('select', function(e) {
        var sel = window.getSelection().toString();
        if(sel && sel.length > 2) {
            this.onTextSelection.call(this, sel)
        }
    }, false);

    // Ctrl buttons
    this.btnContainer = document.createElement('div');
    ["none", "html", "javascript", "css", "json", "python", "php", "board"].map((function(item) {
        var btn = document.createElement('button');
        btn.innerHTML = item;
        btn.className = 'btn';
        btn.value = item;
        btn.addEventListener('click', (function(e) {
            this.sendLanguage.call(this, e.target.value);
        }).bind(this), false);
        this.btnContainer.appendChild(btn);
    }).bind(this));

    this.pre = document.createElement('pre');
    this.code = document.createElement('code');


    this.pre.appendChild(this.code);
    if(this.editable) this.container.appendChild(this.textarea);
    if(this.editable) this.container.appendChild(this.btnContainer);
    this.container.appendChild(this.pre);

    window.setInterval(this.welcome.bind(this), 30000);
};

TextBoard.prototype.onKeyUp = function(value) {
    //
};
TextBoard.prototype.onTextSelection = function(value) {
    //
};

// Update board preview
TextBoard.prototype.setLastMessage = function(msg, selection) {
    if(msg) this.lastmessage = msg;
    if(typeof selection !== 'undefined') {
        this.code.innerHTML = this.lastmessage.replace(
            new RegExp('('+selection.escapeReg()+')', 'g'),
            '<span class="textselected">$1</span>')
        ;
    }else {
        this.code.innerHTML = this.lastmessage
    }
    if(this.highlightBoard) {
        hljs.highlightBlock(this.code);
        hljs.lineNumbersBlock(this.code);
    }
};

TextBoard.prototype.sendLanguage = function(btn) {
    //
};


TextBoard.prototype.setEditorValue = function(val){
    this.textarea.value = val;
};

// Update language highlighting
TextBoard.prototype.setLanguage = function(lng) {
    switch (lng) {
        case 'none':
            this.highlightBoard = false;
            break;
        default :
            this.highlightBoard = true;
            this.code.className = lng;
            break;
    }
    this.setLastMessage();
};

// Update board text selection
TextBoard.prototype.setSelection = function(sel) {
    this.highlightBoard = false;
    this.setLastMessage(this.lastmessage, sel);
};

// Show welcom message
TextBoard.prototype.welcome = function() {
    msg = '___  ___  __       __       __\n' +
        ' |  |__  /  ` |__|  /  /\\  |__)  /\\\n' +
        ' |  |___ \\__, |  | /_ /~~\\ |  \\ /~~\\\n' +
        ' __   __        __   __\n' +
        '|__) /  \\  /\\  |__) |  \\\n' +
        '|__) \\__/ /~~\\ |  \\ |__/  o o o';
    if(this.lastmessage === '') this.code.innerHTML = msg;
};

// Show canevas board
TextBoard.prototype.switchBoard = function(b) {
    return false;
    if(b) {
        if(document.getElementById('sketchpadapp')) {
            document.getElementById('sketchtextapp').style.display = 'none';
            document.getElementById('text-preview').style.display = 'none';
            document.getElementById('sketchpadapp').style.display = '';
            //dBoard.initCanvas('sketchpad');
        }else {
            document.getElementById('text-preview').style.display = 'none';
            document.getElementById('image-preview').style.display = '';
        }
    } else {
        if(document.getElementById('sketchpadapp')) {
            document.getElementById('sketchtextapp').style.display = '';
            document.getElementById('text-preview').style.display = '';
            document.getElementById('sketchpadapp').style.display = 'none';
        }else {
            document.getElementById('text-preview').style.display = '';
            document.getElementById('image-preview').style.display = 'none';
        }
    }
};
