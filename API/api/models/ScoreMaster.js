
/**
 * ScoreMaster.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'score_master',
    tableAlias: 'score_masters',
    attributes: {
        total_experience: { type: 'number' , defaultsTo: 1},
        sap_experience: { type: 'number' , defaultsTo: 1},
        hands_on_experience: { type: 'number', defaultsTo: 1 },
        job_types: { type: 'number', defaultsTo: 1 },
        work_auth: { type: 'number' , defaultsTo: 1},
        job_location: { type: 'number', defaultsTo: 1 },
        knowledge: { type: 'number', defaultsTo: 1 },
        end_to_end_implemention: { type: 'number' , defaultsTo: 0.5},
        education: { type: 'number' , defaultsTo: 0.25},
        job_role: { type: 'number' , defaultsTo: 1},
        availability: { type: 'number' , defaultsTo: 1},
        programming: { type: 'number' , defaultsTo: 1},
        other_skills: { type: 'number', defaultsTo: 1 },
        certification: { type: 'number' , defaultsTo: 1},
        domain: { type: 'number' , defaultsTo: 1},
        remote: { type: 'number' , defaultsTo: 0.5},
        travel: { type: 'number' , defaultsTo: 0.5},
        language: { type: 'number' , defaultsTo: 0.25},
        total: { type: 'number' , defaultsTo: 150}
		
    }
};