/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const Skills = require('./../master/skills.json');

exports.seed = async function(knex) {
  
  //To get total records count
  const rowCount = await knex('skill_tags').count('* as count').first();
 
  if(parseInt(rowCount.count) !== Skills?.items.length){
	  // Deletes ALL existing entries
	  await knex('skill_tags').del();
	  
	  //To bulk insert the Skills record
	  await knex('skill_tags').insert(Skills.items);
  }
};
