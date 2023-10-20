exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('knowledge_tags', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('tag').notNullable(); // Required
    table.integer('status').defaultTo(1);
    table.string('status_glossary');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('knowledge_tags');
};
