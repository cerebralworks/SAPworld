/**
 * JobLocation.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

 module.exports = {
    tableName: 'job_location',
    tableAlias: 'job_locations',
    attributes: {
        city: { type: 'string'},
        state: { type: 'string'},
        country: { type: 'string'},
        zipcode: { type: 'string'},
        status: { type: 'number', defaultsTo: 1 },
        jobid :{
            model: 'jobpostings'
        },
        stateshort: { type: 'string'},
        countryshort: { type: 'string'}
    }
};

