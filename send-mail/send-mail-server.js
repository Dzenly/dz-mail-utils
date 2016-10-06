'use strict';

var Hapi = require('hapi');
var Boom = require('boom');
var Blipp = require('blipp');
var Joi = require('joi');
var logger = require('../utils/logger');

var send = require('./send-mail-utility.js');

var sendValidationSchema = Joi.object().keys({
  attachment: Joi.string().required(),
  from: Joi.string(),
  host: Joi.string().hostname().required(), // string.uri ?
  html: Joi.string(),
  password: Joi.string().required(),
  subject: Joi.string(),
  text: Joi.string(),
  to: Joi.string().required(),
  user: Joi.string().email().required(),
  waitResponse: Joi.boolean(),
});

var server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8001
});

server.route({
  method: 'POST',
  path: '/send',
  handler: function (req, rep) {
    var sendPromise = send(req.payload);
    if (req.payload.waitResponse) {
      sendPromise.then(function (result) {
        rep('OK');
      }, function (err) {
        rep(Boom.badRequest(err));
      })
    } else {
      rep('OK');
    }
  },
  config: {
    validate: {
      payload: sendValidationSchema
    },
    payload: {
      maxBytes: 2e8 // TODO: put in some config.
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
