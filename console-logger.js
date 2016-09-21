'use strict';

var getMailPrefix = 'GetMail: ';

module.exports = {
  error: function (msg) {
    console.error(getMailPrefix + 'Error: ' + msg);
  },
  log: function (msg) {
    console.log(getMailPrefix + 'Log: ' + msg);
  },
  verbose: function (msg) {
    console.log(getMailPrefix + 'Verbose: ' + msg);
  }
};
