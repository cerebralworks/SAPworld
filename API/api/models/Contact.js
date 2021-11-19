
/**
 * Contact.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

 module.exports = {
    tableName: 'contact',
    tableAlias: 'contacts',
    attributes: {
        name: { type: 'string'},
        email: { type: 'string'},
        subject: { type: 'string'},
        message: { type: 'string'}
    }
};