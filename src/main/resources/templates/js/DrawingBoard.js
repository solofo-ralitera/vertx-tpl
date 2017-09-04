var DrawingBoard = function (options) {
    // Variables for referencing the canvas and 2dcanvas context
    this.canvas = null;
    this.ctx = null;

    // Variables to keep track of the mouse position and left-button status
    this.mouseX = null;
    this.mouseY = null;
    this.mouseDown = 0;

    // Variables to keep track of the touch position
    this.touchX = null;
    this.touchY = null;

    this.canevasSize = 5;
    this.canevasColorR = 0;
    this.canevasColorG = 0;
    this.canevasColorB = 0;
    this.canevasColorA = 255;

    this.container = options.container;

    // events
    this.onDraw = options.onDraw || function () {};
    this.onClear = options.onClear || function () {};

    this.initCanvas();
};

DrawingBoard.prototype.setColor = function (r,g,b) {
    this.canevasColorR = r;
    this.canevasColorG = g;
    this.canevasColorB = b;
};
DrawingBoard.prototype.setSize = function (s) {
    this.canevasSize = s;
};

// Draws a dot at a specific position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
DrawingBoard.prototype.drawDot = function (x, y, size, style) {
    // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)

    // Select a fill style
    this.ctx.fillStyle = style || "rgba(" + this.canevasColorR + "," + this.canevasColorG + "," + this.canevasColorB + "," + (this.canevasColorA / 255) + ")";

    // Draw a filled circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
    this.onDraw.call(this, {
        x : x,
        y: y,
        size: size,
        style : this.ctx.fillStyle

    });
};

// Keep track of the mouse button being pressed and draw a dot at current location
DrawingBoard.prototype.sketchpad_mouseDown = function() {
    this.mouseDown = 1;
    this.drawDot(this.mouseX, this.mouseY, this.canevasSize);
};

// Keep track of the mouse button being released
DrawingBoard.prototype.sketchpad_mouseUp = function() {
    this.mouseDown = 0;
};

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
DrawingBoard.prototype.sketchpad_mouseMove = function(e) {
    // Update the mouse co-ordinates when moved
    this.getMousePos(e);

    // Draw a dot if the mouse button is currently being pressed
    if (this.mouseDown === 1) {
        this.drawDot(this.mouseX, this.mouseY, this.canevasSize);
    }
};

// Get the current mouse position relative to the top-left of the canvas
DrawingBoard.prototype.getMousePos = function(e) {
    if (!e)
        e = event;

    if (e.offsetX) {
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
    }
    else if (e.layerX) {
        this.mouseX = e.layerX;
        this.mouseY = e.layerY;
    }
};

// Draw something when a touch start is detected
DrawingBoard.prototype.sketchpad_touchStart = function() {
    // Update the touch co-ordinates
    this.getTouchPos();

    this.drawDot(this.touchX, this.touchY, this.canevasSize);

    // Prevents an additional mousedown event being triggered
    event.preventDefault();
};

// Draw something and prevent the default scrolling when touch movement is detected
DrawingBoard.prototype.sketchpad_touchMove = function(e) {
    // Update the touch co-ordinates
    this.getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    this.drawDot(this.touchX, this.touchY, this.canevasSize);

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
};

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
DrawingBoard.prototype.getTouchPos = function(e) {
    if (!e)
        e = event;
    if (e.touches) {
        if (e.touches.length === 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            this.touchX = touch.pageX - touch.target.offsetLeft;
            this.touchY = touch.pageY - touch.target.offsetTop;
        }
    }
};


// Set-up the canvas and add our event handlers after the page has loaded
DrawingBoard.prototype.initCanvas = function () {
    // Get the specific canvas element from the HTML document
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (this.canvas.getContext)
        this.ctx = this.canvas.getContext('2d');

    // Check that we have a valid context to draw on/with before adding event handlers
    if (this.ctx) {
        // React to mouse events on the canvas, and mouseup on the entire document
        this.canvas.addEventListener('mousedown', this.sketchpad_mouseDown.bind(this), false);
        this.canvas.addEventListener('mousemove', this.sketchpad_mouseMove.bind(this), false);
        window.addEventListener('mouseup', this.sketchpad_mouseUp.bind(this), false);

        // React to touch events on the canvas
        this.canvas.addEventListener('touchstart', this.sketchpad_touchStart.bind(this), false);
        this.canvas.addEventListener('touchmove', this.sketchpad_touchMove.bind(this), false);
    }
};

    // Clear the canvas context using the canvas width and height
DrawingBoard.prototype.clearCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.onClear.call(this);
};

DrawingBoard.prototype.dataUrl = function () {
    return this.canvas.toDataURL();
};

DrawingBoard.prototype.setDataUrl = function (strImg) {
    var img = new Image;
    img.src = strImg;
    img.onload = (function(){
        this.ctx.drawImage(img,0,0);
    }).bind(this);
};

