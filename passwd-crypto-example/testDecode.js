var fs = require('fs');
var myLib = require('./arc-and-crypt-lib.js');

var password = 'password';
var password1 = 'password1';

var inpBuf = fs.readFileSync('outputData');

console.log('encoded  :', inpBuf);
console.log('encoded  length :', inpBuf.length);

var decryptedMsg = myLib.decryptAndDecompress(inpBuf, password);

console.log('decrypted :', decryptedMsg.toString());
console.log('decrypted length:', decryptedMsg.length);

