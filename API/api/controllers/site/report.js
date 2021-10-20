/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, RestaurantUserRatings, MenuUserRatings, Photos, ReportedContents, sails */

var squel = require("squel");

module.exports = function reportPhoto(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['content_id', 'content_type', 'parent_id', 'parent_type', 'comment']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'content_id', required: true, number: true, min: 0},
        {name: 'content_type', required: true, enum: true, values: [0,1,2,3]},
        {name: 'parent_id', number: true, min: 0},
        {name: 'parent_type', enum: true, values: [0,1]}
    ];
    if(filtered_post_keys.includes('content_type')){
        filtered_post_data.content_type = parseInt(filtered_post_data.content_type);
        if(filtered_post_data.type === 2){
            input_attributes.push({name: 'parent_id', required: true, number:true, min:1});
            input_attributes.push({name: 'parent_type', required: true, number:true, min:1});
        }
    }
    if(filtered_post_keys.includes('content_id')){
        filtered_post_data.content_id = parseInt(filtered_post_data.content_id);
    }
    //Send mail notification
    const emailReport = (params) => {
        content_label = ['Restaurant Rating', 'Menu Rating', 'Replies', 'Photos'];
        params.content_label = content_label[params.content_type];
        if(params.content_type === 2 && params.parent_type){
            params.parent_label = content_label[params.parent_type];
        }
        const mail_data = {
            template: 'content-report',
            data: params,
            to: sails.config.custom.site.report.mail,
            subject: 'Content reported by a user.'
        };
        mailService.sendMail(mail_data);
    };
    //Find content.
    const findReportCount = async (params, callback) => {
        criteria = _.pick(params,['content_id', 'content_type']);
        if(criteria.content_type === 2){
            if(params.parent_id){
                criteria.parent_id = params.parent_id;
            }
            if(params.parent_type){
                criteria.parent_type = params.parent_type;
            }
        }
        ReportedContents.count({where:criteria}, async function(err, count){
            if(err){
                var error = {
                    'field': 'count',
                    'rules': [
                        {
                            'rule': 'invalid',
                            'message': err.message
                        }
                    ]
                };
                _response_object.errors = [error];
                _response_object.count = _response_object.errors.count;
                return response.status(500).json(_response_object);
            }else{
                return callback(count);
            }
        });
    };
    //Update the content status.
    const updateContent = (criteria, count, callback) => {
        var models = [
            RestaurantUserRatings, MenuUserRatings, null, Photos
        ]
        var model = models[criteria.content_type];
        var id = criteria.content_id;
        if(criteria.content_type === 2){
            id = criteria.parent_id;
        }
        var query = squel.update().table(model.tableName);
        update_fields = {};
        update_fields[model.schema.reported.columnName + '=' + model.schema.reported.columnName + '+1'] = undefined;
        if(count >= sails.config.custom.site.report.threshold){
            update_fields[model.schema.status.columnName] = 4;
            update_fields[model.schema.status_glossary.columnName] = 'Status updated due to multiple reports.';
        }
        query.setFields(update_fields);
        query.where(model.schema.id.columnName + '=' + id);
        var content_model = sails.sendNativeQuery(query.toString());
        content_model.exec(async function(err, content_details){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(content_details);
            }
        });
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(ReportedContents, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
              filtered_post_data.user = logged_in_user.user_profile.id;
              if(filtered_post_keys.includes('content_type')){
                  if(filtered_post_data.content_type === 2){
                      if(filtered_post_keys.includes('parent_id')){
                          filtered_post_data.parent_id = parseInt(filtered_post_data.parent_id);
                      }
                      if(filtered_post_keys.includes('parent_type')){
                          filtered_post_data.parent_type = parseInt(filtered_post_data.parent_type);
                      }
                  }
              }
              //Finding photo
              ReportedContents.findOrCreate(filtered_post_data, filtered_post_data, async function(err, content, was_created){
                  if(err){
                      var error = {
                          'field': 'content_id',
                          'rules': [
                              {
                                  'rule': 'invalid',
                                  'message': err.message
                              }
                          ]
                      };
                      _response_object.errors = [error];
                      _response_object.count = _response_object.errors.count;
                      return response.status(500).json(_response_object);
                  }else if(!was_created){
                      var error = {
                          'field': 'content_id',
                          'rules': [
                              {
                                  'rule': 'invalid',
                                  'message': 'You have already reported this content.'
                              }
                          ]
                      };
                      _response_object.errors = [error];
                      _response_object.count = _response_object.errors.count;
                      return response.status(400).json(_response_object);
                  }else{
                      filtered_post_data.id = content.id;
                      emailReport(filtered_post_data);
                      //Find no of times
                      await findReportCount(filtered_post_data, async function(count){
                          await updateContent(filtered_post_data, count, function(updated){
                              _response_object.message = 'Content has been reported successfully.';
                              _response_object.details = content;
                              return response.status(201).json(_response_object);
                          })
                      });
                  }
              });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
