/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, validateModel, Menus, CityMenus */

var squel = require("squel");

module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, ['id']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [{ name: 'id', required: true }];
    var expand = [];
    //Find the Industries based on general criteria.
    const getIndustry = (criteria, callback) => {
        //Initializing query
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(Industries.tableName, Industries.tableAlias);
        if (isNaN(parseInt(filtered_query_data.id))) {
            query.where(Industries.tableAlias + '.' + Industries.schema.user_handle.columnName + "='" + criteria.id + "'");
        } else {
            query.where(Industries.tableAlias + '.' + Industries.schema.id.columnName + "=" + parseInt(criteria.id));
        }

        query.limit(1);
        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, users_result) {
            if (users_result && users_result.rows && users_result.rows.length > 0) {
                return callback(users_result.rows[0]);
            } else {
                _response_object.message = 'No Industry found with the given id.';
                return response.status(404).json(_response_object);
            }
        });
    };
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'Industry details retrieved successfully.';
       /* var meta = {};
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Industry',
            sizes: {
                small: 256,
                medium: 512,
                large: 1024,
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/Industry-209.png';
        _response_object['meta'] = meta;*/
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };
    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            //Preparing data
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            await getIndustry(filtered_query_data, async function(user) {
                if (user.phone) {
                    await phoneEncryptor.decrypt(user.phone, function(decrypted_text) {
                        user.phone = decrypted_text;
                        sendResponse(user);
                    });
                } else {
                    sendResponse(user);
                }
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};