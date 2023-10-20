exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('languages', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('language').notNullable(); // Required
    table.boolean('read').defaultTo(false); // Defaults to false
    table.boolean('write').defaultTo(false); // Defaults to false
    table.boolean('speak').defaultTo(false); // Defaults to false

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('languages');
};
