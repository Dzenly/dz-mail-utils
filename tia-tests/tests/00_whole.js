'use strict';

var crypto = require('crypto');
var Bluebird = require('bluebird');
var request = require('request');
var util = require('util');

var cryptoLib = require('../../crypto-lib/arc-and-crypt-lib.js');

var sendMailOpts = require('./send-sett-no-git.json');
// JSON format:
// {
//   "host": "smtp.yandex.ru",
//   "user": "acc-name@server-name.xx",
//   "password": "my_password"
// }

var getMailOpts = require('./get-sett-no-git.json');
// {
//   "address": "acc@server.xx",
//   "password": "my_pass",
//   "host": "imap.yandex.ru",
//   "port": 993,
//   "tls": true
// }
// ?? remove

var password = 'abcdef';
var sendUri = 'http://localhost:8001/send';
var fetchUri = 'http://localhost:8000/fetch';
var inspect = require('util').inspect;

sendMailOpts.from = '"Incident tests" <build@rvision.pro>';
sendMailOpts.to = 'dzen-test@yandex.ru';
sendMailOpts.subject = 'Test subject for incidents exchange';
sendMailOpts.text = 'Test text';
sendMailOpts.html = '<h1>Test HTML <h1>';
sendMailOpts.waitResponse = true;

function sendRequest(base64EncData) {
  l.println('Request to send mail.');
  sendMailOpts.attachment = base64EncData;
  return new Bluebird(function (resolve, reject) {
    request.post({
      uri: sendUri,
      json: true,
      body: sendMailOpts
    }, function (err, resp, body) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        resp: {
          statusCode: resp.statusCode,
          statusMessage: resp.statusMessage
        },
        body: body
      });
    });
  });
}

function getRequest() {
  l.println('Request to get mail.');
  getMailOpts.remove = false;
  return new Bluebird(function (resolve, reject) {
    request({
      uri: fetchUri,
      qs: getMailOpts,
    }, function (err, resp, body) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        resp: {
          statusCode: resp.statusCode,
          statusMessage: resp.statusMessage
        },
        body: body
      });
    });
  });
}

function getFirstAttachments(response) {
  var parsedGetJson = JSON.parse(response.body);
  var attachments = parsedGetJson.map(function (item) {
    return new Buffer(item.attachments[0].content.data);
  });
  return attachments;
}

function *main() {

  var inputData1 = crypto.randomBytes(1e6);
  var inputData2 = crypto.randomBytes(5e5);

  var encryptedData1 = yield cryptoLib.compressAndEncryptWithPasswordAsync(inputData1, password);
  l.println('encrypted length1: ' + encryptedData1.length);

  var encryptedData2 = yield cryptoLib.compressAndEncryptWithPasswordAsync(inputData2, password);
  l.println('encrypted length2: ' + encryptedData2.length);

  var decryptedInputData1 = yield cryptoLib.decryptAndDecompressWithPasswordAsync(encryptedData1, password);
  var decryptedInputData2 = yield cryptoLib.decryptAndDecompressWithPasswordAsync(encryptedData2, password);

  // console.log('Types:');
  // console.log(typeof decryptedInputData1);
  // console.log(typeof decryptedInputData2);

  a.true(decryptedInputData1.equals(inputData1), 'Decrypt immediately after encrypt 1');
  a.true(decryptedInputData2.equals(inputData2), 'Decrypt immediately after encrypt 2');

  var base64EncData1 = encryptedData1.toString('base64');
  l.println('encrypted base64 length1: ' + base64EncData1.length);

  var base64EncData2 = encryptedData2.toString('base64');
  l.println('encrypted base64 length2: ' + base64EncData2.length);

  var deconvInputData1 = Buffer.from(base64EncData1, 'base64');
  var deconvInputData2 = Buffer.from(base64EncData2, 'base64');

  var checkConvDecryptedData1 = yield cryptoLib.decryptAndDecompressWithPasswordAsync(deconvInputData1, password);
  var checkConvDecryptedData2 = yield cryptoLib.decryptAndDecompressWithPasswordAsync(deconvInputData2, password);

  a.true(checkConvDecryptedData1.equals(inputData1), 'Decrypt after conv/deconv 1');
  a.true(checkConvDecryptedData2.equals(inputData2), 'Decrypt after conv/deconv 2');

  var response = yield sendRequest(base64EncData1);
  l.println('Response: ' + inspect(response));
  yield Bluebird.delay(1000);

  response = yield sendRequest(base64EncData2);
  l.println('Response: ' + inspect(response));

  yield Bluebird.delay(15000);

  var getResponse = yield getRequest();

  var attachments = getFirstAttachments(getResponse);

  l.println('Data1 encrypted length: ' + attachments[1].length);
  l.println('Data2 encrypted length: ' + attachments[0].length);

  // console.log(encryptedData1.toString('hex'));
  // console.log(attachments[1].toString('hex'));
  // console.log(encryptedData2.toString('hex'));
  // console.log(attachments[0].toString('hex'));

  var data1 = yield cryptoLib.decryptAndDecompressWithPasswordAsync(attachments[0], password);
  var data2 = yield cryptoLib.decryptAndDecompressWithPasswordAsync(attachments[1], password);

  a.true(data1.equals(inputData1), 'Encoded and Decoded data 1 are equal');
  a.true(data2.equals(inputData2), 'Encoded and Decoded data 2 are equal');


  // l.println('Response: ' + inspect(getResponse));


}


u.execGen(main);
