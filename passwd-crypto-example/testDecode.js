var fs = require('fs');
var myLib = require('./arc-and-crypt-lib.js');

var password = 'password';
var password1 = 'password1';

var inpBuf = fs.readFileSync('outputData');

console.log('encoded  :', inpBuf);
console.log('encoded  length :', inpBuf.length);

var decryptedMsg = myLib.decryptAndDecompress(inpBuf, password);

console.log('decrypted :', decryptedMsg);
console.log('decrypted length:', decryptedMsg.length);

// fs.writeFileSync('outputData', decryptedMsg);

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
