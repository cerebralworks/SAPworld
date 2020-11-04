/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Users.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = {
    tableName: 'she_users',
    tableAlias: 'user_account',
    attributes: {
        username: {type:'string'},
        password: {type:'string', minLength: 8},
        status: {type:'number', defaultsTo: 1},
        status_glossary: {type:'string', allowNull: true},
        verified: {type:'boolean', defaultsTo: false},
        types: {type:'ref'},
        tokens: {type:'ref'},
        last_active: {type:'ref', columnType: 'date', defaultsTo: new Date()},
        last_checkin_via: {type:'string', defaultsTo: 'web'},
        user_profile: {
            model: 'userprofiles'
        },
        admin_profile: {
            model: 'adminprofiles'
        },
        employer_profile: {
            model: 'employerprofiles'
        }
    },
    customToJSON: function() {
        // Return a shallow copy of this record with the password and ssn removed.
        return _.omit(this, ['tokens']);
    },
    beforeCreate: function(user, callback) {
        user.tokens = {reset: UtilsService.uid(20), verification: UtilsService.uid(20)};
        if(user.password){
            bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
              user.password = hash;
              return callback();
            });
        }else{
            return callback();
        }
    }
};
