

/* global _, SubscriptionPlans, validateModel, sails */

module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
        'amount', 'currency', 'interval', 'name', 'interval_count', 'interval_validity'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [
        {name: 'amount', number: true, required: true}, 
        {name: 'currency', required: true}, 
        {name: 'interval', required: true}, 
        {name: 'name', required: true},
        {name: 'interval_count', number: true, required: true},
        {name: 'interval_validity', number: true, required: true}
    ]; 

    // Create a plan in stripe.
    function createStripePlan(successCallBack) {
        var create_stripe_plan_params = _.omit(filtered_post_data, ['name', 'status', 'status_glossary', 'interval_validity']);
        create_stripe_plan_params = _.merge(create_stripe_plan_params, {product:{name: filtered_post_data.name}});
        var stripe = require('stripe')(sails.config.conf.stripe.platform_secret_key); 
        stripe.plans.create(create_stripe_plan_params, function(err, plan) {
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

    // Create a Subscription Plan in db.
    function createSubscriptionPlan(data, successCallBack){
        SubscriptionPlans.create(data, async function(err, subscription_plan){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object = {};
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                successCallBack(subscription_plan); 
            }
        });
   }

    // Check whether the name of subscription plan is unique in db.
    function isSubscriptionPlanNameIsUnique(name, successCallBack){
         SubscriptionPlans.find(name, async function(err, subscription_plan){ 
             if(_.isEmpty(subscription_plan)){
                 successCallBack();
             }else{
                 _response_object = {};
                 _response_object.details = {};
                 _response_object.details.field = 'name';
                 _response_object.details.rule = 'unique';
                 _response_object.message = 'The value that you given for the attribute name has already exist.';
                 return response.status(400).json(_response_object);
             }
         });
    }
 
    // Interval validity validation
    function intervalValidityValidation(interval_count, interval_validity, successCallBack){
        if(interval_count < interval_validity && Number.isInteger(interval_validity/interval_count)){
            successCallBack();
        }else{
            _response_object = {};
            _response_object.details = {};
            _response_object.details.field = 'interval_validity';
            _response_object.details.rule = 'valid';
            _response_object.details.interval_count = interval_count;
            _response_object.details.interval_validity = interval_validity;
            _response_object.message = `interval_validity should be greater than interval_count and interval_validity should be divisble by interval_count. For eg: if interval_count is 2. Then interval_validity can be 4,6 or any value that is divisible by 2.`;
            return response.status(400).json(_response_object); 
        }
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'Subscription plan has been created successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(SubscriptionPlans, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('amount')){
                filtered_post_data.amount = parseInt(filtered_post_data.amount);
            }  
            if(filtered_post_keys.includes('name')){ 
                filtered_post_data.name = filtered_post_data.name.toLowerCase();
            } 
            if(filtered_post_keys.includes('status')){
                filtered_post_data.status = parseInt(filtered_post_data.status);
            }
            if(filtered_post_keys.includes('interval_count')){
                filtered_post_data.interval_count = parseInt(filtered_post_data.interval_count);
            }  
            if(filtered_post_keys.includes('interval_validity')){
                filtered_post_data.interval_validity = parseInt(filtered_post_data.interval_validity);
            }  
            isSubscriptionPlanNameIsUnique(_.pick(filtered_post_data, ['name']), function(){
                intervalValidityValidation(_.get(filtered_post_data, 'interval_count'), _.get(filtered_post_data, 'interval_validity'),function(){
                    createStripePlan(function(plan){
                        createSubscriptionPlan(_.merge(filtered_post_data, {stripe_plan_id: _.get(plan, 'id')}), function(subscription_plan){
                            sendResponse(subscription_plan);
                        });
                    });
                }); 
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    }); 
};
