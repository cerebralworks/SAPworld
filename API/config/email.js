/**
 * Email configuration
 * (sails.config.email)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/email
 */

 var env = require('node-env-file');
 env(__dirname+'/../../.env');

 module.exports.email = {
    service: 'Mailgun',
    auth: {
        user: process.env.mailgun_username,
        pass: process.env.mailgun_password
    },
    templateDir: 'emails',
    from: process.env.mailgun_sender,
    testMode: false,
    ssl: true
};
