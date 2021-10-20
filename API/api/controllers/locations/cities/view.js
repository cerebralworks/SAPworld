/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, Cities, validateModel, sails */

module.exports = async function view(request, response) { 
 
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['id' ,'expand']);
    var input_attributes = [
        {name: 'id', required:true, number: true, min:1}
    ];
    var _response_object = {};
    var expand = [];
    if(filtered_query_data.expand){
        expand = filtered_query_data.expand.split(',');
    }
    // Check whether the city id is exits in db.
    function isCityExist(id, successCallBack){ 
        const city_model = Cities.findOne({where:{
            id: id,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }});

            if(expand.includes('state')){
                city_model.populate('state');
            }

            city_model.exec(async function(err, city){
                if(!city){
                    _response_object.message = 'No city found with the given id.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack(city);
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        _response_object.message = 'City item retrieved successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };

    validateModel.validate(Cities, input_attributes, filtered_query_data, async function(valid, errors){
        if(valid){  
            isCityExist(parseInt(_.get(filtered_query_data, 'id')), function(city){
                sendResponse(city);
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
