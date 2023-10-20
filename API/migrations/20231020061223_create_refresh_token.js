exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('refresh_tokens', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.integer('user_id').unsigned().notNullable();
    table.string('client_id').notNullable();
    table.string('token');

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('refresh_tokens');
};
