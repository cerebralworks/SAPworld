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
    tableName: 'she_company_profile',
    tableAlias: 'company_profile',
    attributes: {
        name: { type: 'string' },
        email_id: { type: 'string' },
        status: { type: 'number', defaultsTo: 1 },
        status_glossary: { type: 'string', allowNull: true },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        zipcode: { type: 'number' },
        latlng: { type: 'string' },
        latlng_text: { type: 'string' },
        description: { type: 'string' },
        website: { type: 'string' },
        social_media_link: { type: 'ref', columnType: 'json[]' },
        contact: { type: 'ref', columnType: 'varchar[]' },
        user_id: {
            model: 'users'
        }
    },

};