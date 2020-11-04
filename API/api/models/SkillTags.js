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
    tableName: 'she_skill_tags',
    tableAlias: 'skill_tag',
    attributes: {
          tag: {type:'string', required: true},
          status: {type:'number', defaultsTo: 1},
          status_glossary: {type: 'string', allowNull: true}
    }
};
