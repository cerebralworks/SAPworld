

/**
 * AdminProfiles.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'employer_profiles',
    tableAlias: 'employer',
    attributes: {
        email: { type: 'string', required: true, isEmail: true },
        first_name: { type: 'string', required: true },
        last_name: { type: 'string', allowNull: true },
        phone: { type: 'ref' },
        photo: { type: 'ref', defaultsTo: 'default.png' },
        account: {
            columnName: 'user',
            model: 'users'
        },
        company: { type: 'string', allowNull: true },
        department: { type: 'string', allowNull: true },
        address_line_1: { type: 'number', allowNull: true },
        address_line_2: { type: 'number', allowNull: true },
        city: { type: 'number', allowNull: true },
        state: { type: 'string', allowNull: true },
        country_code: { type: 'ref' },
        zipcode: { type: 'number', allowNull: true },
        description: { type: 'string', allowNull: true },
        privacy_protection: { type: 'ref', columnType: 'json' },
    },
    afterCreate: async function(profile, callback) {
        if (profile.id) {
            await Users.update({ id: profile.account }, { employer_profile: profile.id }, async function(err, user) {
                return callback();
            });
        } else {
            return callback();
        }
    }
};