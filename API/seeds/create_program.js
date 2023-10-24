/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const Program = require('./../master/program.json');

exports.seed = async function(knex) {
  
  //To get total records count
  const rowCount = await knex('program').count('* as count').first();
 
  if(parseInt(rowCount.count) !== Program?.items.length){
	  // Deletes ALL existing entries
	  await knex('program').del();
	  
	  //To bulk insert the program record
	  await knex('program').insert(Program.items);
  }
};
