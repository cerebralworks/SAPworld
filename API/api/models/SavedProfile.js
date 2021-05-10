/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Users.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */



module.exports = {
    tableName: 'saved_profiles',
    tableAlias: 'saved_profile',
    attributes: {
        user_id: { type: 'number' },
        employee_id: { type: 'number' },
    },

};