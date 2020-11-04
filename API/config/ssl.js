/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global __dirname, process */

var env = require('node-env-file');
env(__dirname+'/../../.env');
const environment_variables=process.env;

// module.exports.ssl = {
// //  ca: require('fs').readFileSync(process.env.ca),
//   key: require('fs').readFileSync(process.env.ssl_key),
//   cert: require('fs').readFileSync(process.env.ssl_cert)
// };
