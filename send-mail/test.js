'use strict';

var send = require('./send-mail-utility.js');
var mailOpts = require('./sett-no-git.js');
var crypto = require('crypto');

mailOpts.from = '"Incident tests" <build@rvision.pro>';
mailOpts.to = 'dzen-test@yandex.ru';
mailOpts.subject = 'Test subject for incidents excange';
mailOpts.text = 'Test text';
mailOpts.html = '<h1>Test HTML <h1>';

var str = crypto.randomBytes(6e7); // .toString('hex');

require('fs').writeFileSync('BigAttachment', str);

mailOpts.attachment = str;

// mailOpts.attachment = 'My Super attachment';

// send(mailOpts);

send(mailOpts)
  .then(function (info) {
    console.log('INFO AFTER SEND:');
    console.dir(info);
  }, function (err) {
    console.error(err);
    console.error(err.stack);
  });
