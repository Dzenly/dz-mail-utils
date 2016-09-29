'use strict';

var request = require('request');



var payload = require('./input-data.js')('2mb.jpg');



// var testUrl = 'localhost:3001/api/';
// var httpPref = 'http://' + testUrl;
// var httpsPref = 'https://' + testUrl;

// function req(isHttps, isGet, url, msg, body) {
//   var actUrl = isHttps ? httpsPref : httpPref;
//   actUrl += url;
//   if (msg) {
//     t.msgBold(msg);
//     t.msg(indent + 'Getting url: ' + actUrl);
//   }
//
//   var options = {
//     uri: actUrl,
//     resolveWithFullResponse: true
//   };
//
//   if (!isGet) {
//     options.json = true;
//     options.body = body;
//   }
//
//   // if (isHttps) {
//   //   options.agentOptions = {
//   //     strictSSL: true,
//   //     ca: getCert(),
//   //     pfx: pfx,
//   //     passphrase: 'Dbsh4_e', // Если нужно будет поменять это, нужно поменять dz-cert-utils тоже.
//   //     rejectUnauthorized: true, // Trust to listed certificates only. Don't trust even google's certificates.
//   //     secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
//   //     secureProtocol: 'SSLv23_method',
//   //     ciphers: 'ECDHE-RSA-AES128-SHA256',
//   //     checkServerIdentity: function (host, cert) {
//   //       t.eq(host, cert.subject.CN, 'Cert CN checking');
//   //       if (host !== cert.subject.CN) {
//   //         return 'Incorrect server identity';
//   //       }
//   //     }//,
//   //     //agent: false
//   //
//   //   };
//   //   options.agent = false;
//   // }
//
//   return request[isGet ? 'get' : 'post'](options);
// }

// var options = {
//   url: 'localhost:8001/send',
//   resolveWithFullResponse: true,
//   json: true,
//   body: payload
// };
