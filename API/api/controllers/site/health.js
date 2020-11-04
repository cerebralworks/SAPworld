/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, validateModel, Configurations */

module.exports = async function health(request,response) {
    var _response_object = {};
    _response_object.status = sails.config.custom.site.health.status;
    _response_object.message = sails.config.custom.site.health.message;
    return response.ok(_response_object);
};
