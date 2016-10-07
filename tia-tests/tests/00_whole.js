'use strict';

var crypto = require('crypto');
var Bluebird = require('bluebird');
var request = require('request');

var cryptoLib = require('../../crypto-lib/arc-and-crypt-lib.js');
var mailOpts = require('./sett-no-git.json');
var password = 'abcdef';
var sendUri = 'http://localhost:8001/send';
var inspect = require('util').inspect;


// JSON format:
// {
//   "host": "smtp.yandex.ru",
//   "user": "acc-name@server-name.xx",
//   "password": "my_password"
// }

mailOpts.from = '"Incident tests" <build@rvision.pro>';
mailOpts.to = 'dzen-test@yandex.ru';
mailOpts.subject = 'Test subject for incidents excange';
mailOpts.text = 'Test text';
mailOpts.html = '<h1>Test HTML <h1>';
mailOpts.waitResponse = true;

function *main() {

  var inputData = crypto.randomBytes(1e6);
  var encryptedData = yield cryptoLib.compressAndEncryptWithPasswordAsync(inputData, password);
  l.println('encrypted length: ' + encryptedData.length);

  var base64EncData = encryptedData.toString('base64');
  l.println('encrypted base64 length: ' + base64EncData.length);

  mailOpts.attachment = base64EncData;

  var response = yield new Bluebird(function (resolve, reject) {
    request.post({
      uri: sendUri,
      json: true,
      body: mailOpts
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

  l.println('Response: ' + inspect(response));
}


u.execGen(main);
