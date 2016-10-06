'use strict';

var Bluebird = require('bluebird');
var mailer = require('nodemailer');
var logger = require('../utils/logger');

var gAttachmentContentType = 'application/octet-stream';
var gAttachmentFileName = 'attachment';
var gTls = {
  rejectUnauthorized: false
};

module.exports = function (options) {

  var transporter = mailer.createTransport(
    {
      host: options.host,
      // port ??
      secure: options.secure,
      auth: {
        user: options.user,
        pass: options.password
      },
      tls: gTls
    }
  );

  var mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  } else if (options.attachment) {
    mailOptions.attachments = [{
      filename: gAttachmentFileName,
      contentType: gAttachmentContentType,
      content: options.attachment
    }];
  }

  return new Bluebird(function (resolve, reject) {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.error(error);
        reject(error);
      }
      logger.info(info);
      resolve(true);
    })
  });
};
