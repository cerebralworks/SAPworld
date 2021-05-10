/**
 * Language.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'languages',
    tableAlias: 'language',
    attributes: {
          language: {type:'string', required: true},
          read: { type: 'boolean', allowNull: true , defaultsTo: false },
          write: { type: 'boolean', allowNull: true , defaultsTo: false },
          speak: { type: 'boolean', allowNull: true , defaultsTo: false }
    }
};
