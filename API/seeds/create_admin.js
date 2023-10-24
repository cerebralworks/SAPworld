/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var UtilsService= require('../api/services/UtilsService.js');

exports.seed = async function(knex) {
  
  try{
	  
	  const isExist = await knex('users').select('*').where('username','admin@sapworld.com');
	  
	   if(isExist?.length===0){
		  var data={};
		  data.username='admin@sapworld.com';
		  data.password=await bcrypt.hash('Admin@1234', SALT_WORK_FACTOR);
		  data.status=1;
		  data.types=[2];
		  data.verified=true;
		  data.tokens = { reset: UtilsService.uid(20), verification: UtilsService.uid(20) };
		  data.last_active= new Date();
		  data.last_checkin_via= 'web';
		  
		  //Insert record in user table
		  const [user]=await knex('users').returning('id').insert(data);
		  
		  var adminData={};
		  adminData.first_name='SAP';
		  adminData.last_name='Admin';
		  adminData.email=data.username;
		  adminData.user=user.id;
		  
		  //Insert record in admin table
		  const [admin]=await knex('admin_profiles').returning('id').insert(adminData);
		   
		  //update id in user record
		  await knex('users').where({id:user.id}).update({admin_profile:admin.id});   
		}
  }catch(e){
	  console.log(e);
  }
};
