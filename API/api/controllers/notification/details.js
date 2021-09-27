
/* global _, validateModel, Notification, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function Details(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, ['page','limit','id', 'sort','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 0 },
        { name: 'limit', number: true, min: 1 }
       
    ];

    //Find the Notification based on general criteria.
    const getNotification = async( callback) => {
		Count_Users=``;
		Count_UsersTotal=``;
		if(filtered_query_data.view =='user'){
			//To get the job details Count
			Notification.update({account:logged_in_user.id}).set({status:0,view:1});
			Count_Users = `SELECT * FROM notifications where account = ${logged_in_user.id}  ORDER BY updated_at DESC LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`
			Count_UsersTotal = `SELECT count(*) FROM notifications where account = ${logged_in_user.id} `
		}
		if(filtered_query_data.view =='employee'){
			//To get the job details Count
			Count_Users = `SELECT * FROM notifications where account = ${logged_in_user.id}  ORDER BY updated_at DESC LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`
			Count_UsersTotal = `SELECT count(*) FROM notifications where account = ${logged_in_user.id}  `
		}
		sails.sendNativeQuery(Count_Users, async function(err, Count_Users_value) {
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
				//return callback(_.get(Count_Users_value, 'rows'));
				sails.sendNativeQuery(Count_UsersTotal, async function(err, Count_Users_deatails) {
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
						return callback(_.get(Count_Users_value, 'rows'),_.get(Count_Users_deatails, 'rows'));
					}
				});
			}
		});
		
    };


    //Build and sending response
    const sendResponse = (users,Count_Users_deatails) => {
		_response_object.details =users;
        var meta = {};
        meta['count'] = users['length'];
        meta['total'] = Count_Users_deatails[0]['count'];
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Companies',
            sizes: {
                small: 256,
                medium: 512
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/[filename].[filetype]';
        _response_object['meta'] = meta;
		if (filtered_query_keys.includes('company')) {
			_response_object['count'] = _.cloneDeep(users);
		}
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getNotification( function(job_postings,count) {
                sendResponse(job_postings,count);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
