/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const Languages = require('./../master/language.json');

exports.seed = async function(knex) {
  
  //To get total records count
  const rowCount = await knex('language').count('* as count').first();
 
  if(parseInt(rowCount.count) !== Languages?.items.length){
	  // Deletes ALL existing entries
	  await knex('language').del();
	  
	  //To bulk insert the language record
	  await knex('language').insert(Languages.items);
  }
};
