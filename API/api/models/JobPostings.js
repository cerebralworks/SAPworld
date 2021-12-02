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
    tableName: 'user_employments',
    tableAlias: 'job_posting',
    attributes: {
        title: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        salary_type: { type: 'number', defaultsTo: 0 },
        salary_currency: { type: 'string', allowNull: true },
        salary: { type: 'number' },
        city: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        zipcode: { type: 'number' },
        availability: { type: 'string', defaultsTo: 'no' },
        remote: { type: 'boolean', defaultsTo: false },
        experience: { type: 'number', defaultsTo: 1 },
        sap_experience: { type: 'number', defaultsTo: 1 },
        domain: { type: 'ref', columnType: 'bigint[]' },
        hands_on_experience: { type: 'ref', columnType: 'json[]' },
        skills: { type: 'ref', columnType: 'bigint[]' },
        programming_skills: { type: 'ref', columnType: 'text[]' },
        optinal_skills: { type: 'ref', columnType: 'text[]' },
        certification: { type: 'ref', columnType: 'text[]' },
        work_authorization: { type: 'number', allowNull: true},
        travel_opportunity: { type: 'number' },
        visa_sponsorship: { type: 'boolean', defaultsTo: false },
        willing_to_relocate: { type: 'boolean', defaultsTo: false },
        end_to_end_implementation: { type: 'number', defaultsTo: 0 },
        company: { model: 'employerprofiles' },
        status: { type: 'number', defaultsTo: 1 },
        //status_glossary: { type: 'string', allowNull: true },
        latlng: { type: 'string' },
        latlng_text: { type: 'string' },
        must_match: { type: 'ref', columnType: 'json' },
        match_select: { type: 'ref', columnType: 'json' },
        number_of_positions: { type: 'number', defaultsTo: 1 },
        extra_criteria: { type: 'ref', columnType: 'json[]' },
        screening_process: { type: 'ref', columnType: 'json[]' },
        photo: { type: 'string' },
        contract_duration: { type: 'number', defaultsTo: 0 },
		
		health_wellness: { type: 'ref', columnType: 'json' },
        paid_off: { type: 'ref', columnType: 'json' },
        financial_benefits: { type: 'ref', columnType: 'json' },
        office_perks: { type: 'ref', columnType: 'json' },
        language: { type: 'ref', columnType: 'json[]' },
        education: { type: 'string', allowNull: true },
        employer_role_type: { type: 'string', allowNull: true  },
        need_reference: { type: 'boolean', defaultsTo: false },
        //facing_role: { type: 'string', allowNull: true },
       // training_experience: { type: 'string', allowNull: true },
		authorized_to_work: { type: 'ref', columnType: 'bigint[]' },
        hands_on_skills: { type: 'ref', columnType: 'bigint[]' },
        others: { type: 'ref', columnType: 'json[]' },
        programming_id: { type: 'ref', columnType: 'bigint[]' },
        entry: { type: 'boolean', defaultsTo: false },
        negotiable: { type: 'boolean', defaultsTo: false , allowNull: true},
		account: { model: 'users' }
    }
};
