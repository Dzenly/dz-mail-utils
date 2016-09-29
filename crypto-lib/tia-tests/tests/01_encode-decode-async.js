'use strict';

var fs = require('fs');
var myLib = require('../../arc-and-crypt-lib.js');

var password1 = 'password';
var password2 = 'password1';

function *test(inputData, encryptPassword, decryptPassword) {
  l.println('initial data type: ' + typeof inputData);
  l.println('initial data length: ' + inputData.length);
  var encryptedData = yield myLib.compressAndEncryptAsync(inputData, encryptPassword);

  l.println('encrypted length: ' + encryptedData.length);
  gIn.tracer.resourcesUsage();

  var decryptedData = yield myLib.decryptAndDecompressAsync(encryptedData, decryptPassword);

  l.println('decrypted length as buffer: ' + decryptedData.length);
  l.println('decrypted length as string: ' + decryptedData.toString().length);
  gIn.tracer.resourcesUsage();
  var cmpResult;
  if (typeof inputData === 'object') {
    cmpResult = inputData.compare(decryptedData) === 0;
  } else {
    cmpResult = inputData === decryptedData.toString();
  }
  a.true(cmpResult, 'Input data is equal to decrypted one');
  gIn.tracer.resourcesUsage();
}

function *main() {
  t.setTitle('Gzip and encrypt the data');

  var inputFile = 'data/1.2K';
  // var inputFile = 'data/3M';
  // var inputFile = 'data/27M';

  var inputDataBuf = fs.readFileSync(inputFile);
  yield *test(inputDataBuf, password1, password1);

// for (var i = 0, len = 300; i < len; i++) {
//   test(inputDataBuf, password1, password1);
// }

  var inputDataStr = fs.readFileSync(inputFile, {encoding: 'utf8'});
  yield *test(inputDataStr, password1, password1);

  try {
    yield a.exceptionAsync(function *() {
      try {
        return yield *test(inputDataBuf, password1, password2);
      } catch(e){
      }
    }, 'Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt');
  } catch(e) {
    // console.error(e);
  }
//
//   a.exceptionAsync(function *() {
//     return yield *test(inputDataBuf, password1);
//   }, 'TypeError: Key must be a buffer');
//
// // Error: Must give cipher-type, key'
//
//   a.exceptionAsync(function *() {
//     return yield *test(inputDataBuf, password1, null);
//   }, 'TypeError: Key must be a buffer');

  yield 'Test done';
}

u.execGen(main);
