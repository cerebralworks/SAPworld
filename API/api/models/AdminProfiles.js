/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * AdminProfiles.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'she_admin_profiles',
    tableAlias: 'admin',
    attributes: {
        email:{type: 'string', required: true, isEmail: true},
        first_name:{type: 'string', required: true},
        last_name:{type: 'string', allowNull:true},
        phone:{type: 'ref'},
        photo:{type: 'ref', defaultsTo: 'default.png'},
        account: {
          columnName: 'user',
          model: 'users'
        }
    },
    afterCreate: async function(profile, callback) {
        if(profile.id){
            await Users.update({id:profile.account},{admin_profile:profile.id}, async function(err, user){
                return callback();
            });
        }else{
            return callback();
        }
    }
};
