exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('clients', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable().unique();
    table.string('redirect_uri').notNullable();
    table.string('client_id');
    table.string('client_secret');
    table.boolean('trusted').defaultTo(false);

    
    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('clients');
};
