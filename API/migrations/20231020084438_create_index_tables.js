/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
	
	//To create index for tables
	 await knex.schema.table('users', function (table) {
	   table.index('user_profile');
	   table.index('admin_profile');
	   table.index('employer_profile');
	 }).then();
	

	 await knex.schema.table('user_profiles', function (table) {
	   table.index('account');
	}).then();
	
	await knex.schema.table('admin_profiles', function (table) {
	   table.index('user');
	}).then();
	
	await knex.schema.table('employer_profiles', function (table) {
	   table.index('user');
	}).then();
	
	await knex.schema.table('company_profile', function (table) {
	   table.index('user_id');
	}).then();
	
	await knex.schema.table('job_applications', function (table) {
	   table.index('user');
	   table.index('job_posting');
	   table.index('employer');
	}).then();
	
	await knex.schema.table('saved_profiles', function (table) {
	   table.index('user_id');
	   table.index('employee_id');
	   table.index('account');
	}).then();
	
	await knex.schema.table('job_location', function (table) {
	   table.index('jobid');
	}).then();
	
	await knex.schema.table('user_employments', function (table) {
	   table.index('account');
	}).then();
	
	await knex.schema.table('scorings', function (table) {
	   table.index('job_id');
	   table.index('user_id');
	}).then();
	
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
