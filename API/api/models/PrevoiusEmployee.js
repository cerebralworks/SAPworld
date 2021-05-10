/**
 * PrevoiusEmployee.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'previous_employees',
    tableAlias: 'previous_employee',
    attributes: {
          company: {type:'string', required: true}
    }
};
