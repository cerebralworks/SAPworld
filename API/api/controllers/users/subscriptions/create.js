/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, UserSubscriptions, validateModel, sails */

var moment = require('moment');

module.exports = async function update(request, response) {
    const post_request_data = request.body; 
    const logged_in_user = request.user;
    var _response_object = {};
    pick_input = [
        'stripe_subscription_id',
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    var input_attributes = [
        {name: 'stripe_subscription_id', required: true},
    ];

    //create the User Subscription record to db.
    function createUserSubscription(data, callback){
        UserSubscriptions.create(data, async function(err, user_subscription){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(user_subscription);
            }
        });
    };

    // Retrieve a subscription from stripe.
    function retrieveStripeSubscription(id, successCallBack) {
        var stripe = require('stripe')(sails.config.conf.stripe.platform_secret_key); 
        stripe.subscriptions.retrieve(id, function(err, stripe_subscription) {
            if(err){ 
                _response_object = {};
                _response_object.details = _.omit(_.get(err, 'raw'), ['headers', 'requestId', 'message']); 
                _response_object.message = _.get(err, 'raw.message');
                response.status(_.get(err, 'raw.statusCode')).json(_response_object);
            } else {
                successCallBack(stripe_subscription);
            }
        });
    }

    // update a subscription in stripe.
    function updateStripeSubscription(id, parameters, successCallBack) {
        var stripe = require('stripe')(sails.config.conf.stripe.platform_secret_key); 
        stripe.subscriptions.update(id, parameters, function(err, stripe_subscription) {
            if(err){ 
                _response_object = {};
                _response_object.details = _.omit(_.get(err, 'raw'), ['headers', 'requestId', 'message']); 
                _response_object.message = _.get(err, 'raw.message');
                response.status(_.get(err, 'raw.statusCode')).json(_response_object);
            } else {
                successCallBack(stripe_subscription);
            }
        });
    }
    
    // Check whether the subscription plan is exits in db.
    function isSubscriptionPlanExist(stripe_plan_id, successCallBack){ 
        SubscriptionPlans.findOne({
            stripe_plan_id,
            'status': _.get(sails.config.custom.status_codes, 'active')
            }, 
            async function(err, subscription_plan){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else {
                    if(!subscription_plan){
                        _response_object.message = 'No subscription_plan found with the given id.';
                        _response_object.details = {
                            field: 'subscription_plan',
                            rule: 'valid'
                        };
                        return response.status(404).json(_response_object);
                    }else{
                        successCallBack(subscription_plan);
                    }
                }
            }); 
    }

    // Check whether the stripe subscription id is exits in db.
    function validateStripeSubscriptionId(stripe_subscription_id, successCallBack){ 
        SubscriptionPlans.findOne({
            stripe_subscription_id,
            'status': _.get(sails.config.custom.status_codes, 'active')
            }, 
            async function(err, subscription_plan){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    if(!subscription_plan){
                        successCallBack();
                    }else{
                        _response_object.message = 'Given stripe subscription id has already exists.';
                        _response_object.details = {
                            field: 'stripe_subscription_id',
                            rule: 'unique'
                        };
                        return response.status(400).json(_response_object);
                    }
                }
            }); 
    }

    function buildStripeSubscriptionParameters(stripe_subscription, subscription_plan, callback){
        const created_at = _.get(stripe_subscription, 'created');
        const interval_validity = _.get(subscription_plan, 'interval_validity');
        let cancel_at;
        switch(_.get(subscription_plan, 'interval')) {
            case 'day':
              cancel_at = moment(created_at).add(interval_validity, 'd');
              break;
            case 'week':
              cancel_at = moment(created_at).add(interval_validity, 'w');
              break;
            case 'month':
              cancel_at = moment(created_at).add(interval_validity, 'M');
              break;
            case 'year':
              cancel_at = moment(created_at).add(interval_validity, 'y');
              break;
            default:
              _response_object.message = 'The subscription plan should contain a valid interval like (day, week, month or year).';
              return response.status(400).json(_response_object);
        }
        cancel_at =  moment(cancel_at).add(1, 'h');
        callback(_.get(stripe_subscription, 'id'), {cancel_at})
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'User Subscription details has been added successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(null, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            retrieveStripeSubscription(_.get(filtered_post_data, 'stripe_subscription_id'), function(stripe_subscription){
                isSubscriptionPlanExist(_.get(stripe_subscription, 'plan.id'), function(subscription_plan){
                    validateStripeSubscriptionId(_.get(filtered_post_data, 'stripe_subscription_id'), function(){
                        buildStripeSubscriptionParameters(stripe_subscription, subscription_plan, function(stripe_subscription_id, parameters){
                            updateStripeSubscription(stripe_subscription_id, parameters, function(updated_stripe_subscription){
                                console.log('updated_stripe_subscription: ', updated_stripe_subscription);
                                createUserSubscription({
                                    user: _.get(logged_in_user, 'user_profile.id'),
                                    subscription_plan: _.get(subscription_plan, 'id'),
                                    stripe_subscription_id: stripe_subscription_id,
                                    expire_date: _.get(parameters, 'cancel_at')}, function(user_subscription){
                                    sendResponse(user_subscription);
                                });
                            });
                        });
                    });
                });
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
