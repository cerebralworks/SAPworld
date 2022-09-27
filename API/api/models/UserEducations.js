

/**
 * UserProfiles.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'user_educations',
    tableAlias: 'user_education',
    attributes: {
        start_year: {type: 'number'},
        end_year: {type: 'number'},
        grade: {type: 'string', allowNull: true},
        max_grade: {type: 'string', allowNull: true},
        comments: {type: 'string', allowNull: true},
        user: {
            model: 'userprofiles'
        },
        institution: {
            model: 'educationalinstitutions'
        },
        degree: {
            model: 'educationaldegrees'
        },
        field: {
            model: 'educationalfields'
        }
    }
};
