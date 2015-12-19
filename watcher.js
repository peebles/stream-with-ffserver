var watch = require( 'node-watch' );
var fs = require( 'fs' );
var path = require( 'path' );

var config = require( './config.json' );

var dir = process.env.WATCH_DIR;
var PERIOD = config.seconds_to_settle_down * 1000; // time for changes to settle down
var configFile = '/tmp/ff.config';
var cmd = 'ffserver';
var child;

if ( ! dir ) {
    console.log( 'You must setenv WATCH_DIR' );
    process.exit(1);
}

var tmr;
function resetTimer() {
    console.log( 'resetting timer ...' );
    if ( tmr ) clearTimeout( tmr );
    tmr = setTimeout( function() {
	handleChange();
    }, PERIOD );
}

function handleChange() {
    console.log( 'handleChange ...' );
    createConfigFile();
    restartFFserver();
}

function createConfigFile() {
    console.log( 'creating config file:', configFile );
    var header = config.header.join( "\n" ) + "\n";
    var files = fs.readdirSync( dir );
    files.forEach( function( file ) {
	var ext = path.extname( file );
	var name = path.basename( file, ext );

	var stream = [
	    "<Stream " + name + ">",
	    "Format rtp",
	    "File \"" + path.join( dir, file ) + "\""
	];

	stream = stream.concat( config.additional_stream_directives );
	stream = stream.concat( ['</Stream>'] );
	
	header = header + stream.join( "\n" ) + "\n";
    });
    console.log( header );
    fs.writeFileSync( configFile, header );
}

function restartFFserver() {
    console.log( 'restarting', cmd );
    if ( child ) child.kill( 'SIGTERM' );
}

function startFFserver() {
    console.log( 'starting', cmd );
    child = require('child_process').spawn( cmd, [ '-f', configFile ], { env: process.env } );
    child.stdout.on( 'data', function( data ) {
	console.log( data.toString() );
    });
    child.stderr.on( 'data', function( data ) {
	console.log( data.toString() );
    });
    child.on( 'close', function( code ) {
	console.log( 'exited:', code );
	startFFserver();
    });
}

createConfigFile();
startFFserver();
watch( dir, { recursive: false, followSymLinks: false }, function( changed ) {
    resetTimer();
});
