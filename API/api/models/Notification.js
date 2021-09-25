/**
 * Notification.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'notifications',
    tableAlias: 'notification',
    attributes: {
        message: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'number', defaultsTo: 1 },
        view: { type: 'number', defaultsTo: 1 },
        account: {
            model: 'users'
        },
        user_id: {
            model: 'userprofiles'
        },
        job_id: {
            model: 'jobpostings'
        },
        employer: {
            model: 'employerprofiles'
        },
    }
};
