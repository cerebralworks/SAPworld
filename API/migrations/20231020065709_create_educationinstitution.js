exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('educational_institutions', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable().unique(); // Required and unique
    table.string('description');
    table.string('address').notNullable(); // Required
    table.integer('status').defaultTo(1);
    table.string('status_glossary');


    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('educational_institutions');
};
