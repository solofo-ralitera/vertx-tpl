var TextBoard = function(options) {
    options = options || {};
    options.listeners = options.listeners || {};

    this.highlightBoard = true;
    this.lastmessage = '';

    this.editable = options.editable;

    // Events
    this.onEdit = options.listeners.onEdit ||function() {};
    this.onLanguageChange = options.listeners.onLanguageChange ||function() {};
    this.onTextSelection = options.listeners.onTextSelection ||function() {};

   this
        .initContainer()
        .initEditContainer()
        .initTextArea()
        .initBtnContainer()
       .initPreview();

    options.container.appendChild(this.container);
    window.setInterval(this.welcome.bind(this), 30000);
    return this;
};

TextBoard.prototype.initContainer = function() {
    this.container = document.createElement('div');
    this.container.className = 'text-board';
    this.container.style['display'] = 'grid';
    this.container.style['grid-template-columns'] = '40% 60%';
    this.container.style['grid-gap'] = '10px';
    this.container.style['height'] = '100%';
    this.container.style['width'] = '99%';
    return this;
};

TextBoard.prototype.initEditContainer = function() {
    this.editContainer = document.createElement('div');
    this.editContainer.className = 'text-board-edit';
    this.editContainer.style['grid-column-start'] = '1';
    this.editContainer.style['grid-column-end'] = '2';
    this.editContainer.style['grid-row-start'] = '1';
    if(this.editable) this.container.appendChild(this.editContainer);
    return this;
};

TextBoard.prototype.initTextArea = function() {
    this.textarea = document.createElement('textarea');
    this.textarea.style.width = '100%';
    this.textarea.style['max-width'] = '100%';
    this.textarea.style.height = '100%';
    this.textarea.style['max-height'] = '100%';
    this.textarea.style['max-height'] = '600px';
    this.textarea.addEventListener('keyup', (function(e) {
        if(window.getSelection().toString() === '')
            this.onEdit.call(this, e.target.value)
    }).bind(this), false);
    this.textarea.addEventListener('select', function() {
        var sel = window.getSelection().toString();
        if(sel && sel.length > 2) {
            this.onTextSelection.call(this, sel)
        }
    }, false);
    this.editContainer.appendChild(this.textarea);
    return this;
};

TextBoard.prototype.initBtnContainer = function() {
    this.btnContainer = document.createElement('div');
    ["html", "javascript", "css", "json", "python", "php", "drawing"].map((function(item) {
        var btn = document.createElement('button');
        btn.innerHTML = item;
        btn.className = 'btn';
        btn.value = item;
        btn.addEventListener('click', (function(e) {
            this.onLanguageChange.call(this, e.target.value);
        }).bind(this), false);
        this.btnContainer.appendChild(btn);
    }).bind(this));
    this.editContainer.appendChild(this.btnContainer);
    return this;
};

TextBoard.prototype.initPreview = function () {
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'text-board-preview';
    this.previewContainer.style['grid-column-start'] = this.editable? '2' : '1';
    this.previewContainer.style['grid-column-end'] = '3';
    this.previewContainer.style['grid-row-start'] = '1';

    this.pre = document.createElement('pre');
    this.code = document.createElement('code');
    this.code.className = 'html';
    this.pre.appendChild(this.code);
    this.previewContainer.appendChild(this.pre);

    this.container.appendChild(this.previewContainer);

    return this;
};

TextBoard.prototype.show = function() {
    if(this.container.style.display !== 'grid') this.container.style.display = 'grid';
    return this;
};
TextBoard.prototype.hide = function() {
    if(this.container.style.display !== 'none') this.container.style.display = 'none';
    return this;
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
    return this;
};

TextBoard.prototype.setEditorValue = function(val){
    this.textarea.value = val;
    return this;
};

// Update language highlighting
TextBoard.prototype.setLanguage = function(lng) {
    switch (lng) {
        case 'none':
            this.highlightBoard = false;
            this.code.className = '';
            break;
        default :
            this.highlightBoard = true;
            this.code.className = lng;
            break;
    }
    this.setLastMessage();
    return this;
};

// Update board text selection
TextBoard.prototype.setSelection = function(sel) {
    this.highlightBoard = false;
    this.setLastMessage(this.lastmessage, sel);
    return this;
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
    return this;
};

