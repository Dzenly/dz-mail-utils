'use strict';

var send = require('./send-mail-utility.js');
var mailOpts = require('./sett-no-git.js');
var request = require('request');

mailOpts.from = '"Incident tests" <build@rvision.pro>';
mailOpts.to = 'dzen-test@yandex.ru';
mailOpts.subject = 'Test subject for incidents excange';
mailOpts.text = 'Test text';
mailOpts.html = '<h1>Test HTML <h1>';
mailOpts.attachment = 'My Super attachment';
mailOpts.waitResponse = true;

// request.debug = true;

request.post({
  uri: 'http://localhost:8001/send',
  json: true,
  body: mailOpts
}, function (err, resp, body) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('RESP:');
  console.dir(resp);

  console.log('BODY:');
  console.dir(body);
});
