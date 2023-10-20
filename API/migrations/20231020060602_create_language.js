exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('language', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable();
    table.string('iso');

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('language');
};
