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
    tableName: 'she_user_profiles',
    tableAlias: 'user_profile',
    attributes: {
        first_name: { type: 'string' },
        last_name: { type: 'string', allowNull: true },
        email: { type: 'string' },
        phone: { type: 'string', allowNull: true },
        bio: { type: 'string', allowNull: true },
        photo: { type: 'string', allowNull: true },
        country: { type: 'string', allowNull: true },
        state: { type: 'string', allowNull: true },
        city: { type: 'string', allowNull: true },
        address_line: { type: 'string', allowNull: true },
        zipcode: { type: 'number', allowNull: true },
        social_media_link: { type: 'json' },
        education_qualification: { type: 'json' },
        experience: { type: 'number' },
        sap_experience: { type: 'number' },
        current_employer: { type: 'string', allowNull: true },
        current_employer_role: { type: 'string', allowNull: true },
        domains_worked: { type: 'json' },
        clients_worked: { type: 'json' },
        hands_on_experience: { type: 'json' },
        skills: { type: 'json' },
        programming_skills: { type: 'json' },
        other_skills: { type: 'json' },
        certification: { type: 'json' },
        job_type: { type: 'number', allowNull: true },
        job_role: { type: 'string', allowNull: true },
        preferred_location: { type: 'number', allowNull: true },
        availability: { type: 'number', allowNull: true },
        travel: { type: 'number', allowNull: true },
        work_authorization: { type: 'number', allowNull: true },
        willing_to_relocate: { type: 'boolean', allowNull: true },
        remote_only: { type: 'boolean', allowNull: true },
        end_to_end_implementation: { type: 'number', allowNull: true },
        latlng: { type: 'string' },
        latlng_text: { type: 'string' },
        doc_resume: { type: 'json' },
        status: { type: 'number', allowNull: true },
        status_glossary: { type: 'string' },
        account: {
            model: 'users'
        }
    },
    afterCreate: async function(profile, callback) {
        if (profile.id) {
            await Users.update({ id: profile.account }, { user_profile: profile.id }, async function(err, user) {
                return callback();
            });
        } else {
            return callback();
        }
    }
};