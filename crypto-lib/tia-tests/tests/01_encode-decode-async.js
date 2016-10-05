'use strict';

var fs = require('fs');

//var inputFile = 'data/pubExper';
// var inputFile = 'data/255B';
var inputFile = 'data/1.2K';
// var inputFile = 'data/3M';
// var inputFile = 'data/27M';

var privKey = fs.readFileSync('data/privKey.pem');
var pubKey = fs.readFileSync('data/pubKey.pem');
var privKey1 = fs.readFileSync('data/privKey1.pem');
var pubKey1 = fs.readFileSync('data/pubKey1.pem');

var fs = require('fs');
var myLib = require('../../arc-and-crypt-lib.js');

var password1 = 'password';
var password2 = 'password1';

function *testPassword(inputData, encryptPassword, decryptPassword) {
  l.println('initial data type: ' + typeof inputData);
  l.println('initial data length: ' + inputData.length);
  l.println('Encrypt password: ' + encryptPassword + ', decryptPassword: ' + decryptPassword);
  var encryptedData = yield myLib.compressAndEncryptWithPasswordAsync(inputData, encryptPassword);

  l.println('encrypted length: ' + encryptedData.length);
  gIn.tracer.resourcesUsage();

  var decryptedData = yield myLib.decryptAndDecompressWithPasswordAsync(encryptedData, decryptPassword);

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

  return true;
}

function *testRsaKeys(inputData, encryptKey, decryptKey) {
  l.println('initial data type: ' + typeof inputData);
  l.println('initial data length: ' + inputData.length);
  var encryptedData = yield myLib.compressAndEncryptWithPubKeyAsync(inputData, encryptKey);
  l.println('encrypted length: ' + encryptedData.length);
  gIn.tracer.resourcesUsage();
  var decryptedData = yield myLib.decryptAndDecompressWithPrivKeyAsync(encryptedData, decryptKey);
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

  return true;
}

// function *test1() {
//   // yield Promise.reject('Error it Test1');
//   return yield *test(inputDataBuf, password1);
// }

function *main() {
  t.setTitle('Gzip and encrypt the data');

  // var inputFile = 'data/10B';
  var inputFile = 'data/1.2K';
  // var inputFile = 'data/3M';
  // var inputFile = 'data/27M';

  var inputDataBuf = fs.readFileSync(inputFile);
  yield *testPassword(inputDataBuf, password1, password1);

// for (var i = 0, len = 300; i < len; i++) {
//   test(inputDataBuf, password1, password1);
// }
  var inputDataStr = fs.readFileSync(inputFile, {encoding: 'utf8'});
  yield *testPassword(inputDataStr, password1, password1);

  yield a.exceptionAsync(function *() {
    return yield *testPassword(inputDataBuf, password1, password2);
  }, 'Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt');

  yield a.exceptionAsync(function *() {
    return yield *testPassword(inputDataBuf, password1); // , null
  }, 'Error: No Password or RSA Key');

  yield a.exceptionAsync(function *() {
    return yield *testPassword(inputDataBuf, password1, null);
  }, 'Error: No Password or RSA Key');

  l.sep();
  l.println('RSA testing');

  l.println('Key as buffer');
  yield *testRsaKeys(inputDataBuf, pubKey, privKey);
  yield *testRsaKeys(inputDataStr, pubKey, privKey);

  l.println('Key as string');
  yield *testRsaKeys(inputDataBuf, pubKey, privKey.toString());
  yield *testRsaKeys(inputDataStr, pubKey, privKey.toString());

  yield a.exceptionAsync(function *() {
    return yield *testRsaKeys(inputDataBuf, pubKey, privKey1);
  }, 'Error: error:0407109F:rsa routines:RSA_padding_check_PKCS1_type_2:pkcs decoding error');

  yield a.exceptionAsync(function *() {
    return yield *testRsaKeys(inputDataBuf, pubKey);
  }, 'Error: No Password or RSA Key');

  yield a.exceptionAsync(function *() {
    return yield *testRsaKeys(inputDataBuf, pubKey, null);
  }, 'Error: No Password or RSA Key');

  yield 'Test done';
}

u.execGen(main);
