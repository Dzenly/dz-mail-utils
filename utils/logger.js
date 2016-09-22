'use strict';

var winston = require('winston');

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
      colorize: true,
      prettyPrint: true
    })
  ]
});
