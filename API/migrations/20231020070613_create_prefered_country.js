exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('prefered_country', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('country').notNullable(); // Required

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('prefered_country');
};
