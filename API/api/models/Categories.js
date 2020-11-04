/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/**
 * Categories.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_categories',
    tableAlias: 'category',
    attributes: {
      name: {type: 'string', required: true, unique: true},
      description: {type: 'string'},
      photo: {type: 'ref', defaultsTo: 'default.png'},
      type: {type: 'number', defaultsTo: 0},
      status: {type: 'number', defaultsTo: 1},
      status_glossary: {type: 'string', allowNull: true},
      parent: {
        type: 'number',
        allowNull: true
      }
    }
};
