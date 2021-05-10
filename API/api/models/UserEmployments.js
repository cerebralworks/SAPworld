/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * UserProfiles.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'user_employments',
    tableAlias: 'user_employment',
    attributes: {
        title: {type: 'string'},
        company: {type: 'string'},
        description: {type: 'string', allowNull: true},
        roles: {type: 'string', allowNull: true},
        location: {type: 'string', allowNull: true},
        start_month: {type: 'number'},
        start_year: {type: 'number'},
        end_month: {type: 'number', allowNull: true},
        end_year: {type: 'number', allowNull: true},
        currently_working: {type: 'boolean', defaultsTo: false},
        type: {type: 'number'},
        user: {
            model: 'userprofiles'
        },
        industry: {
            model: 'industries',
            required: true
        }
    }
};
