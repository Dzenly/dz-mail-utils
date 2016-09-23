var fs = require('fs');
var myLib = require('./arc-and-crypt-lib.js');

var password = 'password';
var password1 = 'password1';

var inpBuf = fs.readFileSync('encryptedAsync');

// console.log('encoded  :', inpBuf);
// console.log('encoded  length :', inpBuf.length);

myLib.decryptAndDecompressAsync(inpBuf, password)
  .then(function (decryptedMsg) {
    fs.writeFileSync('decryptedDataAsync', decryptedMsg);
  })
  .catch(function (err) {
    console.error(err);
  });

// console.log('decrypted :', decryptedMsg);
// console.log('decrypted length:', decryptedMsg.length);

