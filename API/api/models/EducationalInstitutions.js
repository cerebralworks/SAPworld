/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * EducationalInstitutions.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_educational_institutions',
    tableAlias: 'educational_institution',
    attributes: {
        name: {type:'string', required: true, unique: true},
        description: {type: 'string', allowNull: true},
        address: {type: 'string', required: true},
        status: {type:'number', defaultsTo: 1},
        status_glossary: {type: 'string', allowNull: true}
    }
};
