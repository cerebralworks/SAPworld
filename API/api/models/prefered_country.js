/**
 * PreferedCountry.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'prefered_country',
    tableAlias: 'prefered_country',
    attributes: {
          country: {type:'string', required: true}
    }
};