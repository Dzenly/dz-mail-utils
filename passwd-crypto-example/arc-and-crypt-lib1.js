'use strict';

var crypto = require('crypto');
var zlib = require('zlib');
var fork = require('child_process').fork;
var Bluebird = require('bluebird');

// Фикс для 2х-процессной отладки в WebStorm.
// http://stackoverflow.com/questions/16840623/how-to-debug-node-js-child-forked-process
var isDebug = typeof v8debug === 'object';
if (isDebug) {
  //Set an unused port number.
  process.execArgv.push('--debug=' + (40897));
}

// 0.12.x поддерживает это API.

// TODO: Асинхронные ф-и.

// 'aes-256-cbc'
var alg = 'aes256';

// 'utf8', 'ascii', or 'binary'
var encoding = 'utf8';

// Можно кодировать и Buffer, если на вход пошлешь Buffer, или если выставишь input encoding.

// 'binary', 'base64' or 'hex'
// No out encoding - Buffer will be returned.

// ?? https://nodejs.org/api/buffer.html#buffer_buffer
// binary is alias for latin1 ??

// Also there is an info then 'binary' encoding could be removed from node.js.

/**
 * Returns a buffer.
 * @param utf8StrOrBuf
 */
exports.compress = function (utf8StrOrBuf) {
  // data_type is nut supported in Node 6.5.
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
 * @param utf8Str
 * @param password
 * @returns {Buffer}
 */
exports.encrypt = function (utf8Str, password) {
  var cipher = crypto.createCipher(alg, password);
  var tmpBuf1 = cipher.update(utf8Str, encoding); // Enconding is ignored if utf8Str is Buffer.
  var tmpBuf2 = cipher.final();
  return Buffer.concat([tmpBuf1, tmpBuf2]);
};

/**
 * Returns an utf8 string.
 * @param buf
 * @param password
 * @returns {*}
 */
exports.decrypt = function (buf, password) {
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
exports.decryptToBuf = function (buf, password) {
  var decipher = crypto.createDecipher(alg, password);
  var tmpBuf1 = decipher.update(buf);
  var tmpBuf2 = decipher.final();
  return Buffer.concat([tmpBuf1, tmpBuf2]);
};

/**
 * Returns a buffer.
 * @param utf8StrOrBuf
 */
exports.compressAndEncrypt = function (utf8StrOrBuf, password) {
  var compressed = exports.compress(utf8StrOrBuf);
  return exports.encrypt(compressed, password);
};

/**
 * Returns an utf8 string.
 * @param buf
 * @param password
 */
exports.decryptAndDecompress = function (buf, password) {
  var decrypted = exports.decryptToBuf(buf, password);
  return exports.decompress(decrypted).toString();
};


/**
 *
 * @param {String} cn
 * @returns {Promise} Promise which is resolved to object {cert (String), pfx (String in base64)}.
 */
exports.compressAndEncryptAsync = function (utf8StrOrBuf, password) {
  return new Bluebird(function (resolve, reject) {
    var child = fork(__filename);
    child.on('message', function (msg) {
    //  console.dir(msg);
      resolve(new Buffer(msg.data));
    });
    child.on('error', function (err) {
      reject(err);
    });
    child.send({fName: 'compressAndEncrypt', data: utf8StrOrBuf, pass: password});
  });
};

if (process.send) { // Модуль вызван через fork.
  process.on('message', function (msg) {
    // console.dir(msg);
    // console.dir(msg.data);
    var data;
    if (msg.data.data) {
      data = new Buffer(msg.data.data);
    } else {
      data = msg.data;
    }
    var res = {};
    try {
      res.err = null;
      res.data = null;
      if (msg.pass) {
        res.data = exports[msg.fName](data, msg.pass)
      }
    } catch(err) {
      res.err = err.toString();
    }
    process.send(res, function () {
      // https://github.com/nodejs/node-v0.x-archive/issues/2605
      process.exit();
    });
  });
}
