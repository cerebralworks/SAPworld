/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global Client */

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    bcrypt = require('bcrypt'),
    trustedClientPolicy = require('../api/policies/isTrustedClient.js'),
    loginSocialService = require('../api/services/loginSocialService.js'),
    oauth2_server = require('./oauth2.js').server;


module.exports.routes = {


    //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': function(request, response) {
        response.status(200).json({ message: 'Welcome to Shejobs API.' });
    },

    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/

    /*Client routes*/
    'GET /clients/create': nonGetHandler,
    'POST /clients/create': { controller: 'clients', action: 'create' },
    'GET /clients/list': { controller: 'clients', action: 'list' },

    /*Users routes*/
    'GET /users/list': { controller: 'users', action: 'list' },
    'GET /users/signup': nonGetHandler,
    'POST /users/signup': { controller: 'users', action: 'signup' },
    'GET /users/view/:id': { controller: 'users', action: 'view' },
    'GET /users/profile': { controller: 'users', action: 'profile' },
    'GET /users/update': nonGetHandler,
    'POST /users/update': { controller: 'users', action: 'update' },
    'GET /users/update-photo': nonGetHandler,
    'POST /users/update-photo': { controller: 'users', action: 'update-photo' },
    'GET /users/update-doc-resume': nonGetHandler,
    'POST /users/update-doc-resume': { controller: 'users', action: 'update-doc-resume' },
    'GET /users/update-video-resume': nonGetHandler,
    'POST /users/update-video-resume': { controller: 'users', action: 'update-video-resume' },
    'GET /users/check-user-handle/:user_handle': { controller: 'users', action: 'check-user-handle' },
    'GET /users/update-user-handle': nonGetHandler,
    'POST /users/update-user-handle': { controller: 'users', action: 'update-user-handle' },
    'GET /users/update-phone': nonGetHandler,
    'POST /users/update-phone': { controller: 'users', action: 'update-phone' },
    'GET /users/update-email': nonGetHandler,
    'POST /users/update-email': { controller: 'users', action: 'update-email' },
    'GET /users/employments/create': nonGetHandler,
    'POST /users/employments/create': { controller: 'users', action: 'employments/create' },
    'GET /users/employments/update/:id': nonGetHandler,
    'POST /users/employments/update/:id': { controller: 'users', action: 'employments/update' },
    'GET /users/employments/delete': nonGetHandler,
    'POST /users/employments/delete': { controller: 'users', action: 'employments/delete' },
    'GET /users/educations/create': nonGetHandler,
    'POST /users/educations/create': { controller: 'users', action: 'educations/create' },
    'GET /users/educations/update/:id': nonGetHandler,
    'POST /users/educations/update/:id': { controller: 'users', action: 'educations/update' },
    'GET /users/educations/delete': nonGetHandler,
    'POST /users/educations/delete': { controller: 'users', action: 'educations/delete' },
    'GET /users/change-status': nonGetHandler,
    'POST /users/change-status/:id': { controller: 'users', action: 'change-status' },
    'GET /users/job-approach-invitation': { controller: 'users', action: 'job-approach-invitation' },
    /*Employers routes*/
    'GET /employers/list': { controller: 'employers', action: 'list' },
    'GET /employers/signup': nonGetHandler,
    'POST /employers/signup': { controller: 'employers', action: 'signup' },
    'GET /employers/view/:id': { controller: 'employers', action: 'view' },
    'GET /employers/profile': { controller: 'employers', action: 'profile' },
    'GET /employers/update/:id': nonGetHandler,
    'POST /employers/update': { controller: 'employers', action: 'update' },
    'GET /employers/update-photo': nonGetHandler,
    'POST /employers/update-photo': { controller: 'employers', action: 'update-photo' },
    'GET /employers/update-phone': nonGetHandler,
    'POST /employers/update-phone': { controller: 'employers', action: 'update-phone' },
    'GET /employers/update-email': nonGetHandler,
    'POST /employers/update-email': { controller: 'employers', action: 'update-email' },
    'GET /employers/approach-job-seeker': nonGetHandler,
    'POST /employers/approach-job-seeker': { controller: 'employers', action: 'approach-job-seeker' },

    /*Jobs routes*/
    'GET /jobpostings/list': { controller: 'jobpostings', action: 'list' },
    'GET /jobpostings/create': nonGetHandler,
    'POST /jobpostings/create': { controller: 'jobpostings', action: 'create' },
    'GET /jobpostings/view/:id': { controller: 'jobpostings', action: 'view' },
    'GET /jobpostings/update/:id': nonGetHandler,
    'POST /jobpostings/update/:id': { controller: 'jobpostings', action: 'update' },
    'GET /jobpostings/update-photo/:id': nonGetHandler,
    'POST /jobpostings/update-photo/:id': { controller: 'jobpostings', action: 'update-photo' },
    'GET /jobpostings/delete': nonGetHandler,
    'POST /jobpostings/delete': { controller: 'jobpostings', action: 'delete' },
    'GET /jobpostings/change-status/:id': nonGetHandler,
    'POST /jobpostings/change-status/:id': { controller: 'jobpostings', action: 'change-status' },
    'GET /jobpostings/apply': nonGetHandler,
    'POST /jobpostings/apply': { controller: 'jobpostings', action: 'apply' },
    'GET /jobpostings/applications/list': { controller: 'jobpostings', action: 'applications/list' },
    'GET /jobpostings/applications/list-for-user': { controller: 'jobpostings', action: 'applications/list-for-user' },
    'GET /jobpostings/applications/view/:id': { controller: 'jobpostings', action: 'applications/view' },
    'GET /jobpostings/applications/view-for-user/:id': { controller: 'jobpostings', action: 'applications/view-for-user' },
    'GET /jobpostings/applications/change-status/:id': nonGetHandler,
    'POST /jobpostings/applications/change-status/:id': { controller: 'jobpostings', action: 'change-status' },
    'GET /jobpostings/applications/short-list-user/:id': nonGetHandler,
    'POST /jobpostings/applications/short-list-user/:id': { controller: 'jobpostings', action: 'applications/short-list-user' },

    /*Site routes*/
    'GET /site/health': { controller: 'site', action: 'health' },
    'GET /site/report': nonGetHandler,
    'POST /site/report': { controller: 'site', action: 'report' },

    /*Account routes*/
    'GET /accounts/request-reset-password': nonGetHandler,
    'POST /accounts/request-reset-password': { controller: 'accounts', action: 'request-reset-password' },
    'GET /accounts/reset-password': nonGetHandler,
    'POST /accounts/reset-password': { controller: 'accounts', action: 'reset-password' },
    'GET /accounts/verify': nonGetHandler,
    'POST /accounts/verify': { controller: 'accounts', action: 'verify' },
    'GET /accounts/update-password': nonGetHandler,
    'POST /accounts/update-password': { controller: 'accounts', action: 'update-password' },

    /*Admins routes*/
    'GET /admins/create': nonGetHandler,
    'POST /admins/create': { controller: 'admins', action: 'create' },
    'GET /admins/profile': { controller: 'admins', action: 'profile' },

    /*Location routes*/
    'GET /locations/states': { controller: 'locations', action: 'states' },
    'GET /locations/countries': { controller: 'locations', action: 'countries' },
    'GET /locations/cities': { controller: 'locations', action: 'cities/list' },
    'GET /locations/cities/view/:id': { controller: 'locations', action: 'cities/view' },
    'GET /locations/areas': { controller: 'locations', action: 'areas' },

    /*Category routes*/
    'GET /categories/create': nonGetHandler,
    'POST /categories/create': { controller: 'categories', action: 'create' },
    'GET /categories/update/:id': nonGetHandler,
    'POST /categories/update/:id': { controller: 'categories', action: 'update' },
    'GET /categories/change-status/:id': nonGetHandler,
    'POST /categories/change-status/:id': { controller: 'categories', action: 'change-status' },
    'GET /categories/update-photo/:id': nonGetHandler,
    'POST /categories/update-photo/:id': { controller: 'categories', action: 'update-photo' },
    'GET /categories/delete': nonGetHandler,
    'POST /categories/delete': { controller: 'categories', action: 'delete' },
    'GET /categories/list': { controller: 'categories', action: 'list' },
    'GET /categories/view/:id': { controller: 'categories', action: 'view' },

    /*Educations routes*/
    'GET /educations/degrees/create': nonGetHandler,
    'POST /educations/degrees/create': { controller: 'educations', action: 'degrees/create' },
    'GET /educations/degrees/update/:id': nonGetHandler,
    'POST /educations/degrees/update/:id': { controller: 'educations', action: 'degrees/update' },
    'GET /educations/degrees/change-status/:id': nonGetHandler,
    'POST /educations/degrees/change-status/:id': { controller: 'educations', action: 'degrees/change-status' },
    'GET /educations/degrees/delete': nonGetHandler,
    'POST /educations/degrees/delete': { controller: 'educations', action: 'degrees/delete' },
    'GET /educations/degrees/view/:id': { controller: 'educations', action: 'degrees/view' },
    'GET /educations/degrees/list': { controller: 'educations', action: 'degrees/list' },

    'GET /educations/fields/create': nonGetHandler,
    'POST /educations/fields/create': { controller: 'educations', action: 'fields/create' },
    'GET /educations/fields/update/:id': nonGetHandler,
    'POST /educations/fields/update/:id': { controller: 'educations', action: 'fields/update' },
    'GET /educations/fields/change-status/:id': nonGetHandler,
    'POST /educations/fields/change-status/:id': { controller: 'educations', action: 'fields/change-status' },
    'GET /educations/fields/delete': nonGetHandler,
    'POST /educations/fields/delete': { controller: 'educations', action: 'fields/delete' },
    'GET /educations/fields/view/:id': { controller: 'educations', action: 'fields/view' },
    'GET /educations/fields/list': { controller: 'educations', action: 'fields/list' },

    'GET /educations/institutions/create': nonGetHandler,
    'POST /educations/institutions/create': { controller: 'educations', action: 'institutions/create' },
    'GET /educations/institutions/update/:id': nonGetHandler,
    'POST /educations/institutions/update/:id': { controller: 'educations', action: 'institutions/update' },
    'GET /educations/institutions/change-status/:id': nonGetHandler,
    'POST /educations/institutions/change-status/:id': { controller: 'educations', action: 'institutions/change-status' },
    'GET /educations/institutions/delete': nonGetHandler,
    'POST /educations/institutions/delete': { controller: 'educations', action: 'institutions/delete' },
    'GET /educations/institutions/view/:id': { controller: 'educations', action: 'institutions/view' },
    'GET /educations/institutions/list': { controller: 'educations', action: 'institutions/list' },

    /*Industries routes*/
    'GET /industries/list': { controller: 'industriesController', action: 'list' },
    'GET /industries/view/:id': { controller: 'industriesController', action: 'view' },
    'POST /industries/update-photo/:id': { controller: 'industriesController', action: 'update-photo' },
    'POST /industries/create': 'industriesController.create',
    'POST /industries/update': 'industriesController.update',

    /*Skill_tags routes*/
    'GET /skill-tags/list': { controller: 'skill-tags', action: 'list' },
    'GET /skill-tags/create': nonGetHandler,
    'POST /skill-tags/create': { controller: 'skill-tags', action: 'create' },

    /*Subscription plans routes*/
    'GET /subscription-plans/create': nonGetHandler,
    'POST /subscription-plans/create': { controller: 'subscription-plans', action: 'create' },
    'GET /subscription-plans/update/:id': nonGetHandler,
    'POST /subscription-plans/update/:id': { controller: 'subscription-plans', action: 'update' },
    'GET /subscription-plans/change-status/:id': nonGetHandler,
    'POST /subscription-plans/change-status/:id': { controller: 'subscription-plans', action: 'change-status' },
    'GET /subscription-plans/delete/:id': nonGetHandler,
    'POST /subscription-plans/delete/:id': { controller: 'subscription-plans', action: 'delete' },
    'GET /subscription-plans/list': { controller: 'subscription-plans', action: 'list' },
    'GET /subscription-plans/view/:id': { controller: 'subscription-plans', action: 'view' },

    /*User subscriptions routes*/
    'GET /users/subscriptions/create': nonGetHandler,
    'POST /users/subscriptions/create': { controller: 'users', action: 'subscriptions/create' },

    /*Oauth 2 - Endpoints*/
    'GET /oauth/token': nonGetHandler,

    /*Get Access Token Using Password*/
    'POST /oauth/token': [
        trustedClientPolicy,
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        oauth2_server.token(),
        oauth2_server.errorHandler()
    ],

    /*Get Access Token Using Social Login*/
    "POST /users/social-login": [
        function(req, res, next) {
            passport.authenticate(
                ["basic", "oauth2-client-password"], { session: false },
                function(error, client) {
                    if (!client) {
                        return res.status(401).json({ message: "Unauthorized" });
                    } else {
                        req.user = client;
                        next();
                    }
                }
            )(req, res, next);
        },
        loginSocialService
    ],

    /*Renders login page*/
    // 'GET /login': function(req, res){
    //     var user = req.flash("userdata");
    //     var userdata = '';
    //     if(user !== 'undefined' && user.length>0){
    //        userdata = user[0];
    //     }
    //     return res.view('pages/login', {
    //         message: req.flash("error"),
    //         userdata: userdata
    //     });
    // },

    /*Handle post data from login page*/
    // 'POST /login': function(req, res, next){
    //     passport.authenticate('local', function(err, user, info) {
    //         req.flash("userdata",req.body);
    //         if (err) {
    //             req.flash("error",info.message);
    //             return next(err);
    //         }
    //         if (!user) {
    //             req.flash("error",info.message);
    //             return res.redirect('/login');
    //         }
    //         req.logIn(user, function(err) {
    //             if (err) { return next(err); }
    //             return res.redirect(req.session.returnTo ? req.session.returnTo : "/");
    //         });
    //     })(req, res, next);
    // },

    /*Handle post data from login page*/
    // 'POST /users/social-login': [function(req, res, next){
    //     passport.authenticate(['basic', 'oauth2-client-password'], { session: false },function(error, client){
    //         if(!client){
    //             return res.status(401).json({message:"Unauthorized"});
    //         }
    //         else{
    //             req.user=client;
    //             next();
    //         }
    //     })(req, res, next);
    // },loginSocialService],

    'GET /logout': function(req, res) {
        req.logout();
        res.redirect('/login');
    }


    /*Render authorize page.
     *
     * Sample URL: http://localhost:1337/oauth/authorize?response_type=token&client_id=8MONB4VIJX&redirect_uri=http://localhost:8080/
     * Sample URL: http://localhost:1337/oauth/authorize?response_type=code&client_id=8MONB4VIJX&redirect_uri=http://localhost:8080/
     * */
    // 'GET /oauth/authorize': [
    //     login.ensureLoggedIn(),
    //     oauth2_server.authorize(function(clientId, redirectURI, done) {
    //         Client.findOne({clientId: clientId}, function(err, client) {
    //           if (err) { return done(err); }
    //           if (!client) { return done(null, false); }
    //           if (client.redirectURI !== redirectURI) { return done(null, false); }
    //           return done(null, client, client.redirectURI);
    //         });
    //     }),
    //     function(req, res, next){
    //         // TRUSTED CLIENT
    //         // if client is trusted, skip ahead to next,
    //         // which is the server.decision() function
    //         // that normally is called when you post the auth dialog form
    //         if (req.oauth2.client.trusted) {
    //             // add needed params to simulate auth dialog being posted
    //             req.trusted = true;
    //             req.body = req.query;
    //             req.body.transaction_id = req.oauth2.transactionID;
    //             return next();
    //         }
    //         return res.render('pages/dialog', {
    //             transactionID: req.oauth2.transactionID,
    //             user: req.user,
    //             client: req.oauth2.client,
    //             jwtToken: req.query.token
    //         });
    //     },
    //     // We added this 2 methods here in case the form is skipped (TRUSTED CLIENT)
    //     oauth2_server.decision(),
    //     oauth2_server.errorHandler()
    // ],
    //
    // 'POST /oauth/authorize/decision': [
    //     login.ensureLoggedIn(),
    //     oauth2_server.decision()
    // ]
};

function nonGetHandler(request, response) {
    return response.status(405).json({ message: 'The requested method must be POST.' });
}
