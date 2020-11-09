/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * JobPostings.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_user_employments',
    tableAlias: 'job_posting',
    attributes: {
        title: { type: 'string' },
        type: { type: 'number', defaultsTo: 0 },
        description: { type: 'string' },
        salary_type: { type: 'number', defaultsTo: 0 },
        salary_currency: { type: 'number', defaultsTo: 0 },
        salary: { type: 'number' },
        city: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        zipcode: { type: 'string' },
        availability: { type: 'string', defaultsTo: 'no' },
        remote: { type: 'boolean', defaultsTo: false },
        experience: { type: 'number', defaultsTo: 1 },
        sap_experience: { type: 'number', defaultsTo: 1 },
        domain: { type: 'ref' },
        hands_on_experience: { type: 'ref' },
        skills: { type: 'ref' },
        programming_skills: { type: 'ref' },
        optinal_skills: { type: 'ref' },
        certification: { type: 'ref' },
        work_authorization: { type: 'number', defaultsTo: 0 },
        travel_opportunity: { type: 'string' },
        visa_sponsorship: { type: 'boolean', defaultsTo: false },
        end_to_end_implementation: { type: 'number', defaultsTo: 0 },
        company: { model: 'employerprofiles' },
        status: { type: 'number', defaultsTo: 1 },
        status_glossary: { type: 'string', allowNull: true },
        latlng: { type: 'string' }
    }
};