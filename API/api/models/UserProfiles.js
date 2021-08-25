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
    tableName: 'user_profiles',
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
        social_media_link: { type: 'ref', columnType: 'json[]' },
        education_qualification: { type: 'ref', columnType: 'json[]' },
        experience: { type: 'number' },
        sap_experience: { type: 'number' },
        current_employer: { type: 'string', allowNull: true },
        current_employer_role: { type: 'string', allowNull: true },
        domains_worked: { type: 'ref', columnType: 'bigint[]' },
        clients_worked: { type: 'ref', columnType: 'text[]' },
        hands_on_experience: { type: 'ref', columnType: 'json[]' },
        skills: { type: 'ref', columnType: 'bigint[]' },
        programming_skills: { type: 'ref', columnType: 'text[]' },
        other_skills: { type: 'ref', columnType: 'text[]' },
        certification: {
            type: 'ref',
            columnType: 'text[]'
        },
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
        doc_resume: { type: 'ref', columnType: 'json[]' },
        status: { type: 'number', allowNull: true },
        status_glossary: { type: 'string' },
        privacy_protection: { type: 'ref', columnType: 'json' },
		
		nationality: { type: 'string', allowNull: true },
		previous_employee: { type: 'ref', columnType: 'bigint[]' },
		authorized_country: { type: 'ref', columnType: 'bigint[]' },
		
		
		reference: { type: 'ref', columnType: 'json[]' },
		employer_role_type: { type: 'string', allowNull: true },
		knowledge_on: { type: 'ref', columnType: 'bigint[]' },
		other_countries: { type: 'ref', columnType: 'text[]' },
		account: {
            model: 'users'
        },
		language_known: { type: 'ref', columnType: 'json[]' },
		visa_type: { type: 'ref', columnType: 'text[]' },
		doc_cover: { type: 'ref', columnType: 'json[]' },
       
		
        visa_sponsered: { type: 'boolean', allowNull: true },
        job_type: { type: 'ref', columnType: 'text[]' },
        preferred_locations: { type: 'ref', columnType: 'json[]' },
		 hands_on_skills: { type: 'ref', columnType: 'bigint[]' },
        education_degree: { type: 'ref', columnType: 'text[]' },
        language_id: { type: 'ref', columnType: 'bigint[]' },
		other_cities: { type: 'ref', columnType: 'text[]' },
        programming_id: { type: 'ref', columnType: 'bigint[]' }
		
		
		
        
		
		
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