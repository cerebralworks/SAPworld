/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    bcrypt = require('bcrypt');

// Create OAuth 2.0 server
var server = oauth2orize.createServer();
var squel = require("squel");

server.serializeClient(function(client, done) {
    return done(null, client.id);
});

server.deserializeClient(function(id, done) {
    Clients.findOne(id, function(err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});

// Generate authorization code
server.grant(oauth2orize.grant.code(function(client, redirect_uri, user, ares, done) {
    AuthCodes.create({
        client_id: client.client_id,
        redirect_uri: redirect_uri,
        user_id: user.id,
        scope: ares.scope
    }).exec(function(err, code) {
        if (err) { return done(err, null); }
        return done(null, code.code);
    });
}));

// Generate access token for Implicit flow
// Only access token is generated in this flow, no refresh token is issued
server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
    AccessTokens.destroy({ user_id: user.id, client_id: client.client_id }, function(err) {
        if (err) {
            return done(err);
        } else {
            AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function(err, accessToken) {
                if (err) {
                    return done(err);
                } else {
                    return done(null, accessToken.token);
                }
            });
        }
    });
}));

// Exchange authorization code for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirect_uri, done) {
    AuthCodes.findOne({
        code: code
    }).exec(function(err, code) {
        if (err || !code) {
            return done(err);
        }
        if (client.client_id !== code.client_id) {
            return done(null, false);
        }
        if (redirect_uri !== code.redirect_uri) {
            return done(null, false);
        }
        RefreshTokens.create({ user_id: code.user_id, client_id: code.client_id }).exec(function(err, refreshToken) {
            if (err) {
                return done(err);
            } else {
                AccessTokens.create({ user_id: code.user_id, client_id: code.client_id }).exec(function(err, accessToken) {
                    if (err) {
                        return done(err);
                    } else {
                        Users.update({ id: user.id }, { last_active: new Date() }, function(err, updated_user) {
                            return done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife });
                        });
                    }
                });
            }
        });
    });
}));

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(async function(client, username, password, scope, request_data, done) {
    await loginService.findUser(username, async function(err, user) {
        if (!user) {
            return done({ message: 'Invalid username or password combination.' }, false, { message: 'Invalid username or password combination.' });
        } else if (user.status !== 1 && user.status !== 7) {
            return done({ message: 'Your account has been deactivated. Please contact admin for further details.' }, false, { message: 'Your account has been deactivated. Please contact admin for further details.' });
        } else {
            bcrypt.compare(password, user.password).then(function(password_check) {
                if (!password_check) {
                    return done({ message: 'Invalid username or password combination.' }, false, { message: 'Invalid username or password combination' });
                };
                if (!user.verified) {
                    return done({ message: 'Please verify your email.' }, false, { message: 'Please verify your email.' });
                };
                generateToken(user, client);
            });
        }
    });
    //Generating access token
    function generateToken(user, client) {
        RefreshTokens.create({ user_id: user.id, client_id: client.client_id }, function(err, refreshToken) {
            if (err) {
                return done(err);
            } else {
                AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function(err, accessToken) {
                    if (err) {
                        return done(err);
                    } else {
                        Users.update({ id: user.id }, { last_active: new Date(), last_checkin_via: 'web' }, function(err, updated_user) {
                            done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife, types: user.types });
                        });
                    }
                });
            }
        });
    }
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    RefreshTokens.findOne({ token: refreshToken }, function(err, token) {
        if (err) { return done(err); }
        if (!token) { return done({ message: 'Unauthorized' }, false); }
        var query_params = {
            id: token.user_id
        };
        Users.findOne(query_params).exec(function(err, user_result) {
            if (err) { return done(err); }
            if (!user_result) {
                return done({ message: 'Unauthorized' }, false, { message: 'Unauthorized' });
            } else {
                destroyExistingTokens(user_result, client, function(err, destroy_success) {
                    if (err) {
                        return done(err);
                    } else {
                        generateRefreshToken(user_result, client);
                    }
                });
            }
        });
        //Destroying existing tokens
        function destroyExistingTokens(user, client, destroy_callback) {
            RefreshTokens.destroy({ token: refreshToken }, function(err, destoyed_token) {
                if (err) {
                    return destroy_callback(err);
                } else {
                    return destroy_callback(err, true);
                }
            });
        };
        //Generating refresh token
        function generateRefreshToken(user, client) {
            RefreshTokens.create({ user_id: user.id, client_id: client.client_id }, function(err, refreshToken) {
                if (err) {
                    return done(err);
                } else {
                    AccessTokens.create({ user_id: user.id, client_id: client.client_id }, function(err, accessToken) {
                        if (err) {
                            return done(err);
                        } else {
                            Users.update({ id: user.id }, { last_active: new Date() }, function(err, updated_user) {
                                done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife, types: user.types });
                            });
                        }
                    });
                }
            });
        }
    });
}));

module.exports = {
    http: {
        middleware: {
            initializePassport: (function() {
                var passport = require('passport');
                var reqResNextFn = passport.initialize();
                return reqResNextFn;
            })(),
            passportSession: (function() {
                var passport = require('passport');
                var reqResNextFn = passport.session();
                return reqResNextFn;
            })()
        }
    },
    server: server
};