/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, validateModel, Menus, CityMenus */

var squel = require("squel");

module.exports = async function list(request,response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, ['id', 'expand']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
      {name: 'id', required: true, number: true},
    ];
    var expand = [];
    if(filtered_query_keys.includes('expand')){
        expand = filtered_query_data.expand.split(',');
    }

    //Find the EmployerProfiles based on general criteria.
    const getUser = (criteria, callback) => {
        //Initializing query
        var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(EmployerProfiles.tableName, EmployerProfiles.tableAlias);
        query.left_join(Users.tableName, Users.tableAlias, Users.tableAlias + '.' + Users.schema.id.columnName + "=" + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.account.columnName);
        var group_by = EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.id.columnName;
        query.where(EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.id.columnName + "=" + parseInt(filtered_query_data.id));
        //Selecting fields
        fields = _.without(Object.keys(EmployerProfiles.schema));
        fields.map(function(value){
            if(EmployerProfiles.schema[value].columnName || typeof EmployerProfiles.schema[value].columnName !== "undefined"){
                query.field(EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema[value].columnName, value);
            }
        });
        if(expand.includes('account')){
            account_fields = _.without(Object.keys(Users.schema),'username','password','tokens');
            account = '';
            account_fields.map(function(value){
                if(Users.schema[value].columnName || typeof Users.schema[value].columnName !== "undefined"){
                    account += "'"+ value + "'," + Users.tableAlias + "." + Users.schema[value].columnName + ",";
                }
            });
            account = 'json_build_object(' + account.slice(0, -1) + ')';
            group_by += ',' + Users.tableAlias + "." + Users.schema.id.columnName;
            query.field(account, 'account');
        }
        if(expand.includes('city')){
            let sub_query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(Cities.tableName, Cities.tableAlias);
            sub_query.where(Cities.tableAlias + "." + Cities.schema.id.columnName + '=' + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.city.columnName);
            city_fields = _.without(Object.keys(Cities.schema));
            city = '';
            city_fields.map(function(value){
                if(Cities.schema[value].columnName || typeof Cities.schema[value].columnName !== "undefined"){
                    city += "'"+ value + "'," + Cities.tableAlias + "." + Cities.schema[value].columnName + ",";
                }
            });
            if(expand.includes('state')){
                sub_query.left_join(States.tableName, States.tableAlias, States.tableAlias + '.' + States.schema.id.columnName + "=" + Cities.tableAlias + '.' + Cities.schema.state.columnName);
                state_fields = _.without(Object.keys(States.schema));
                state = '';
                state_fields.map(function(value){
                    if(States.schema[value].columnName || typeof States.schema[value].columnName !== "undefined"){
                        state += "'"+ value + "'," + States.tableAlias + "." + States.schema[value].columnName + ",";
                    }
                });
                state = 'json_build_object(' + state.slice(0, -1) + ')';
                city += "'"+ Cities.schema.state.columnName + "'," + state + ",";
            }
            if(expand.includes('country')){
                sub_query.left_join(Countries.tableName, Countries.tableAlias, Countries.tableAlias + '.' + Countries.schema.id.columnName + "=" + Cities.tableAlias + '.' + Cities.schema.country.columnName);
                country_fields = _.without(Object.keys(Countries.schema));
                country = '';
                country_fields.map(function(value){
                    if(Countries.schema[value].columnName || typeof Countries.schema[value].columnName !== "undefined"){
                        country += "'"+ value + "'," + Countries.tableAlias + "." + Countries.schema[value].columnName + ",";
                    }
                });
                country = 'json_build_object(' + country.slice(0, -1) + ')';
                city += "'"+ Cities.schema.country.columnName + "'," + country + ",";
            }
            city = 'json_build_object(' + city.slice(0, -1) + ')';
            sub_query.field(city);
            query.field('(' + sub_query.toString() + ')', 'city');
        }
        query.limit(1);
        query.group(group_by);
        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, users_result){
            if(users_result && users_result.rows && users_result.rows.length > 0){
                return callback(users_result.rows[0]);
            }else{
                _response_object.message = 'No employer found with the given id.';
                return response.status(404).json(_response_object);
            }
        });
    };
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'Employer details retrieved successfully.';
        var meta = {};
        meta['photo'] = {
          path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
          folder: 'public/images/Employers',
          sizes: {
            small: 256,
            medium: 512,
            large: 1024,
          }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/user-209.png';
        _response_object['meta'] = meta;
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };
    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors){
        if(valid){
            //Preparing data
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            await getUser(filtered_query_data, async function (user) {
                if(user.phone){
                    await phoneEncryptor.decrypt(user.phone, function(decrypted_text){
                        user.phone = decrypted_text;
                        sendResponse(user);
                    });
                }else{
                    sendResponse(user);
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
