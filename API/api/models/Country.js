
/**
 * Country.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'country',
    tableAlias: 'countrys',
    attributes: {
          iso: {type: 'string', required: true},
          name: {type: 'string'},
          nicename: {type: 'string'},
          iso3: {type: 'string', allowNull: true},
          numcode: {type: 'number', allowNull: true},
          phonecode: {type: 'number', allowNull: true}
    }
};
