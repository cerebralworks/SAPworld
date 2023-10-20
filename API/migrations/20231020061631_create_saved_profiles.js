exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('saved_profiles', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.integer('user_id').notNullable();
    table.integer('employee_id').notNullable();
    table.string('description');
    table.integer('account').unsigned();

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('saved_profiles');
};
