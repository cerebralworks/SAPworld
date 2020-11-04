var env = require('node-env-file');
module.exports = {
  appName: 'Hopsticks API',
  port: process.env.service_port,
  oauth: {
    tokenLife: 3600
  }
};
