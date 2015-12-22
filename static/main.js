var canvas;
var g;
var socket;

var TIME_SCALE = .5;
var FRICTION = .97;

var lastTime = 0;

var users = {};

function begin() {
    canvas = document.getElementById("canvas");

    canvas.width = $("#canvas").width();
    canvas.height = $("#canvas").height();

    g = canvas.getContext('2d');

    $(window).resize( function() {
        canvas.width = $("#canvas").width();
        canvas.height = $("#canvas").height();

        draw();
    });

    start();
    animate();
}

function animate( step ) {
    var timeStep = step - lastTime;
    requestAnimationFrame( animate );
    if( isNaN( step ) ) {
        return;
    }
    draw( timeStep );
    lastTime = step;
}

function start() {
    var socket = io();

    socket.on('type', function(msg){
        var user;

        if( !(msg.id in users) ) {
            var color = '#'+Math.floor(Math.random()*16777215).toString(16);
            user = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: 0,
                dy: 0,
                id: msg.id,
                timer: msg.timer,
                color: color,
                textColor: invertColor( color ),
                alive: true,
                text: msg.text
            };
            users[msg.id] = user;
        }
        else {
            user = users[msg.id];
        }

        user.timer = msg.timer;
        user.text = msg.text;
        console.log( user.timer );
    });

    socket.on('kill', function(msg) {
        users[msg].alive = false;
    });

    window.addEventListener(
        "keydown",
        function( e ) {
            socket.emit( 'type', String.fromCharCode( e.which ) );
            e.preventDefault();
        },
        false
    );
}

function draw( timeStep )
{
    if( timeStep == undefined ) timeStep = 1000.0/30.0;
    g.fillColor = '#FFFFFF';
    g.clearRect(0, 0, canvas.width, canvas.height);

    for( var k in users ) {
        var user = users[k];

        user.timer -= timeStep/1000.0;
        if( user.timer < 0 || isNaN(user.timer) ) {
            user.timer = 0;
        }

        if( !user.alive && user.timer <= 0 ) {
            delete users[k];
            continue;
        }

        if( user.timer <= 0 ) continue;

        g.strokeColor = "#000000";

        var staticSize = 100;
        var textSize = g.measureText( user.text ).width;
        var scale = 1.0 / Math.max( textSize, staticSize );
        var scaleFactor = user.timer * TIME_SCALE * 100;

        var width = scaleFactor;
        var height = (Math.max( textSize, staticSize )/40.0) * scaleFactor;

        if( (user.x + width/2) > canvas.width ) {
            user.dx -= .1;
        }

        if( (user.x - width/2) < 0 ) {
            user.dx += .1;
        }

        for( var j in users ) {
            if( j == k ) continue;
            var u2 = users[j];
        }

        user.dx *= FRICTION;
        user.dy *= FRICTION;

        user.x += user.dx;
        user.y += user.dy;

        g.save();
        g.translate( user.x, user.y );

        g.scale( scale * scaleFactor, scale * scaleFactor );

        drawOval( -textSize/2 - 10, -15, textSize + 20, 25 );
        g.strokeText( user.text, -textSize/2, 0 );
        g.restore();
    }
}

function ellipse(aX, aY, aWidth, aHeight)
{
    g.save();
    var hB = (aWidth / 2) * .5522848,
    vB = (aHeight / 2) * .5522848,
    eX = aX + aWidth,
    eY = aY + aHeight,
    mX = aX + aWidth / 2,
    mY = aY + aHeight / 2;
    g.moveTo(aX, mY);
    g.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
    g.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
    g.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
    g.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
    g.closePath();
    g.restore();
}
function fillOval(aX, aY, aWidth, aHeight)
{
    g.beginPath();
    ellipse(aX, aY, aWidth, aHeight);
    g.fill();
}

function drawOval(aX, aY, aWidth, aHeight)
{
    g.beginPath();
    ellipse(aX, aY, aWidth, aHeight);
    g.stroke();
}

function invertColor(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
}
