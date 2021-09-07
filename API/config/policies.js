/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions, unless overridden.       *
     * (`true` allows public access)                                            *
     *                                                                          *
     ***************************************************************************/

    '*': 'oauthBearer',

    'clients/*': ['oauthBearer', 'isAdmin'],

    //'users/list': ['oauthBearer', 'isAdmin'],
    'users/view': ['oauthBearer'],
    'users/profile': ['oauthBearer', 'isUser'],
    'users/signup': ['noOauthBearer'],
    'users/update': ['oauthBearer', 'isUserOrAdmin'],
    'users/update-photo': ['oauthBearer', 'isUser'],
    'users/update-doc-resume': ['oauthBearer', 'isUser'],
    'users/resume-delete': ['oauthBearer', 'isUser'],
    'users/choose-default-resume': ['oauthBearer', 'isUser'],
    'users/update-video-resume': ['oauthBearer', 'isUser'],
    'users/check-user-handle': ['oauthBearer'],
    'users/update-user-handle': ['oauthBearer', 'isUser'],
    'users/update-phone': ['oauthBearer', 'isUser'],
    'users/update-email': ['oauthBearer', 'isUser'],
    'users/employments/create': ['oauthBearer', 'isUser'],
    'users/employments/update': ['oauthBearer', 'isUser'],
    'users/employments/delete': ['oauthBearer', 'isUser'],
    'users/educations/create': ['oauthBearer', 'isUser'],
    'users/educations/update': ['oauthBearer', 'isUser'],
    'users/educations/delete': ['oauthBearer', 'isUser'],
    'users/user-dashboard': ['oauthBearer', 'isUser'],
    'users/list': ['oauthBearer', 'isEmployerOrAdmin'],
    'users/change-status': ['oauthBearer', 'isAdmin'],
    'users/job-approach-invitation': ['noOauthBearer'],

    'employers/list': ['oauthBearer', 'isAdmin'],
    'employers/view': ['oauthBearer'],
    'employers/update': ['oauthBearer', 'isEmployerOrAdmin'],
    'employers/update-photo': ['oauthBearer', 'isEmployer'],
    'employers/update-phone': ['oauthBearer', 'isEmployer'],
    'employers/update-email': ['oauthBearer', 'isEmployer'],
    'employers/change-status': ['oauthBearer', 'isAdmin'],
    'employers/profile': ['oauthBearer', 'isEmployer'],
    'employers/signup': ['noOauthBearer'],
    'employers/approach-job-seeker': ['oauthBearer', 'isEmployer'],
    'employers/update-company-profile': ['oauthBearer', 'isEmployer'],
    'employers/company-profile': ['oauthBearer', 'isEmployer'],
    'employers/saved-profiles': ['oauthBearer', 'isEmployer'],
    'employers/save-profile': ['oauthBearer', 'isEmployer'],
    'employers/employers-dashboard': ['oauthBearer', 'isEmployer'],


    'jobpostings/create': ['oauthBearer', 'isEmployer'],
    'jobpostings/update': ['oauthBearer', 'isEmployer'],
    'jobpostings/update-photo': ['oauthBearer', 'isEmployer'],
    'jobpostings/list': ['noOauthBearer'],
    'jobpostings/view': ['noOauthBearer'],
    'jobpostings/apply': ['oauthBearer', 'isUser'],
    'jobpostings/delete': ['oauthBearer', 'isEmployer'],
    'jobpostings/change-status': ['oauthBearer', 'isEmployerOrAdmin'],
    'jobpostings/applications/list': ['oauthBearer', 'isEmployerOrAdmin'],
    'jobpostings/applications/list-for-user': ['oauthBearer', 'isUser'],
    'jobpostings/applications/view': ['oauthBearer', 'isEmployerOrAdmin'],
    'jobpostings/applications/view-for-user': ['oauthBearer', 'isUser'],
    'jobpostings/applications/change-status': ['oauthBearer', 'isEmployer'],
    'jobpostings/applications/short-list-user': ['oauthBearer', 'isEmployer'],
    'jobpostings/job-scoring': ['oauthBearer', 'isEmployer'],
    'jobpostings/user-scoring': ['oauthBearer', 'isUser'],
    'jobpostings/send-email': ['oauthBearer', 'isEmployer'],

	
	
	
    'site/health': ['noOauthBearer'],
    'site/report': ['oauthBearer', 'isUser'],

    'accounts/request-reset-password': ['noOauthBearer'],
    'accounts/reset-password': ['noOauthBearer'],
    'accounts/verify': ['noOauthBearer'],
    'accounts/update-password': ['oauthBearer'],

    'admins/profile': ['oauthBearer', 'isAdmin'],
    'admins/create': ['oauthBearer', 'isAdmin'],
	'admins/list': ['oauthBearer', 'isAdmin'],
	'admins/dashboard-details': ['oauthBearer', 'isAdmin'],
	'admins/employee-list': ['oauthBearer', 'isAdmin'],
	'admins/user-list': ['oauthBearer', 'isAdmin'],

    'locations/states': ['noOauthBearer'],
    'locations/countries': ['noOauthBearer'],
    'locations/cities/list': ['noOauthBearer'],
    'locations/areas': ['noOauthBearer'],
    'locations/cities/view': ['noOauthBearer'],

    'categories/create': ['oauthBearer', 'isAdmin'],
    'categories/update': ['oauthBearer', 'isAdmin'],
    'categories/change-status': ['oauthBearer', 'isAdmin'],
    'categories/update-photo': ['oauthBearer', 'isAdmin'],
    'categories/delete': ['oauthBearer', 'isAdmin'],
    'categories/list': ['noOauthBearer'],
    'categories/view': ['noOauthBearer'],

    'educations/degrees/create': ['oauthBearer', 'isAdmin'],
    'educations/degrees/update': ['oauthBearer', 'isAdmin'],
    'educations/degrees/change-status': ['oauthBearer', 'isAdmin'],
    'educations/degrees/delete': ['oauthBearer', 'isAdmin'],
    'educations/degrees/view': ['noOauthBearer'],
    'educations/degrees/list': ['noOauthBearer'],
    'educations/fields/create': ['oauthBearer', 'isAdmin'],
    'educations/fields/update': ['oauthBearer', 'isAdmin'],
    'educations/fields/change-status': ['oauthBearer', 'isAdmin'],
    'educations/fields/delete': ['oauthBearer', 'isAdmin'],
    'educations/fields/view': ['noOauthBearer'],
    'educations/fields/list': ['noOauthBearer'],
    'educations/institutions/create': ['oauthBearer', 'isAdmin'],
    'educations/institutions/update': ['oauthBearer', 'isAdmin'],
    'educations/institutions/change-status': ['oauthBearer', 'isAdmin'],
    'educations/institutions/delete': ['oauthBearer', 'isAdmin'],
    'educations/institutions/view': ['noOauthBearer'],
    'educations/institutions/list': ['noOauthBearer'],

    'industries/list': ['noOauthBearer'],
    'industries/create': ['oauthBearer', 'isAdmin'],
    'industries/update': ['oauthBearer', 'isAdmin'],
    'industries/find': ['oauthBearer', 'isAdmin'],
    'industries/findone': ['oauthBearer', 'isAdmin'],
    'industries/delete': ['oauthBearer', 'isAdmin'],

    'skill-tags/list': ['noOauthBearer'],
    'skill-tags/create': ['oauthBearer', 'isAdmin'],
    'skill-tags/creates': ['oauthBearer', 'isAdmin'],
    'skill-tags/update': ['oauthBearer', 'isAdmin'],
    'skill-tags/find': ['oauthBearer', 'isAdmin'],
    'skill-tags/findone': ['oauthBearer', 'isAdmin'],
    'skill-tags/delete': ['oauthBearer', 'isAdmin'],
	
    'program/list': ['noOauthBearer'],
    'program/create': ['noOauthBearer'],

    'subscription-plans/create': ['oauthBearer', 'isAdmin'],
    'subscription-plans/update': ['oauthBearer', 'isAdmin'],
    'subscription-plans/change-status': ['oauthBearer', 'isAdmin'],
    'subscription-plans/delete': ['oauthBearer', 'isAdmin'],
    'subscription-plans/list': ['oauthBearer', 'isUserOrAdmin'],
    'subscription-plans/view': ['oauthBearer', 'isUserOrAdmin'],

    'users/subscriptions/create': ['oauthBearer', 'isAdmin'],
};