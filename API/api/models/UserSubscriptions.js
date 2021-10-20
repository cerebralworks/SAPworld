/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/**
 * UserSubscriptions.js
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'user_subscriptions',
    tableAlias: 'user_subscription',
    attributes: {
        user: {
            model: 'userprofiles', required: true
        },
        subscription_plan: {
            model: 'SubscriptionPlans', required: true
        },
        stripe_subscription_id: {
            type: 'string', required: true
        },
        expire_date: {
            type: 'ref', columnType: 'timestamp', required: true
        }
    }
};
