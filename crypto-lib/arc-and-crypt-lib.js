'use strict';

// TODO: To make ICP faster.
// https://github.com/nodejs/node/issues/3145

var crypto = require('crypto');
var zlib = require('zlib');
var fork = require('child_process').fork;
var Bluebird = require('bluebird');
var getTmpFilePath = require('./utils/get-tmp-file-path.js');
var path = require('path');
var fs = require('fs');

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
var constPadding = crypto.constants ? crypto.constants.RSA_PKCS1_PADDING : constants.RSA_PKCS1_PADDING;
var chunkSize = 240;
var keySize = 256;
var ipcByFiles = true;
var tmpDirName = 'tmp';

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
  var len = data.length;
  var begin = 0;
  var end = chunkSize;
  var chunksArray = [];

  do {
    var chunk = data.slice(begin, (end > len) ? len : end);
    chunksArray.push(crypto.publicEncrypt(
      {
        key: key,
        padding: constPadding
      }, chunk));
    begin += chunkSize;
    end += chunkSize;
  } while (begin < len);

  return Buffer.concat(chunksArray, Math.ceil(len / chunkSize) * keySize);
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

exports.decryptWithPrivKeyToStr = function (buf, key) {
  return exports.decryptWithPrivKeyToBuf(buf, key).toString();
};

exports.decryptWithPrivKeyToBuf = function (buf, key) {
  var len = buf.length;
  var begin = 0;
  var end = keySize;
  var chunksArray = [];
  var summLen = 0;

  do {
    var chunk = buf.slice(begin, end);
    var chunkDecoded = crypto.privateDecrypt(
      {
        key: key,
        padding: constPadding
      }, chunk);
    summLen += chunkDecoded.length;
    chunksArray.push(chunkDecoded);
    begin += keySize;
    end += keySize;
  } while (begin < len);

  return Buffer.concat(chunksArray, summLen);
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
  var compressed = exports.compress(utf8StrOrBuf);
  return exports.encryptWithPubKey(compressed, key);
};

exports.decryptAndDecompressWithPrivKey = function (buf, key) {
  var decrypted = exports.decryptWithPrivKeyToBuf(buf, key);
  return exports.decompress(decrypted);
};

/********** Async part *************/

function forkHelper(funcName, data, password, key) {
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

    var msgToChild = {
      funcName: funcName,
      pass: password,
      key: key
    };
    if (ipcByFiles) {
      var filePath = getTmpFilePath(tmpDirName);
      fs.writeFileSync(filePath, data);
      msgToChild.filePath = filePath;
    } else {
      msgToChild.data = data;
    }

    child.send(msgToChild,
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
  return forkHelper('compressAndEncryptWithPubKey', utf8StrOrBuf, null, key);
};

exports.decryptAndDecompressWithPrivKeyAsync = function (buf, key) {
  return forkHelper('decryptAndDecompressWithPrivKey', buf, null, key);
};

if (process.send) { // This is child process.
  process.on('message', function (msg) {
    var data;
    var key;
    var res = null;
    try {
      if (msg.data) {
        if (msg.data.data) { // Buffer was sent to us.
          data = new Buffer(msg.data.data);
        } else {
          data = msg.data; // String was sent to us.
        }
      } else if (msg.filePath) {
        data = fs.readFileSync(msg.filePath);
        fs.unlinkSync(msg.filePath);
      } else {
        throw (new Error('No data or filePath sent to child process'));
      }
      if (msg.pass) {
        res = exports[msg.funcName](data, msg.pass);
      } else if (msg.key) {
        if (msg.key.data) { // Buffer was sent to us.
          key = new Buffer(msg.key.data);
        } else {
          key = msg.key;
        }
        res = exports[msg.funcName](data, key);
      } else {
        throw (new Error('No Password or RSA Key'));
      }
      process.send(res, function () {
        // https://github.com/nodejs/node-v0.x-archive/issues/2605
        process.exit();
      });
    } catch (err) {
      process.send({err: err.toString(), stack: err.stack}, function () {
        process.exit(1);
      });
    }

  });
}
