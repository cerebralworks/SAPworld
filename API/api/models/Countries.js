/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Countries.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'she_countries',
    tableAlias: 'country',
    attributes: {
          id: {type: 'string', required: true},
          name: {type: 'string', required: true},
          aliases: {type: 'string', allowNull: true},
          cca2: {type: 'string'},
          ccn3: {type: 'string'},
          cca3: {type: 'string'},
          cioa: {type: 'string'},
          currency: {type: 'string'},
          calling_code: {type: 'string'},
          capital: {type: 'string'},
          alt_spellings: {type: 'string'},
          region: {type: 'string'},
          sub_region: {type: 'string'},
          languages: {type: 'string'},
          translations: {type: 'string'},
          lat_lng: {type: 'string'},
          demonym: {type: 'string'},
          landlocked: {type: 'string'},
          borders: {type: 'string'},
          area: {type: 'string'},
          status: {type:'number', defaultsTo: 1}
    }
};
