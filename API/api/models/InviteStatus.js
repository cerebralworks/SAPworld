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
        event: { type: 'ref', columnType: 'text[]' },
        status: { type: 'string', allowNull: true },
        canceled: { type: 'boolean', defaultsTo: false },
        canceled_by: { type: 'string', allowNull: true },
        reason: { type: 'string', allowNull: true },
        job_applications: {
            model: 'jobapplications'
        },
    }
};

