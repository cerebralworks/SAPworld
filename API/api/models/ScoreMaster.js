
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
        required: { type: 'number' , defaultsTo: 1},
        desired: { type: 'number' , defaultsTo: 0.5},
        optional: { type: 'number', defaultsTo: 0.25 },		
    }
};