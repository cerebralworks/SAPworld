
/* global _, SubscriptionPlans, validateModel, sails */

module.exports = async function deleteRecords(request, response) { 
    const request_query = request.allParams();
    let id;
    var _response_object = {};
    pick_input = [
        'id'
    ];
    var filtered_post_data = _.pick(request_query, pick_input); 
    var input_attributes = [
        {name: 'id', number: true, required: true},
    ];  
    
    // Delete a plan in stripe.
    function deleteStripePlan(plan_id, successCallBack) {
        var stripe = require('stripe')(sails.config.conf.stripe.platform_secret_key); 
        stripe.plans.del(plan_id, function(err, plan) {
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
 
    // Delete the Subscription Plan record from db.
    function deleteSubscriptionPlan(id, data, callback){ 
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
        _response_object.message = 'Subscription plan has been deleted successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(SubscriptionPlans, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            id = parseInt(_.get(filtered_post_data, 'id'));
            filtered_post_data = {status: _.get(sails.config.custom.status_codes, 'deleted')}; 

            isSubscriptionPlanExist(id, function(subscription_plan){
                deleteStripePlan(subscription_plan.stripe_plan_id, function(plan){ 
                    deleteSubscriptionPlan(id, filtered_post_data, function (subscription_plan) {
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
