'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000
});

// Add the route
server.route({
  method: 'GET',
  path:'/fetch',
  handler: function (req, rep) {

    // TODO: Hapi query validators ??

    var msgsPromise = getMessages(cfg, [['SINCE', 'September 19, 2016']], {logger: 'console'});



    console.dir(req.query);

    return rep('hello world');
  }
});

// Start the server
server.start((err) => {

  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
