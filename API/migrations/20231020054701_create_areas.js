exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('areas', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable();
    table.integer('zip_code').nullable();
    table.string('aliases').nullable();
    table.integer('status').defaultTo(1);
    table.integer('city_id').unsigned();
    table.integer('state_id').unsigned();
    table.string('country').notNullable();
    
    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('areas');
};
