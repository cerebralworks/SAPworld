exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('educational_degrees', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable().unique(); // Required and unique
    table.string('description');
    table.integer('status').defaultTo(1);
    table.string('status_glossary');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('educational_degrees');
};
