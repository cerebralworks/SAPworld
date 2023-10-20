exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('skill_tags', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('tag').notNullable();
    table.integer('status').defaultTo(1);
    table.string('status_glossary');
    table.string('long_tag').notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('skill_tags');
};
