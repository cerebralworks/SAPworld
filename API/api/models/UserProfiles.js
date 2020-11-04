/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * UserProfiles.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_user_profiles',
    tableAlias: 'user_profile',
    attributes: {
        user_handle: {type: 'string'},
        email: {type: 'string', allowNull: true},
        first_name: {type: 'string'},
        last_name: {type: 'string', allowNull: true},
        bio: {type: 'string', allowNull: true},
        about_info: {type: 'string', allowNull: true},
        date_of_birth: {type: 'string', allowNull: true},
        city: {type: 'number', allowNull: true},
        google_id: {type: 'string', allowNull: true},
        google_data: {type: 'ref'},
        facebook_id: {type: 'string', allowNull: true},
        facebook_data: {type: 'ref'},
        linkedin_id: {type: 'string', allowNull: true},
        linkedin_data: {type: 'ref'},
        phone: {type: 'ref'},
        country_code: {type: 'ref'},
        photo: {type: 'ref', defaultsTo: 'default.png'},
        certification: {type: 'string', allowNull: true},
        doc_resume: {type: 'ref'},
        video_resume: {type: 'ref'},
        skill_tags: {type: 'ref'},
        zip_code: {type: 'number', allowNull: true},
        location: {type: 'ref'},
        location_text: {type: 'string', allowNull: true},
        location_geom: {type: 'ref'},
        location_miles: {type: 'number', allowNull: true},
        preferred_job_type: {type: 'number', allowNull: true},
        work_status: {type: 'string', allowNull: true},
        work_experience: {type: 'number', allowNull: true},
        expected_salary: {type: 'number', allowNull: true},
        social_profiles: {type: 'ref'},
        account: {
          columnName: 'user',
          model: 'users'
        }
    },
    afterCreate: async function(profile, callback) {
        if(profile.id){
            await Users.update({id:profile.account},{user_profile:profile.id}, async function(err, user){
                return callback();
            });
        }else{
            return callback();
        }
    }
};
