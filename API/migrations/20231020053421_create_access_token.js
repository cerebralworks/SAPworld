/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
   return knex.schema.createTableIfNotExists('access_tokens', function(table) {
	table.increments('id').primary();
    table.string('user_id').notNullable();
    table.string('client_id').notNullable();
    table.string('token', 1234);
    table.string('scope', 255); 
	
    table.timestamps(true, true);
  });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('access_tokens');
};
