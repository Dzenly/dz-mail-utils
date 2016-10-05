'use strict';

var fs = require('fs');
var myLib = require('./arc-and-crypt-lib.js');

var inputData = fs.readFileSync('tia-tests/data/27M');

var privKey = fs.readFileSync('tia-tests/data/privKey.pem');
var pubKey = fs.readFileSync('tia-tests/data/pubKey.pem');

var time = process.hrtime();
var encryptedData = myLib.compressAndEncryptWithPubKey(inputData, pubKey);
var diff = process.hrtime(time);
console.log(`Benchmark took ${(diff[0] * 1e9 + diff[1])/1e6} ms`);

time = process.hrtime();
var decryptedData = myLib.decryptAndDecompressWithPrivKey(encryptedData, privKey);
diff = process.hrtime(time);
console.log(`Benchmark took ${(diff[0] * 1e9 + diff[1])/1e6} ms`);
console.log(inputData.length, decryptedData.length);
