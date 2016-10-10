'use strict';

t.setTitle('Gzip encrypt / decrypt unzip with RSA, time measurements');

var fs = require('fs');
var myLib = require('../../arc-and-crypt-lib.js');

var inputFilePath = 'data/3M';

var inputData = fs.readFileSync(inputFilePath);

l.println('inputFilePath: ' + inputFilePath);

var privKey = fs.readFileSync('data/privKey.pem');
var pubKey = fs.readFileSync('data/pubKey.pem');

l.println('Pure RSA encryption');

var time = process.hrtime();
var encryptedData = myLib.compressAndEncryptWithPubKey(inputData, pubKey);
var diff = process.hrtime(time);
l.println(`Encryption took ${(diff[0] * 1e9 + diff[1])/1e6} ms`);

time = process.hrtime();
var decryptedData = myLib.decryptAndDecompressWithPrivKey(encryptedData, privKey);
diff = process.hrtime(time);
l.println(`Decription took ${(diff[0] * 1e9 + diff[1])/1e6} ms`);
a.true(inputData.equals(decryptedData), 'Encrypt/Decrypt check');

l.sep();
l.println('RSA + AES encryption');

time = process.hrtime();
encryptedData = myLib.compressAndEncryptWithPubKeyNoAes(inputData, pubKey);
diff = process.hrtime(time);
l.println(`Encryption took ${(diff[0] * 1e9 + diff[1])/1e6} ms`);

time = process.hrtime();
decryptedData = myLib.decryptAndDecompressWithPrivKeyNoAes(encryptedData, privKey);
diff = process.hrtime(time);
l.println(`Decription took ${(diff[0] * 1e9 + diff[1])/1e6} ms`);

a.true(inputData.equals(decryptedData), 'Encrypt/Decrypt check');
