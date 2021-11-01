/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * JobApplications.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'job_applications',
    tableAlias: 'job_application',
    attributes: {
        comments: { type: 'string', allowNull: true },
        status: { type: 'number', defaultsTo: 1 },
        short_listed: { type: 'boolean', allowNull: true },
        view: { type: 'boolean', defaultsTo: false },
        status_glossary: { type: 'string', allowNull: true },
        user: {
            model: 'userprofiles'
        },
        job_posting: {
            model: 'jobpostings'
        },
        employer: {
            model: 'employerprofiles'
        },
        user_approach_id: { type: 'string', allowNull: true },
        user_interest: { type: 'number', allowNull: true },
        user_resume: { type: 'string', allowNull: true },
        application_status: { type: 'ref', columnType: 'json[]' },
        others: { type: 'ref', columnType: 'json[]' },
        invite_url: { type: 'string', allowNull: true },
		invite_status: { type: 'boolean', defaultsTo: false },
        reschedule_url: { type: 'string', allowNull: true },
        cancel_url: { type: 'string', allowNull: true },
		canceled: { type: 'boolean', defaultsTo: false },
		rescheduled: { type: 'boolean', defaultsTo: false },
    }
};