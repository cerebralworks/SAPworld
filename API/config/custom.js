/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

//Custom configurations for the application
module.exports.custom = {

    /***************************************************************************
     *                                                                          *
     * Any other custom config this Sails app should use during development.    *
     *                                                                          *
     ***************************************************************************/

    site: {
        health: {
            status: 1,
            message: 'This is a job search portal.'
        },
        report: {
            threshold: 3,
            mail: 'flagged@shejobs.com'
        },
        timezone: 'Asia/Kolkata'
    },
    frontend: {
        popular_interval: '3 days'
    },
    status_codes: {
        inactive: 0,
        active: 1,
        pending: 2,
        deleted: 3,
        reported: 4,
        accepted: 5,
        payment_pending: 6,
        hide_profile: 7,
		paused: 98,
		closed: 99
    },
    status_codes_application: {
        open: 1,
        selected: 2,
        scheduled: 3,
        rejected: 4,
        hold: 5,
        not_available: 6,
        pending: 7,
		applied: 8,
		closed: 99
    },
    access_role: {
        user: 0,
        employer: 1,
        admin: 2
    },
    job_types: {
        full_time: 1000,
        part_time: 1001,
        contract: 1002,
        freelance: 1003,
        internship: 1004,
        temporary: 1005,
        remote: 1006,
        day_job: 1007
    },
    user_job_interest: {
        not_interested: 0,
        interested: 1
    },
	educationItems : [
		{  id:0, text: 'high school' },
		{  id:1, text: 'diploma' },
		{  id:2, text: 'bachelors' },
		{  id:3, text: 'masters' },
		{  id:4, text: 'doctorate' }
	],
	weightage: {
		total_experience:1,
		sap_experience:1,
		hands_on_experience: 1,
		job_types: 1,
		work_auth: 1,
		job_location: 1,
		knowledge: 1,
		end_to_end_implemention: 0.5,
		education: 0.25,
		job_role: 1,
		availability: 1,
		programming: 1,
		other_skills: 1,
		certification : 1,
		domain: 1,
		remote: 0.5,
		travel: 0.5,
		language: 0.25
	},
	weightage_percentage: {		
		Knowledge:100,
		hands_on_experience:100		
	}
	
};