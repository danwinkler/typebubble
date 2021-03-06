var express = require( 'express' );
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameloop = require('node-gameloop');
var fs = require('fs');

var freqs = JSON.parse( fs.readFileSync( 'bigram_freq.json' ) );

app.set('port', (process.env.PORT || 8080))

app.get('/', function(req, res){
    res.sendFile(__dirname + '/static/index.html');
});

app.use( express.static( 'static' ) );
app.use( '/js', express.static( __dirname + '/node_modules/jquery/dist/' ) );

// SOCKET STUFF

var modifier = 4;

var users = {};

io.on( 'connection', function( socket ) {
    for( var k in users ) {
        socket.emit( "type", users[k] );
    }

    var user = {};
    user.text = "";
    user.timer = 0;
    user.connected = true;
    user.id = socket.id;

    users[socket.id] = user;

    socket.on("type", function(msg) {
        var inc = 0;
        if( msg == '\b' ) {
            user.text = user.text.slice( 0, -1 );
            inc = .001;
        }
        else {
            user.text += msg;
            inc = freqs[user.text.slice( -2 )] || .001;
        }
        user.timer += .5; //inc * modifier;
        if( isNaN( user.timer ) ) console.log( 'after' )
        io.emit( 'type', user );
    });

    socket.on("disconnect", function() {
        user.connected = false;
    });
});

//GAME LOOP
var frameTime = 1000/5;
var gameLoopID = gameloop.setGameLoop( function(delta) {
    for( var k in users ) {
        var user = users[k];

        user.timer -= delta;
        if( user.timer < 0 ) {
            user.timer = 0;
        }

        if( !user.connected && user.timer <= 0 ) {
            delete users[k];
        }
    }
}, frameTime );


http.listen(app.get('port'), function(){
    console.log('listening on *.' + app.get('port'));
});
