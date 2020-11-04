/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * isTrustedClients policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req, res, next) {
    var _response_object={};
    const post_params= req.body;
    var grant_type = post_params.grant_type;
    if(!grant_type){
        _response_object.message='grant_type field is missing.';
        return res.status(400).json(_response_object);
    }
    else {
        // Handle password and authorization code grant type
        if(grant_type === 'password'){
            // Make sure client_id is provided
            var client_id = post_params.client_id;
            if(!client_id){
                _response_object.message = 'client_id field is missing.';
                return res.status(400).json(_response_object);
            } else {
                // Make sure client is trusted
                Clients.findOne({client_id: client_id}, function(err, client){
                    if(err){
                        return res.status(500).json(err.message);
                    }
                    else {
                        if(!client){
                            _response_object.message = 'Unauthorized client.';
                            return res.status(401).json(_response_object);
                        }
                        if(client.trusted){
                            return next();
                        }else {
                            _response_object.message = 'Resource owner password flow is not allowed.';
                            return res.status(401).json(_response_object);
                        }
                    }
                });
            }
        } else if(grant_type === 'refresh_token'){
            return next();
        }
        else if(grant_type === 'authorization_code'){
            return next();
        }
        else{
            _response_object.message = 'Invalid grant type.';
            return res.status(503).json(_response_object);
        }
    }

};
