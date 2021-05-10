/**
 * Language.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'language',
    tableAlias: 'languages',
    attributes: {
          name: {type:'string', required: true},
          iso: { type: 'string', allowNull: true  }
    }
};
