/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * AuthCode.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'she_auth_codes',
    tableAlias: 'auth_code',
    attributes: {
          code: {
              type: 'string'
          },
          user_id: {
              type: 'ref',
              required: true
          },
          client_id: {
              type: 'string',
              required: true
          },
          redirect_uri: {
              type: 'string',
              required: true
          }
    },
    beforeCreate: function(values, next){
      values.code = UtilsService.uid(16);
      next();
    }
};
