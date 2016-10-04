'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

/**
 * Returns tmp file path taking into account passed 'dir'.
 * @param dir
 * @return {string|*}
 */
module.exports = function (dir) {
  dir = dir || './';
  var tmpFilePath;
  do {
    var alreadyExists;
    try {
      var tmpFileName = crypto.randomBytes(8).toString('hex');
      tmpFilePath = path.join(dir, tmpFileName);
      fs.statSync(tmpFilePath);
      alreadyExists = true;
    } catch(e) {
      alreadyExists = false;
    }
  } while(alreadyExists);
  return tmpFilePath;
};

