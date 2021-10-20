/**
 * WorkAuthorization.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'workauthorization',
    tableAlias: 'workauthorizations',
    attributes: {
          visa: {type:'string', required: true },
          name: {type:'string', required: true },
          country: {type:'number', required: true },
          status: {type:'number', defaultsTo: 1},
          status_glossary: {type: 'string', allowNull: true}
    }
};
