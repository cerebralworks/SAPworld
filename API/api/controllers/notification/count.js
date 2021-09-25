
/* global _, validateModel, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function Details(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, ['id', 'view' ]);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'id', number: true }
    ];

    //Find the Dashboard Details based on general criteria.
    const getNotificationCount = async( callback) => {
		Count_Users=``;
		if(filtered_query_data.view =='user'){
			//To get the job details Count
			Count_Users = `SELECT count(*) FROM notifications where account = ${logged_in_user.id} AND view = 0 `
		}
		if(filtered_query_data.view =='employee'){
			//To get the job details Count
			Count_Users = `SELECT count(*) FROM notifications where account = ${logged_in_user.id} AND view = 0 `
		}
		sails.sendNativeQuery(Count_Users, async function(err, Count_notification) {
			if (err) {
				var error = {
					'field': 'items',
					'rules': [{
						'rule': 'invalid',
						'message': err.message
					}]
				};
				_response_object.errors = [error];
				_response_object.count = _response_object.errors.count;
				return response.status(400).json(_response_object);
			} else {
				//console.log(group_query_Value);
				return callback(_.get(Count_notification, 'rows'));
			}
		});		
    };


    //Build and sending response
    const sendResponse = (notification) => {
        _response_object.data = notification;
        _response_object.count = notification['0'];
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getNotificationCount( function(notification_details) {
                sendResponse(notification_details);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
