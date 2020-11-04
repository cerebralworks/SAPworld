/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Cities.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'she_cities',
    tableAlias: 'city',
    attributes: {
          name: {type:'string', required: true},
          aliases: {type: 'string', allowNull: true},
          status: {type:'number', defaultsTo: 1},
          state: {
              model:'states'
          },
          country: {type: 'string', required: true},
          areas: {
              collection: 'areas',
              via:'city'
          }
    }
};
