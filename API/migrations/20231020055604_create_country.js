exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('country', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('iso').notNullable();
    table.string('name');
    table.string('nicename');
    table.string('iso3');
    table.integer('numcode');
    table.integer('phonecode');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('country');
};
