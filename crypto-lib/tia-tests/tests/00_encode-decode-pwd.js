'use strict';

t.setTitle('Gzip encrypt / decrypt unzip with password');

var fs = require('fs');
var myLib = require('../../arc-and-crypt-lib.js');

var password1 = 'password';
var password2 = 'password1';

function test(inputData, encryptPassword, decryptPassword) {
  l.println('initial data type: ' + typeof inputData);
  l.println('initial data length: ' + inputData.length);
  var encryptedData = myLib.compressAndEncryptWithPassword(inputData, encryptPassword);
  l.println('encrypted length: ' + encryptedData.length);
  gIn.tracer.resourcesUsage();
  var decryptedData = myLib.decryptAndDecompressWithPassword(encryptedData, decryptPassword);
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

// var inputFile = 'data/1.2K';
var inputFile = 'data/3M';
// var inputFile = 'data/27M';

var inputDataBuf = fs.readFileSync(inputFile);
test(inputDataBuf, password1, password1);

// for (var i = 0, len = 300; i < len; i++) {
//   test(inputDataBuf, password1, password1);
// }

var inputDataStr = fs.readFileSync(inputFile, {encoding: 'utf8'});
test(inputDataStr, password1, password1);

a.exception(function () {
  test(inputDataBuf, password1, password2);
}, 'Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt');

a.exception(function () {
  test(inputDataBuf, password1);
}, 'TypeError: Key must be a buffer');

// Error: Must give cipher-type, key'

a.exception(function () {
  test(inputDataBuf, password1, null);
}, 'TypeError: Key must be a buffer');
