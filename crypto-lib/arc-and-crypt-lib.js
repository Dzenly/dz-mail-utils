'use strict';

var crypto = require('crypto');
var zlib = require('zlib');
var fork = require('child_process').fork;
var Bluebird = require('bluebird');

// Fix for debugging child processes in WebStorm, but seems like does not work sometimes.
// http://stackoverflow.com/questions/16840623/how-to-debug-node-js-child-forked-process
var isDebug = typeof v8debug === 'object';
if (isDebug) {
  process.execArgv.push('--debug=' + (40899));
  // process.argv.push('--debug=' + (40894));
  // process.execArgv.push('--debug-brk=' + (40897));
}

// ? 'aes-256-cbc'
var alg = 'aes256';

// 'utf8', 'ascii', or 'binary'
var encoding = 'utf8';

/**
 * @param utf8StrOrBuf
 *
 * @returns {Buffer}
 */
exports.compress = function (utf8StrOrBuf) {
  // data_type is nut supported in Node 6.x.
  return zlib.gzipSync(utf8StrOrBuf, {level: zlib.Z_BEST_COMPRESSION});
};

/**
 * Returns a buffer.
 * @param buf
 */
exports.decompress = function (buf) {
  return zlib.gunzipSync(buf);
};

/**
 * Returns a buffer.
 * @param data
 * @param password
 * @returns {Buffer}
 */
exports.encryptWithPassword = function (data, password) {
  var cipher = crypto.createCipher(alg, password);
  var tmpBuf1 = cipher.update(data, encoding); // Encoding is ignored if utf8Str is Buffer.
  var tmpBuf2 = cipher.final();
  return Buffer.concat([tmpBuf1, tmpBuf2]);
};

/**
 * Returns a buffer.
 * @param data
 * @param password
 * @returns {Buffer}
 */
exports.encryptWithPubKey = function (data, key) {
  throw new Error('Not yet implemented');
};

/**
 * Returns an utf8 string.
 * @param buf
 * @param password
 * @returns {*}
 */
exports.decryptWithPasswordToStr = function (buf, password) {
  var decipher = crypto.createDecipher(alg, password);
  var decryptedStr = decipher.update(buf, undefined, encoding);
  decryptedStr += decipher.final(encoding);
  return decryptedStr;
};

/**
 * Returns a buffer.
 * @param buf
 * @param password
 * @returns {Buffer}
 */
exports.decryptWithPasswordToBuf = function (buf, password) {
  var decipher = crypto.createDecipher(alg, password);
  var tmpBuf1 = decipher.update(buf);
  var tmpBuf2 = decipher.final();
  return Buffer.concat([tmpBuf1, tmpBuf2]);
};

exports.decryptWithPrivKeyToStr = function (buf, password) {
  throw new Error('Not yet implemented');
};

exports.decryptWithPrivKeyToBuf = function (buf, password) {
  throw new Error('Not yet implemented');
};

/**
 * Returns a buffer.
 * @param utf8StrOrBuf
 */
exports.compressAndEncryptWithPassword = function (utf8StrOrBuf, password) {
  var compressed = exports.compress(utf8StrOrBuf);
  return exports.encryptWithPassword(compressed, password);
};

/**
 * Returns a buffer.
 * @param buf
 * @param password
 */
exports.decryptAndDecompressWithPassword = function (buf, password) {
  var decrypted = exports.decryptWithPasswordToBuf(buf, password);
  return exports.decompress(decrypted);
};

exports.compressAndEncryptWithPubKey = function (utf8StrOrBuf, key) {
  throw new Error('Not yet implemented');
};

exports.decryptAndDecompressWithPrivKey = function (buf, key) {
  throw new Error('Not yet implemented');
};

/********** Async part *************/

function forkHelper(fName, data, password, key) {
  return new Bluebird(function (resolve, reject) {
    var child = fork(__filename);
    child.on('message', function (msg) {
      if (msg.data) {
        resolve(new Buffer(msg.data));
      } else if (msg.err) {
        reject(msg.err);
      } else {
        reject(new Error('Unknown data is sent by child.'))
      }
    });
    child.on('error', function (err) {
      reject(err);
    });
    child.send({fName: fName, data: data, pass: password, key: key},
      function () {
      });
  });
}

/**
 *
 * @param {String} cn
 * @returns {Promise} Promise which is resolved to object {cert (String), pfx (String in base64)}.
 */
exports.compressAndEncryptWithPasswordAsync = function (utf8StrOrBuf, password) {
  return forkHelper('compressAndEncryptWithPassword', utf8StrOrBuf, password);
};

/**
 * Returns an utf8 string.
 * @param bufесли не жить с ней, то энергии будет больше, и тогда незачем жить с ней.
 * @param password
 */
exports.decryptAndDecompressWithPasswordAsync = function (buf, password) {
  return forkHelper('decryptAndDecompressWithPassword', buf, password);
};

exports.compressAndEncryptWithPubKeyAsync = function (utf8StrOrBuf, key) {
  return forkHelper('compressAndEncryptWithPubKey', utf8StrOrBuf, key);
};

exports.decryptAndDecompressWithPrivKeyAsync = function (buf, key) {
  return forkHelper('decryptAndDecompressWithPrivKey', buf, key);
};

if (process.send) { // This is child process.
  process.on('message', function (msg) {
    var data;
    if (msg.data.data) { // Buffer was sent to us.
      data = new Buffer(msg.data.data);
    } else {
      data = msg.data; // String was sent to us.
    }
    var res = null;
    try {
      if (msg.pass) {
        res = exports[msg.fName](data, msg.pass);
      } else if (msg.key) {
        res = exports[msg.fName](data, msg.key);
      } else {
        throw (new Error('No Password or RSA Key'));
      }
    } catch (err) {
      process.send({err: err.toString(), stack: err.stack}, function () {
        process.exit(1);
      });
    }
    if (res) {
      process.send(res, function () {
        // https://github.com/nodejs/node-v0.x-archive/issues/2605
        process.exit();
      });
    }
  });
}
