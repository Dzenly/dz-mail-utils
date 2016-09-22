'use strict';

// 0.12.x поддерживает это API.

// TODO: Асинхронные ф-и.

var crypto = require('crypto');
var zlib = require('zlib');

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
exports.compress = function(utf8StrOrBuf) {
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
