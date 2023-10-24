/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const Industry = require('./../master/industry.json');

exports.seed = async function(knex) {
  
  //To get total records count
  const rowCount = await knex('industries').count('* as count').first();
 
  if(parseInt(rowCount.count) !== Industry?.items.length){
	  // Deletes ALL existing entries
	  await knex('industries').del();
	  
	  //To bulk insert the Industry record
	  await knex('industries').insert(Industry.items);
  }
};
