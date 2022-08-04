/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

var env = require('node-env-file');
env(__dirname + '/../../.env');

//Overwrite these configuration in env/production.js for production enviroment
module.exports.conf = {
    google: {
        client_id: process.env.google_client_id,
        client_secret: process.env.google_api_key,
        api_key: process.env.google_api_key
    },
    aws: {
        region: process.env.aws_region,
        api_version: process.env.aws_api_version,
        bucket_name: process.env.aws_bucket_name,
        access_key_id: process.env.aws_access_key_id,
        secret_access_key: process.env.aws_secret_access_key,
        endpoint: process.env.aws_endpoint
    },
    solr: {
        host: process.env.solr_host,
        port: process.env.solr_port,
        core: process.env.solr_core,
        protocol: process.env.solr_protocol
    },
    factor2: {
        api_key: process.env.factor2_api_key
    },
    onesignal: {
        rest_key: process.env.onesignal_rest_key,
        app_id: process.env.onesignal_app_id
    },
    webapp: process.env.webapp,
    appurl: process.env.appurl,
    stripe: {
        platform_secret_key: process.env.stripe_platform_secret_key
    },
    default_cc_email_id: process.env.default_cc_email_id
};