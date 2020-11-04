/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * States.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'she_states',
    tableAlias: 'state',
    attributes: {
          name: {type: 'string', required: true},
          aliases: {type: 'string', allowNull: true},
          status: {type:'number', defaultsTo: 1},
          country: {type: 'string', required: true},
          cities: {
              collection: 'cities',
              via: 'state'
          }
    }
};
