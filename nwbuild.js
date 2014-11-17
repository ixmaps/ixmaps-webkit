// Uses nwbuild to create a webkit app

/* jslint node: true */

'use strict';

var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
    files: './dest/**', // use the glob format
    platforms: ['linux64','osx']
});

// Log stuff you want
nw.on('log',  console.log);
nw.on('error',  function(err, res) { console.log('error', err); });

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});

// And supports callbacks
nw.build(function(err) {
    if(err) console.log(err);
});
