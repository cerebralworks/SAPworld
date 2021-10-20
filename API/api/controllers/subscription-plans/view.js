/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, SubscriptionPlans, validateModel, sails */

module.exports = async function view(request, response) { 
 
    const request_query = request.allParams();
    const id = parseInt(request_query.id); 
    var _response_object = {};
    var input_attributes = [
        {name: 'id', number: true},
    ];

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
        _response_object.message = 'Subscription plan item retrieved successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(SubscriptionPlans, input_attributes, {id}, async function(valid, errors){
        if(valid){  
            isSubscriptionPlanExist(id, function(subscription_plan){
                sendResponse(subscription_plan);
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
