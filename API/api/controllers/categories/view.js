
/* global _, validateModel, Categories */

var squel = require("squel");
module.exports = async function list(request,response) {
    var _response_object = {};
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    const filtered_query_data = _.pick(request_query, ['expand']);
    var input_attributes = [
    ]; 
    var expand = [];
    if(filtered_query_data.expand){
        expand = filtered_query_data.expand.split(',');
    }
    // Indicates the category which has been removed
    var status_deleted_sign = _.get(sails.config.custom.status_codes, 'deleted');

    
    //Find the Categories based on general criteria.
    const getCategories = async (criteria, callback) => { 
        let query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).
        from(Categories.tableName,"category");
        var fields =_.without(Object.keys(Categories.schema), 'parent');
        await fields.forEach(function(attribute){
            query.field(Categories.schema[attribute].columnName);
        }); 
        
        if(expand.includes('parent')){
            let sub_query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).
            from(Categories.tableName);
            var build_columns = '';
            await fields.forEach(function(attribute){
                build_columns +=`'${Categories.schema[attribute].columnName}',${Categories.schema[attribute].columnName},`;
            });  
            build_columns = build_columns.slice(0, -1);
            sub_query.field(`json_build_object(${build_columns})`).
            where(`${Categories.schema.id.columnName} = category.${Categories.schema.parent.columnName}`);
            query.field(`(${sub_query.toString()})`, Categories.schema.parent.columnName);
        } else {
            query.field(Categories.schema.parent.columnName);
        } 
        query.where(`${Categories.schema.id.columnName} = ${criteria.id}`).
        where(`${Categories.schema.status.columnName} != ${status_deleted_sign}`). 
        limit(1); 
		//To get the particular category details
        sails.sendNativeQuery(query.toString(),function (err, category) {
            if(err){
                var error = {
                    'field': 'items',
                    'rules': [
                        {
                            'rule': 'invalid',
                            'message': err.message
                        }
                    ]
                };
                _response_object.errors = [error];
                _response_object.count = _response_object.errors.count;
                return response.status(400).json(_response_object);
            }else{
                if(!category.rows.length>0){
                    _response_object.message = 'No category details found with the given id.';
                    return response.status(404).json(_response_object);
                }
                else {
                    return callback(category.rows[0]);
                } 
            }
        });
    };

    
    //Build and sending response
    const sendResponse = (details) => { 
        _response_object.message = 'Category items retrieved successfully.';
       /* var meta = {}; 
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Categories',
            sizes: {
              small: 256,
              medium: 512
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/[filename].[filetype]';
        _response_object['meta'] = meta;*/
        _response_object['details'] = details;
 
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors){
        if(valid){
  
            //Preparing data
            await getCategories({id}, function (details) {
                sendResponse(details);
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
