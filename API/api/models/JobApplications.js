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
    tableName: 'she_job_applications',
    tableAlias: 'job_application',
    attributes: {
        comments: { type: 'string', allowNull: true },
        status: { type: 'number', defaultsTo: 1 },
        short_listed: { type: 'boolean', defaultsTo: false },
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
    }
};