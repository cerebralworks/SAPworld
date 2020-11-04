/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, SubscriptionPlans, validateModel, sails */

module.exports = async function update(request, response) {
    const post_request_data = request.body; 
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    var _response_object = {};
    pick_input = [
        'status', 'status_glossary'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [
        {name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes,['inactive', 'active'] )), required: true},
    ]; 
    if(filtered_post_keys.includes('status') && parseInt(filtered_post_data.status) === _.get(sails.config.custom.status_codes, 'inactive')){ 
        input_attributes.push({name: 'status_glossary', required: true});
    } 
    
    // Update a plan in stripe.
    function updateStripePlan(plan_id, successCallBack) {
        var create_stripe_plan_params = {active: !!_.get(filtered_post_data, 'status')}
        var stripe = require('stripe')(sails.config.conf.stripe.platform_secret_key); 
        stripe.plans.update(plan_id, create_stripe_plan_params, function(err, plan) {
            if(err){ 
                 _response_object = {};
                 _response_object.details = _.omit(_.get(err, 'raw'), ['headers', 'requestId', 'message']); 
                 _response_object.message = _.get(err, 'raw.message');
                 response.status(_.get(err, 'raw.statusCode')).json(_response_object);
            } else {
                 successCallBack(plan);
            }
        });
    }
 
    // Update the Subscription Plan record to db.
    function updateSubscriptionPlan(id, data, callback){ 
        SubscriptionPlans.update(id, data, async function(err, subscription_plan){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(subscription_plan[0]);
            }
        });
    };

    // Check whether the subscription plan id is exits in db.
    function isSubscriptionPlanExist(id, successCallBack){ 
        SubscriptionPlans.findOne({where:{
            id: id,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }}, 
            function(err, subscription_plan){
                if(!subscription_plan){
                    _response_object.message = 'No subscription plan found with the given id.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack(subscription_plan);
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        if(parseInt(details.status) === 1){
            _response_object.message = 'Subscription plan has been activated successfully.';
        }else{
            _response_object.message = 'Subscription plan has been deactivated successfully.';
        }
        _response_object['details'] = {id: details.id, status: details.status};
        return response.ok(_response_object);
    };

    validateModel.validate(SubscriptionPlans, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('status')){
                filtered_post_data.status = parseInt(filtered_post_data.status);
            }   

            isSubscriptionPlanExist(id, function(subscription_plan){
                updateStripePlan(subscription_plan.stripe_plan_id, function(plan){ 
                    updateSubscriptionPlan(id, filtered_post_data, function (subscription_plan) {
                        sendResponse(subscription_plan);
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
