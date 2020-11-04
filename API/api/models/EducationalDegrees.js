/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * EducationalDegrees.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_educational_degrees',
    tableAlias: 'educational_degree',
    attributes: {
        name: {type:'string', required: true, unique: true},
        description: {type: 'string', allowNull: true},
        status: {type:'number', defaultsTo: 1},
        status_glossary: {type: 'string', allowNull: true}
    }
};
