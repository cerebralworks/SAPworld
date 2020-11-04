/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/**
 * SubscriptionPlans.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_subscription_plans',
    tableAlias: 'subscription_plan',
    attributes: { 
        amount: {type: 'number', defaultsTo: 0},
        currency: {type: 'string', required: true},
        interval: {type: 'string', required: true},
        interval_count: {type: 'number', required: true},
        interval_validity: {type: 'number', required: true},
        name: {type: 'string', required: true,  unique: true},
        stripe_plan_id: {type: 'string', required: true, unique: true},
        status: {type: 'number', defaultsTo: 1},
        status_glossary: {type: 'string'}, 
    }
};
