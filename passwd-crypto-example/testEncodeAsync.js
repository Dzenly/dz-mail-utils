var fs = require('fs');
var myLib = require('./arc-and-crypt-lib.js');

var password = 'password';
var password1 = 'password1';

var msg = fs.readFileSync('inputData', {encoding: 'utf8'});

// var msg = fs.readFileSync('inputData');

// TODO: check also for buffer.

// Check that parent process does not wait for child process.

// console.log('original  :', msg);
// console.log('original  length :', msg.length);

myLib.compressAndEncryptAsync(msg, password)
  .then(function (encryptedMsg) {
    // console.log(typeof encryptedMsg);
    // console.log('encrypted :', encryptedMsg);
    // console.log('encrypted length:', encryptedMsg.length);
    fs.writeFileSync('encryptedAsync', encryptedMsg);
  })
  .catch(function (err) {
    console.error(err);
  });
