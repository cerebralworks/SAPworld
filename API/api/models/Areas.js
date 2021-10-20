/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Areas.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'areas',
    tableAlias: 'area',
    attributes: {
          name: {type: 'string', required: true},
          zip_code: {type:'number', allowNull: true},
          aliases: {type: 'string', allowNull:true},
          status: {type:'number', defaultsTo: 1},
          city: {
              model: 'cities'
          },
          state: {
              model: 'states'
          },
          country: {type: 'string', required: true}
    }
};
