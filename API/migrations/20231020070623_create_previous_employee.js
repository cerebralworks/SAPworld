exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('previous_employees', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('company').notNullable(); // Required

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('previous_employees');
};
