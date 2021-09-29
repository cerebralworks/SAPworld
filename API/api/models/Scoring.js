
/**
 * Scoring.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'scorings',
    tableAlias: 'scoring',
    attributes: {
		
        job_id: { model: 'useremployments' },
        user_id: { model: 'userprofiles' },
        total_experience: { type: 'number' },
        sap_experience: { type: 'number' },
        hands_on_experience: { type: 'number' },
        job_types: { type: 'number' },
        work_auth: { type: 'number' },
        job_location: { type: 'number' },
        knowledge: { type: 'number'},
        end_to_end_implemention: { type: 'number' },
        education: { type: 'number'},
        job_role: { type: 'number' },
        availability: { type: 'number' },
        programming: { type: 'number'},
        other_skills: { type: 'number' },
        certification: { type: 'number' },
        domain: { type: 'number' },
        remote: { type: 'number' },
        travel: { type: 'number' },
        language: { type: 'number' },
        score: { type: 'number' },
        mail: { type: 'boolean', defaultsTo: false , allowNull: true }
		
    }
};