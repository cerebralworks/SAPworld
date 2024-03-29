

/* global _, validateModel, Menus, CityMenus */

var squel = require("squel");

module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, ['expand']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [];
    var expand = [];
	var user_id;
	if(request_query.userid !=undefined){
		user_id=request_query.userid;
	}else{
		user_id=logged_in_user.user_profile.id;
		
	}
    if (filtered_query_keys.includes('expand')) {
        expand = filtered_query_data.expand.split(',');
    }
    //Find the UserProfiles based on general criteria.
    const getUser = async(criteria, callback) => {
        //Initializing query
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(UserProfiles.tableName, UserProfiles.tableAlias);
        query.left_join(Users.tableName, Users.tableAlias, Users.tableAlias + '.' + Users.schema.id.columnName + "=" + UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName);
        var group_by = UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName;
        query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.id.columnName + "=" + user_id);
        //Selecting fields
        fields = _.without(Object.keys(UserProfiles.schema));
        fields.map(function(value) {
            if (UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined") {
                query.field(UserProfiles.tableAlias + '.' + UserProfiles.schema[value].columnName, value);
            }
        });
        if (expand.includes('employments')) {
            let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(UserEmployments.tableName, UserEmployments.tableAlias);
            sub_query.left_join(Industries.tableName, Industries.tableAlias, Industries.tableAlias + '.' + Industries.schema.id.columnName + "=" + UserEmployments.tableAlias + '.' + UserEmployments.schema.industry.columnName);
            sub_query.where(UserEmployments.tableAlias + "." + UserEmployments.schema.user.columnName + '=' + UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName);
            employments_fields = _.without(Object.keys(UserEmployments.schema));
            employments = '';
            employments_fields.map(function(value) {
                if (UserEmployments.schema[value].columnName || typeof UserEmployments.schema[value].columnName !== "undefined") {
                    employments += "'" + value + "'," + UserEmployments.tableAlias + "." + UserEmployments.schema[value].columnName + ",";
                }
            });
            //Adding industry fields
            industry_fields = _.without(Object.keys(Industries.schema));
            industry = '';
            industry_fields.map(function(value) {
                if (Industries.schema[value].columnName || typeof Industries.schema[value].columnName !== "undefined") {
                    industry += "'" + value + "'," + Industries.tableAlias + "." + Industries.schema[value].columnName + ",";
                }
            });
            employments += "'" + UserEmployments.schema.industry.columnName + "',json_build_object(" + industry.slice(0, -1) + "),";
            employments = 'array_agg(json_build_object(' + employments.slice(0, -1) + '))';
            sub_query.field(employments);
            query.field('(' + sub_query.toString() + ')', 'employments');
        }

        if (expand.includes('account')) {
            account_fields = _.without(Object.keys(Users.schema), 'username', 'password', 'tokens');
            account = '';
            account_fields.map(function(value) {
                if (Users.schema[value].columnName || typeof Users.schema[value].columnName !== "undefined") {
                    account += "'" + value + "'," + Users.tableAlias + "." + Users.schema[value].columnName + ",";
                }
            });
            account = 'json_build_object(' + account.slice(0, -1) + ')';
            group_by += ',' + Users.tableAlias + "." + Users.schema.id.columnName;
            query.field(account, 'account');
        }

        //Populating skill_tags
        if (expand.includes('skill_tags')) {
            let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' });
            let build_skill_tags_table_columns = '';
            sub_query.from(SkillTags.tableName, SkillTags.tableAlias);
            _.forEach(_.keys(SkillTags.schema), attribute => {
                if (!_.isEmpty(SkillTags.schema[attribute].columnName)) {
                    build_skill_tags_table_columns += `'${SkillTags.schema[attribute].columnName}',${SkillTags.tableAlias}.${SkillTags.schema[attribute].columnName},`;
                }
            });
            build_skill_tags_table_columns = build_skill_tags_table_columns.slice(0, -1);
            sub_query.field(`CASE WHEN ${UserProfiles.tableAlias}.${UserProfiles.schema.skill_tags.columnName} IS NULL THEN NULL ELSE array_agg(json_build_object(${build_skill_tags_table_columns})) END`);
            sub_query.where(`${SkillTags.tableAlias}.${SkillTags.schema.id.columnName} = ANY(${UserProfiles.tableAlias}.${UserProfiles.schema.skill_tags.columnName})`);
            query.field(`(${sub_query.toString()})`, `${UserProfiles.schema.skill_tags.columnName}`);
        }
        query.limit(1);
        query.group(group_by);
        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, users_result) {
            if (users_result && users_result.rows && users_result.rows.length > 0) {
                return callback(users_result.rows[0]);
            } else {
                _response_object.message = 'No user found with the given id.';
                return response.status(404).json(_response_object);
            }
        });
    };
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'User details retrieved successfully.';
        /*var meta = {};
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Users',
            sizes: {
                small: 256,
                medium: 512,
                large: 1024,
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/user-209.png';
        meta['doc_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['doc_resume'].example = meta['doc_resume'].path + '/' + meta['doc_resume'].folder + '/doc-resume-55.png';
        meta['video_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['video_resume'].example = meta['video_resume'].path + '/' + meta['video_resume'].folder + '/video-resume-55.png';
        _response_object['meta'] = meta;*/
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };

    // Building profile completed status
    const isProfileCompleted = async(userProfileData) => {
        var checkAttributes = _.pick(userProfileData, ['first_name','nationality', 'zip_code']);
        const isEmpty = await Object.values(checkAttributes).some(x => (x === null || x === '' || x === undefined));
        return !isEmpty;
    }

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            //Preparing data
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            await getUser(filtered_query_data, async function(user) {
                user.profile_completed = await isProfileCompleted(user);
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
