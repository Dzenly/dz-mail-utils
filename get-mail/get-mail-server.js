'use strict';

var Hapi = require('hapi');
var Boom = require('boom');
var Blipp = require('blipp');
var Joi = require('joi');
var logger = require('../utils/logger');

var getMessages = require('./get-mail-utility.js').getMessages;

// TODO: pass filters in request?
// var filters = ['UNSEEN'];
var filters = [['SINCE', 'September 19, 2016']];

// TODO: pass boxName in request (for now INBOX is used) ?

var fetchValidationSchema = Joi.object().keys({
  address: Joi.string().email().required(),
  password: Joi.string().required(),
  host: Joi.string().hostname().required(), // string.uri ?
  tls: Joi.boolean(),
  port: Joi.number().integer(),
  remove: Joi.boolean()
});

var server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000
});

server.route({
  method: 'GET',
  path: '/fetch',
  handler: function (req, rep) {

    var msgsPromise = getMessages(req.query, filters, {logger: logger});

    msgsPromise.then(
      function (imapObj) {

        rep(imapObj.parsedMsgs); // TODO: how to make sure that rep is successful?

        // Actually reply will be performed at next tick.

        // TODO: is there some post reply action.

        var operationResultPromise;

        if (req.query.remove) {
          operationResultPromise = imapObj.addFlags('Deleted')
            .then(function () {
              logger.debug('"Deleted" flags are set successfully');
              return imapObj.expunge()
                .then(function () {
                  logger.debug('Expunge is successfully');
                });
            })
        } else {
          operationResultPromise = imapObj.addFlags('Seen')
            .then(function () {
              logger.debug('"Seen" flags are set successfully');
            });
        }

        operationResultPromise
          .catch(function (err) {
            logger.error(err);
          })
          .finally(function () {
            imapObj.end();
          });

      }, function (err) {
        rep(Boom.badRequest(err));
      });
  },
  config: {
    validate: {
      query: fetchValidationSchema
    }
  }
});

server.register({register: Blipp, options: {}}, function (err) {
  server.start((err) => {

    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});
