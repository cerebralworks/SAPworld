/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const Country = require('./../master/country.json');

exports.seed = async function(knex) {
  
  //To get total records count
  const rowCount = await knex('country').count('* as count').first();
 
  if(parseInt(rowCount.count) !== Country?.items.length){
	  // Deletes ALL existing entries
	  await knex('country').del();
	  
	  //To bulk insert the country record
	  await knex('country').insert(Country.items);
  }
};
