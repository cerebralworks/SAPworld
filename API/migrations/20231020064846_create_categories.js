exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('categories', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable().unique();
    table.string('description');
    table.string('photo').defaultTo('default.png');
    table.integer('type').defaultTo(0);
    table.integer('status').defaultTo(1);
    table.string('status_glossary');
    table.integer('parent').nullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('categories');
};
