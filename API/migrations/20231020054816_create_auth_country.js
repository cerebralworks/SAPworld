exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('authorized_country', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('country').notNullable();

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('authorized_country');
};
