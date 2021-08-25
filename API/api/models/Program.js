/**
 * Program.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'program',
    tableAlias: 'programs',
    attributes: {
          name: {type:'string', required: true,unique: true },
          status: {type:'number', defaultsTo: 1},
          status_glossary: {type: 'string', allowNull: true}
    }
};
