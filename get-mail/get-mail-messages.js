'use strict';

var co = require('co');
var Bluebird = require('bluebird');
var Imap = require('imap');
var MailParser = require('mailparser').MailParser;

function getImapObj(imap) {
  return {

    imap: imap, // Can be null if connection is failed.

    fetchedUids: [],

    failedMsgs: [], // {uid: error}

    parsedMsgs: [], // Parsed messages.

    addParsedMsg: function (uid, msg) {
      this.fetchedUids.push(uid);
      this.parsedMsgs.push(msg);
    },

    addFailedMsg: function (uid, err) {
      this.failedMsgs.push(uid + ': ' + err);
    },

    /**
     * Adds flags to fetchedUids.
     *
     * @param {Array|string} flags
     *
     * @return {Promise} (resolved to true, if ok)
     */
    addFlags: function (flags) {
      var self = this;
      return new Bluebird(function (resolve, reject) {
        self.imap.addFlags(self.fetchedUids, flags, function (err) {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      })
    },

    delFlags: function (flags) {
      var self = this;
      return new Bluebird(function (resolve, reject) {
        self.imap.delFlags(self.fetchedUids, flags, function (err) {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      })
    },

    /**
     * Expunges fetchecUids. Mark messages with 'Deleted' flag before this call.
     *
     * @return {Promise} (resolved to true, if ok)
     */
    expunge: function () {
      var self = this;
      return new Bluebird(function (resolve, reject) {
        self.imap.expunge(function (err) {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      })
    },

    end: function () {
      this.imap.end();
    },

    destroy: function () {
      this.imap.destroy();
    }
  }
}

/**
 * Tries to get a message with given uid.
 *
 * @return {Promise} which contains object representing message parsed by mailparser.
 */
function fetchMsg(imap, uid, logger) {

  return new Bluebird(function (resolve, reject) {

    var fetchResult;
    var parsedMail = null;
    try {
      fetchResult = imap.fetch(uid, {
        bodies: ''
      });
    } catch (e) {
      logger.error('Fetch error: ' + err);
      reject(err);
      return;
    }

    fetchResult.once('error', function (err) {
      logger.error('Fetch error: ' + err);
      reject(err);
      return;
    });

    fetchResult.once('end', function () {

    });

    fetchResult.on('message', function (msg, seqno) {

      logger.verbose('Msg #' + seqno);

      var mailParser = new MailParser();

      msg.on('body', function (stream, info) {
        logger.verbose('Body info: ' + info);
        stream.on('data', function (chunk) {
          try {
            mailParser.write(chunk);
          } catch (e) {
            logger.error('Error at mailParser.write: ' + e);
            reject(e);
            return;
          }
        })
      });

      msg.on('end', function () {
        try {
          mailParser.end();
        } catch (e) {
          logger.error('Error at mailParser.end: ' + e);
          reject(e);
          return;
        }
      });

      mailParser.on('end', function (mail) {
        parsedMail = mail;
        resolve(parsedMail);
      });

      // mailParser.on('headers', function(headers){
      //   logger.verbose('Headers: ' + headers.received);
      // });

    });
  });
}

function *fetchMsgs(imap, uids, logger) {

  var imapObj = getImapObj(imap);

  for (var i = 0, len = uids.length; i < len; i++) {
    var uid = uids[i];
    logger.verbose('Fetching msg with uid: ' + uid);

    yield fetchMsg(imap, uid, logger)
      .then(function (msg) {
        imapObj.addParsedMsg(uid, msg);
      }, function (err) {
        imapObj.addFailedMsg(uid, err);
      });
  }

  return imapObj;
}

/**
 * Tries to get email messages using the specified mailConfig and filters.
 *
 * Returns a promise.

 * Promise will be rejected if there is:
 * some error with mailConfig,
 * fail at connection creation.
 * fail at box opening.
 * fail at search (no results is not fail).
 *
 * Promise will be resolved to null if there is no results.
 *
 *
 *
 * @param {object} mailConfig
 * @param {string} mailConfig.address
 * @param {string} mailConfig.password
 * @param {string} mailConfig.host
 * @param {boolean} mailConfig.tls
 * @param {boolean} [mailConfig.port=993 for tls and 143 if not-tls]
 *
 * @param filters - array of filters for imap.search() function, see
 * https://www.npmjs.com/package/imap for more details.
 *
 * @param {object} [options]
 * @param {object|string} [options.logger] - the object exposing methods: error(msg), log(msg), verbose(msg)
 * Use 'console' string to use built in console logger. If undefined - there will be no logs.
 * @param {string} [options.boxName='INBOX']
 *
 * @return {Promise} - resolved by array of JSON objects representing e-mails.
 *
 *
 *
 */
exports.getMessages = function (mailConfig, filters, options) {

  options = options || {};

  var logger = options.logger;
  if (logger === 'console') {
    logger = require('../console-logger.js');
  } else if (!logger) {
    logger = require('../fake-logger.js');
  }

  var boxName = options.boxName || 'INBOX';

  var imapConfig = {
    user: mailConfig.address,
    password: mailConfig.password,
    host: mailConfig.host,
    port: mailConfig.port || (mailConfig.tls ? 993 : 143),
    tls: mailConfig.tls,
    autotls: 'required',
    keepalive: false,
    tlsOptions: {
      rejectUnauthorized: false
    }
  };

  return new Bluebird(function (resolve, reject) {

    var imap;

    try {
      imap = new Imap(imapConfig);
    } catch (e) {
      logger.error('Imap creation error: ' + err);
      reject(err);
    }

    imap.once('error', function (err) {
      // TODO: What is the separate handling for ?
      // if (err && err.code && err.code.toUpperCase() === 'ECONNRESET') {
      //   return;
      // }
      logger.error('Connection error: ' + err);
      imap.destroy();
      reject(err);
    });

    // imap.once('end', function () {
    //   // log.verbose('IMAP connection ended');
    // });

    imap.once('ready', function () { // No parameters.

      imap.openBox(boxName, function (err, box) {

        if (err) {
          logger.error('openBox error: ' + err);
          imap.destroy();
          reject(err);
          return;
        }

        imap.search(filters, function (err, uids) { // imap.search() returns nothing.

          if (err) {
            logger.error('Search error: ' + err);
            imap.destroy();
            reject(err);
            return;
          }

          if (!uids.length) {
            logger.verbose('No results for filter: ' + filters);
            imap.end();
            resolve(null);
            return;
          }

          resolve(co(fetchMsgs(imap, uids, logger)));

        }); // search
      }); // openBox
    }); // ready

    imap.connect();
  });
};
