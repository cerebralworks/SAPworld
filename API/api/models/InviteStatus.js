/**
 * Program.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'invite_status',
    tableAlias: 'invite_statuses',
    attributes: {
        name: { type: 'string', allowNull: true },
        cancel_url: { type: 'string', allowNull: true },
        email: { type: 'string', allowNull: true },
        event: { type: 'string', allowNull: true },
        reschedule_url: { type: 'string', allowNull: true },
        rescheduled: { type: 'string', allowNull: true },
        status: { type: 'string', allowNull: true },
        questions_and_answers: { type: 'ref', columnType: 'text[]' },
        uri: { type: 'string', allowNull: true },
        canceled: { type: 'boolean', defaultsTo: false },
        canceled_by: { type: 'string', allowNull: true },
        reason: { type: 'string', allowNull: true },
        job_applications: {
            model: 'jobapplications'
        },
        events: { type: 'ref', columnType: 'json' },
    }
};

