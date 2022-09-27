

/* global _, SubscriptionPlans, validateModel, sails */

module.exports = async function update(request, response) {
    const post_request_data = request.body; 
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    var _response_object = {};
    pick_input = [
        'name', 'interval_validity'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [
        {name: 'name', required: true},
        {name: 'id', number: true},
        {name: 'interval_validity', number: true}
    ]; 
 
    //Update the Subscription Plan record to db.
    function updateSubscriptionPlan(id, post_data, callback){
        SubscriptionPlans.update(id, post_data, async function(err, subscription_plan){
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
            'status': _.get(sails.config.custom.status_codes, 'active')
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
        _response_object.message = 'Subscription Plan details has been updated successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(SubscriptionPlans, input_attributes, _.merge(filtered_post_data, {id: id}), async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('name')){ 
                filtered_post_data.name = filtered_post_data.name.toLowerCase();
            }   
            if(filtered_post_keys.includes('interval_validity')){
                filtered_post_data.interval_validity = parseInt(filtered_post_data.interval_validity);
            }
            isSubscriptionPlanExist(id, function(subscription_plan){
                intervalValidityValidation(_.get(subscription_plan, 'interval_count'), _.get(filtered_post_data, 'interval_validity') || _.get(subscription_plan, 'interval_validity'),function(){
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
