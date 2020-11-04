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
      report:{
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
      payment_pending: 6
  },
  access_role: {
    user: 0,
    employer: 1,
    admin: 2
  },
  job_types: {
    full_time: 0,
    part_time: 1,
    freelance: 2,
    internship: 3,
    temporary: 4,
    remote: 5,
    contract: 6,
    day_job: 7
  },
  user_job_interest: {
    not_interested: 0 ,
    interested: 1
  }
};
