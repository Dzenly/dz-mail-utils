'use strict';

//var inputFile = 'data/pubExper';
// var inputFile = 'data/255B';
var inputFile = 'data/1.2K';
// var inputFile = 'data/3M';
// var inputFile = 'data/27M';

t.setTitle('Gzip encrypt / decrypt unzip with password');

var fs = require('fs');
var myLib = require('../../arc-and-crypt-lib.js');

var password1 = 'password';
var password2 = 'password1';

var privKey = fs.readFileSync('data/privKey.pem');
var pubKey = fs.readFileSync('data/pubKey.pem');
var privKey1 = fs.readFileSync('data/privKey1.pem');
var pubKey1 = fs.readFileSync('data/pubKey1.pem');

function testPassword(inputData, encryptPassword, decryptPassword) {
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

function testRsaKeys(inputData, encryptKey, decryptKey) {
  l.println('initial data type: ' + typeof inputData);
  l.println('initial data length: ' + inputData.length);
  var encryptedData = myLib.compressAndEncryptWithPubKey(inputData, encryptKey);
  l.println('encrypted length: ' + encryptedData.length);
  gIn.tracer.resourcesUsage();
  var decryptedData = myLib.decryptAndDecompressWithPrivKey(encryptedData, decryptKey);
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

var inputDataBuf = fs.readFileSync(inputFile);
testPassword(inputDataBuf, password1, password1);

// for (var i = 0, len = 300; i < len; i++) {
//   test(inputDataBuf, password1, password1);
// }

var inputDataStr = fs.readFileSync(inputFile, {encoding: 'utf8'});
testPassword(inputDataStr, password1, password1);

a.exception(function () {
  testPassword(inputDataBuf, password1, password2);
}, 'Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt');

a.exception(function () {
  testPassword(inputDataBuf, password1);
}, 'TypeError: Key must be a buffer');

// Error: Must give cipher-type, key'

a.exception(function () {
  testPassword(inputDataBuf, password1, null);
}, 'TypeError: Key must be a buffer');


l.sep();

l.println('RSA Testing');

l.println('Key as buffer');
testRsaKeys(inputDataBuf, pubKey, privKey);
testRsaKeys(inputDataStr, pubKey, privKey);

l.println('Key as string');
testRsaKeys(inputDataBuf, pubKey, privKey.toString());
testRsaKeys(inputDataStr, pubKey, privKey.toString());

a.exception(function () {
  testRsaKeys(inputDataBuf, pubKey, privKey1);
}, 'Error: error:0407109F:rsa routines:RSA_padding_check_PKCS1_type_2:pkcs decoding error');

a.exception(function () {
  testRsaKeys(inputDataBuf, pubKey);
}, 'TypeError: Key must be a buffer');

a.exception(function () {
  testRsaKeys(inputDataBuf, pubKey, null);
}, 'TypeError: Key must be a buffer');
