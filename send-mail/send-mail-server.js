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

// var sendValidationSchema = Joi.object().keys({
//   address: Joi.string().email().required(),
//   password: Joi.string().required(),
//   host: Joi.string().hostname().required(), // string.uri ?
//   tls: Joi.boolean(),
//   port: Joi.number().integer(),
//   remove: Joi.boolean()
// });

var server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8001
});

server.route({
  method: 'POST',
  path: '/send',
  handler: function (req, rep) {
    rep('OK');
  },
  // config: {
  //   validate: {
  //     payload: sendValidationSchema
  //   }
  // }
});

server.register({register: Blipp, options: {}}, function (err) {
  server.start((err) => {

    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});
