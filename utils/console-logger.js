'use strict';

var getMailPrefix = 'GetMail: ';

module.exports = {
  error: function (msg) {
    console.error(getMailPrefix + 'Error: ' + msg);
  },
  debug: function (msg) {
    console.log(getMailPrefix + 'Debug: ' + msg);
  }
};
