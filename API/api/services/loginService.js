
/* global _ */

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

var squel = require("squel");
const getProfileModalByType = profile_type => {
    switch (profile_type) {
        case _.get(sails, 'config.custom.access_role.user', null):
            return UserProfiles;
        case _.get(sails, 'config.custom.access_role.employer', null):
            return EmployerProfiles;
        case _.get(sails, 'config.custom.access_role.admin', null):
            return AdminProfiles;
        default:
            return null;
    }
};
exports.findUser = async function(username, callback, properties = {}) {
    try {
        if (!_.isNaN(Number(username))) {
            var encrypted_phone = username;
            await phoneEncryptor.encrypt(username, function(encrypted_text) {
                encrypted_phone = encrypted_text;
            });
        }
        const profileModal = getProfileModalByType(_.toNumber(_.get(properties, 'profile_type', 0)));
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(Users.tableName, Users.tableAlias);
        query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        query.left_join(EmployerProfiles.tableName, EmployerProfiles.tableAlias, EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        query.left_join(AdminProfiles.tableName, AdminProfiles.tableAlias, AdminProfiles.tableAlias + '.' + AdminProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        var username_query = squel.expr();
        username_query.or(Users.tableAlias + "." + Users.schema.username.columnName + "='" + username + "'");
        if (!_.isNaN(Number(username))) {
            username_query.or(UserProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName + "='" + encrypted_phone + "'");
            username_query.or(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.phone.columnName + "=" + parseInt(username));
            username_query.or(AdminProfiles.tableAlias + "." + AdminProfiles.schema.phone.columnName + "=" + parseInt(username));
        }
        username_query.or(UserProfiles.tableAlias + "." + UserProfiles.schema.email.columnName + "='" + username + "'");
        username_query.or(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.email.columnName + "='" + username + "'");
        username_query.or(AdminProfiles.tableAlias + "." + AdminProfiles.schema.email.columnName + "='" + username + "'");
        // username_query.or(UserProfiles.tableAlias + "." + UserProfiles.schema.user_handle.columnName + "='" + username + "'");
        query.where(username_query);
        query.field(Users.tableAlias + "." + Users.schema.id.columnName, 'id');
        query.field(Users.tableAlias + "." + Users.schema.types.columnName, 'types');
        query.field(Users.tableAlias + "." + Users.schema.username.columnName, 'username');
        query.field(Users.tableAlias + "." + Users.schema.password.columnName, 'password');
        query.field(Users.tableAlias + "." + Users.schema.status.columnName, 'status');
        query.field(Users.tableAlias + "." + Users.schema.status_glossary.columnName, 'status_glossary');
        query.field(Users.tableAlias + "." + Users.schema.verified.columnName, 'verified');
        query.field(Users.tableAlias + "." + Users.schema.last_active.columnName, 'last_active');
        query.field(Users.tableAlias + "." + Users.schema.user_profile.columnName, 'user_profile');
        query.field(Users.tableAlias + "." + Users.schema.employer_profile.columnName, 'employer_profile');
        query.field(Users.tableAlias + "." + Users.schema.admin_profile.columnName, 'admin_profile');
        query.field(Users.tableAlias + "." + Users.schema.tokens.columnName, 'tokens');
        query.field(Users.tableAlias + "." + Users.schema.created_at.columnName, 'created_at');
        query.field(Users.tableAlias + "." + Users.schema.updated_at.columnName, 'updated_at');
        query.field(profileModal.tableAlias + "." + profileModal.schema.phone.columnName, 'phone');
        query.field(profileModal.tableAlias + "." + profileModal.schema.email.columnName, 'email');
        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, user) {
            if (err) {
                var error_obj = new Error();
                error_obj.status = 404;
                if (err.message) {
                    error_obj.message = err.message;
                } else {
                    error_obj.message = 'Something went wrong.';
                }
                return callback(error_obj);
            } else if (user && user.rowCount > 0) {
                return callback(err, user['rows'][0]);
            } else {
                var error_obj = new Error();
                error_obj.status = 404;
                error_obj.message = 'No user found.';
                return callback(error_obj);
            }
        });
    } catch (err) {
        var error_obj = new Error();
        if (err.message) {
            error_obj.message = err.message;
        } else {
            error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
    }
};

exports.findExistingConnection = async function(source_type, email, phone, callback) {
    try {
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(Users.tableName, Users.tableAlias);
        query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        query.left_join(EmployerProfiles.tableName, EmployerProfiles.tableAlias, EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        query.left_join(AdminProfiles.tableName, AdminProfiles.tableAlias, AdminProfiles.tableAlias + '.' + AdminProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        var query_expr = squel.expr();
        if (email) {
            query_expr.or(Users.tableAlias + "." + Users.schema.username.columnName + "='" + email + "'");
            query_expr.or(UserProfiles.tableAlias + "." + UserProfiles.schema.email.columnName + "='" + email + "'");
            query_expr.or(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.email.columnName + "='" + email + "'");
            query_expr.or(AdminProfiles.tableAlias + "." + AdminProfiles.schema.email.columnName + "='" + email + "'");
        }
        if (phone) {
            var encrypted_phone = phone;
            await phoneEncryptor.encrypt(phone, function(encrypted_text) {
                encrypted_phone = encrypted_text;
            });
            query_expr.or(Users.tableAlias + "." + Users.schema.username.columnName + "='" + encrypted_phone + "'");
            query_expr.or(UserProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName + "='" + encrypted_phone + "'");
            query_expr.or(EmployerProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName + "='" + encrypted_phone + "'");
            query_expr.or(AdminProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName + "='" + encrypted_phone + "'");
        }
        query.where(query_expr);
        query.field(Users.tableAlias + "." + Users.schema.id.columnName, 'id');
        query.field(Users.tableAlias + "." + Users.schema.types.columnName, 'types');
        query.field(Users.tableAlias + "." + Users.schema.username.columnName, 'username');
        query.field(Users.tableAlias + "." + Users.schema.status.columnName, 'status');
        query.field(Users.tableAlias + "." + Users.schema.status_glossary.columnName, 'status_glossary');
        query.field(Users.tableAlias + "." + Users.schema.verified.columnName, 'verified');
        query.field(Users.tableAlias + "." + Users.schema.last_active.columnName, 'last_active');
        query.field(Users.tableAlias + "." + Users.schema.user_profile.columnName, 'user_profile');
        query.field(Users.tableAlias + "." + Users.schema.employer_profile.columnName, 'employer_profile');
        query.field(Users.tableAlias + "." + Users.schema.admin_profile.columnName, 'admin_profile');
        query.field(Users.tableAlias + "." + Users.schema.created_at.columnName, 'created_at');
        query.field(Users.tableAlias + "." + Users.schema.updated_at.columnName, 'updated_at');
        if (source_type === 0) {
            query.field(UserProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName, 'phone');
            query.field(UserProfiles.tableAlias + "." + UserProfiles.schema.email.columnName, 'email');
        } else if (source_type === 1) {
            query.field(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.phone.columnName, 'phone');
            query.field(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.email.columnName, 'email');
        } else if (source_type === 2) {
            query.field(AdminProfiles.tableAlias + "." + AdminProfiles.schema.phone.columnName, 'phone');
            query.field(AdminProfiles.tableAlias + "." + AdminProfiles.schema.email.columnName, 'email');
        }
        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, user) {
            if (err) {
                var error_obj = new Error();
                if (err.message) {
                    error_obj.message = err.message;
                } else {
                    error_obj.message = 'Something went wrong.';
                }
                return callback(error_obj);
            } else if (user && user.rowCount > 0) {
                return callback(err, user['rows'][0]);
            } else {
                return callback(err, null);
            }
        });
    } catch (err) {
        var error_obj = new Error();
        if (err.message) {
            error_obj.message = err.message;
        } else {
            error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
    }
};

exports.findUserByToken = function(access_token, callback) {
    try {
        //Building query
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(AccessTokens.tableName, AccessTokens.tableAlias);
        query.right_join(Clients.tableName, Clients.tableAlias, AccessTokens.tableAlias + '.' + AccessTokens.schema.client_id.columnName + "=" + Clients.tableAlias + '.' + Clients.schema.client_id.columnName);
        query.right_join(Users.tableName, Users.tableAlias, AccessTokens.tableAlias + '.' + AccessTokens.schema.user_id.columnName+'::varchar' + "=" + Users.tableAlias + '.' + Users.schema.id.columnName+'::varchar');
        query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, AccessTokens.tableAlias + '.' + AccessTokens.schema.user_id.columnName+'::varchar' + "=" + UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName+'::varchar');
        query.left_join(EmployerProfiles.tableName, EmployerProfiles.tableAlias, AccessTokens.tableAlias + '.' + AccessTokens.schema.user_id.columnName+'::varchar' + "=" + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.account.columnName+'::varchar');
        query.left_join(AdminProfiles.tableName, AdminProfiles.tableAlias, AccessTokens.tableAlias + '.' + AccessTokens.schema.user_id.columnName+'::varchar' + "=" + AdminProfiles.tableAlias + '.' + AdminProfiles.schema.account.columnName+'::varchar');
        query.where(AccessTokens.tableAlias + "." + AccessTokens.schema.token.columnName + "='" + access_token + "'");
        account_fields = _.without(Object.keys(Users.schema), 'username', 'password');
        account_fields.map(function(value) {
            if (Users.schema[value].columnName || typeof Users.schema[value].columnName !== "undefined") {
                query.field(Users.tableAlias + "." + Users.schema[value].columnName);
            }
        });
        //Adding user fields
        user_fields = _.without(Object.keys(UserProfiles.schema));
        users = '';
		var usersData = user_fields.reduce((resultArray, item, index) => { 
            var perChunk = 42;
          const chunkIndex = Math.floor(index/perChunk)

          if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
          }

          resultArray[chunkIndex].push(item)

          return resultArray
        }, []) 
		var users1='';	
		usersData[0][usersData[0].length]="account";
        usersData[0].map(function(value) {
            if (UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined") {
                users1 += "'" + UserProfiles.schema[value].columnName + "'," + UserProfiles.tableAlias + "." + UserProfiles.schema[value].columnName + ",";
            }
        });
		var users2 ="'data',json_build_object(";
		usersData[1].slice(0,usersData[1].length-1);
		usersData[1].map(function(value) {
            if (UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined") {
                users2 += "'" + UserProfiles.schema[value].columnName + "'," + UserProfiles.tableAlias + "." + UserProfiles.schema[value].columnName + ",";
            }
        });
        users = 'CASE WHEN ' + UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName + ' IS NULL THEN NULL ELSE json_build_object(' + users1.slice(0, -1) +','+users2.slice(0, -1)+ ')) END';
        query.field(users, 'user_profile');
        //Adding employer fields
        employer_fields = _.without(Object.keys(EmployerProfiles.schema));
        employers = '';
        employer_fields.map(function(value) {
            if (EmployerProfiles.schema[value].columnName || typeof EmployerProfiles.schema[value].columnName !== "undefined") {
                employers += "'" + EmployerProfiles.schema[value].columnName + "'," + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema[value].columnName + ",";
            }
        });
        employers = 'CASE WHEN ' + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.id.columnName + ' IS NULL THEN NULL ELSE json_build_object(' + employers.slice(0, -1) + ') END';
        query.field(employers, 'employer_profile');
        //Adding admin fields
        admin_fields = _.without(Object.keys(AdminProfiles.schema));
        admins = '';
        admin_fields.map(function(value) {
            if (AdminProfiles.schema[value].columnName || typeof AdminProfiles.schema[value].columnName !== "undefined") {
                admins += "'" + AdminProfiles.schema[value].columnName + "'," + AdminProfiles.tableAlias + "." + AdminProfiles.schema[value].columnName + ",";
            }
        });
        admins = 'CASE WHEN ' + AdminProfiles.tableAlias + "." + AdminProfiles.schema.id.columnName + ' IS NULL THEN NULL ELSE json_build_object(' + admins.slice(0, -1) + ') END';
        query.field(admins, 'admin_profile');
        //Adding token fields
        token_fields = _.without(Object.keys(AccessTokens.schema));
        token = '';
        token_fields.map(function(value) {
            if (AccessTokens.schema[value].columnName || typeof AccessTokens.schema[value].columnName !== "undefined") {
                token += "'" + AccessTokens.schema[value].columnName + "'," + AccessTokens.tableAlias + "." + AccessTokens.schema[value].columnName + ",";
            }
        });
        token = 'json_build_object(' + token.slice(0, -1) + ')';
        query.field(token, 'token');
        //Executing query
        var token_model = sails.sendNativeQuery(query.toString());
        token_model.exec(async function(err, user) {
            if (err) {
                var error_obj = new Error();
                if (err.message) {
                    error_obj.message = err.message;
                } else {
                    error_obj.message = 'Something went wrong.';
                }
                return callback(error_obj);
            } else if (user && user.rowCount > 0) {
                return callback(err, user['rows'][0]);
            } else {
                var error_obj = new Error();
                error_obj.message = 'No user found with given token.';
                return callback(error_obj);
            }
        });
    } catch (err) {
        var error_obj = new Error();
        if (err.message) {
            error_obj.message = err.message;
        } else {
            error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
    }
};

exports.findUserByEmail = function(email, callback) {
    try {
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(Users.tableName, Users.tableAlias);
        query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        var email_query = squel.expr();
        email_query.or(Users.tableAlias + "." + Users.schema.username.columnName + "='" + email + "'");
        email_query.or(UserProfiles.tableAlias + "." + UserProfiles.schema.email.columnName + "='" + email + "'");
        query.where(email_query);
        query.field(Users.tableAlias + "." + Users.schema.id.columnName, 'id');
        query.field(Users.tableAlias + "." + Users.schema.types.columnName, 'types');
        query.field(Users.tableAlias + "." + Users.schema.username.columnName, 'username');
        query.field(Users.tableAlias + "." + Users.schema.status.columnName, 'status');
        query.field(Users.tableAlias + "." + Users.schema.status_glossary.columnName, 'status_glossary');
        query.field(Users.tableAlias + "." + Users.schema.verified.columnName, 'verified');
        query.field(Users.tableAlias + "." + Users.schema.last_active.columnName, 'last_active');
        query.field(Users.tableAlias + "." + Users.schema.user_profile.columnName, 'user_profile');
        query.field(Users.tableAlias + "." + Users.schema.employer_profile.columnName, 'employer_profile');
        query.field(Users.tableAlias + "." + Users.schema.admin_profile.columnName, 'admin_profile');
        query.field(Users.tableAlias + "." + Users.schema.created_at.columnName, 'created_at');
        query.field(Users.tableAlias + "." + Users.schema.updated_at.columnName, 'updated_at');
        query.field(UserProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName, 'phone');
        query.field(UserProfiles.tableAlias + "." + UserProfiles.schema.email.columnName, 'email');

        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, user) {
            if (err) {
                var error_obj = new Error();
                if (err.message) {
                    error_obj.message = err.message;
                } else {
                    error_obj.message = 'Something went wrong.';
                }
                return callback(error_obj);
            } else if (user && user.rowCount > 0) {
                return callback(err, user['rows'][0]);
            } else {
                return callback(err, null);
            }
        });
    } catch (err) {
        var error_obj = new Error();
        if (err.message) {
            error_obj.message = err.message;
        } else {
            error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
    }
};

exports.findEmployerByEmail = function(email, callback) {
    try {
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(Users.tableName, Users.tableAlias);
        query.left_join(EmployerProfiles.tableName, EmployerProfiles.tableAlias, EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
        var email_query = squel.expr();
        email_query.or(Users.tableAlias + "." + Users.schema.username.columnName + "='" + email + "'");
        email_query.or(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.email.columnName + "='" + email + "'");
        query.where(email_query);
        query.field(Users.tableAlias + "." + Users.schema.id.columnName, 'id');
        query.field(Users.tableAlias + "." + Users.schema.types.columnName, 'types');
        query.field(Users.tableAlias + "." + Users.schema.username.columnName, 'username');
        query.field(Users.tableAlias + "." + Users.schema.status.columnName, 'status');
        query.field(Users.tableAlias + "." + Users.schema.status_glossary.columnName, 'status_glossary');
        query.field(Users.tableAlias + "." + Users.schema.verified.columnName, 'verified');
        query.field(Users.tableAlias + "." + Users.schema.last_active.columnName, 'last_active');
        query.field(Users.tableAlias + "." + Users.schema.user_profile.columnName, 'user_profile');
        query.field(Users.tableAlias + "." + Users.schema.employer_profile.columnName, 'employer_profile');
        query.field(Users.tableAlias + "." + Users.schema.admin_profile.columnName, 'admin_profile');
        query.field(Users.tableAlias + "." + Users.schema.created_at.columnName, 'created_at');
        query.field(Users.tableAlias + "." + Users.schema.updated_at.columnName, 'updated_at');
        query.field(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.phone.columnName, 'phone');
        query.field(EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.email.columnName, 'email');

        //Executing query
        var user_model = sails.sendNativeQuery(query.toString());
        user_model.exec(async function(err, user) {
            if (err) {
                var error_obj = new Error();
                if (err.message) {
                    error_obj.message = err.message;
                } else {
                    error_obj.message = 'Something went wrong.';
                }
                return callback(error_obj);
            } else if (user && user.rowCount > 0) {
                return callback(err, user['rows'][0]);
            } else {
                return callback(err, null);
            }
        });
    } catch (err) {
        var error_obj = new Error();
        if (err.message) {
            error_obj.message = err.message;
        } else {
            error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
    }
};