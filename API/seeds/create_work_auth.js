/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const Authorization = require('./../master/work_auth.json');

exports.seed = async function(knex) {
  
  //To get total records count
  const rowCount = await knex('workauthorization').count('* as count').first();
 
  if(parseInt(rowCount.count) !== Authorization?.items.length){
	  // Deletes ALL existing entries
	  await knex('workauthorization').del();
	  
	  //To bulk insert the workauthorization record
	  await knex('workauthorization').insert(Authorization.items);
  }
};
