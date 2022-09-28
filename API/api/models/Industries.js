

/**
 * Categories.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'industries',
    tableAlias: 'industry',
    attributes: {
        name: { type: 'string', required: true, unique: true },
        description: { type: 'string', allowNull: true },
        photo: { type: 'ref', defaultsTo: 'default.png' },
        status: { type: 'number', defaultsTo: 1 },
    }
};