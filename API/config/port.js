/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var env = require('node-env-file');
env(__dirname+'/../../.env');
const environment_variables=process.env;
module.exports.port = process.env.service_port;
