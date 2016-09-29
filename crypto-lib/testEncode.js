var fs = require('fs');
var myLib = require('./arc-and-crypt-lib.js');

var password = 'password';
var password1 = 'password1';

var msg = fs.readFileSync('inputData', {encoding: 'utf8'});

console.log('original  :', msg);
console.log('original  length :', msg.length);

var encryptedMsg = myLib.compressAndEncrypt(msg, password);

console.log('encrypted :', encryptedMsg);
console.log('encrypted length:', encryptedMsg.length);

fs.writeFileSync('outputData', encryptedMsg);

// var decryptedMsg = decrypt(encryptedMsg, password);
//
// console.log('decrypted :', decryptedMsg);
//
// var compressed1 = compress(msg);
//
// var decomp1 = decompress(compressed1);
//
// // console.log(compressed1, compressed1.length);
//
// console.log('original length: ', msg.length);
// console.log('compressed length: ', compressed1.length);
//
// console.log(decomp1.toString());



