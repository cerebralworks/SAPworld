exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('score_master', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.float('required').defaultTo(1);
    table.float('desired').defaultTo(0.5);
    table.float('optional').defaultTo(0.25);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('score_master');
};
