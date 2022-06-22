/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */
var express = require('express');

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/
//    port: 443,
//    ssl:{
//        ca: require('fs').readFileSync(require('path').resolve(__dirname,'/etc/letsencrypt/live/api.studioq.co.in/chain.pem')),
//        key: require('fs').readFileSync(require('path').resolve(__dirname,'/etc/letsencrypt/live/api.studioq.co.in/privkey.pem')),
//        cert: require('fs').readFileSync(require('path').resolve(__dirname,'/etc/letsencrypt/live/api.studioq.co.in/cert.pem'))
//    },
  middleware: {
      flash    : require('connect-flash')(),
	 
    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/
    bodyParser: (function _configureBodyParser(){
        var skipper = require('skipper');
        var middlewareFn = skipper({
          strict: true,
          maxTimeToBuffer: 100000,
        });
        return middlewareFn;
    })(),

    preRequestHandler: (function (){
        return function (request,response,next){
          if(request.method === 'POST'){
              var async = require("async");
              async.forEachOf(request.body, function (value, key, callback){
                  if(value === '' || _.isNull(value)){
                      delete request.body[key];
                  }
                  callback();
              });
              next();
          }else{
              return next();
          }
        };
    })(),

    order: [
        'cookieParser',
        'session',
        'flash',
        'initializePassport',
        'passportSession',
        //'oauthEndPoints',
        'bodyParser',
        'compress',
        'poweredBy',
        'preRequestHandler',
        'router',
        'www',
        'favicon',
		
    ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

  },
  

  setTimeZone: function (app) {
      app.set('tz', 'GMT+0530');
  },

  trustProxy: true

};
