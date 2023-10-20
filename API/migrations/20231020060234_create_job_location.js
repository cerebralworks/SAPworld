exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('job_location', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('city');
    table.string('state');
    table.string('country');
    table.string('zipcode');
    table.integer('status').defaultTo(1);
    table.integer('jobid').unsigned();
    table.string('state_short');
    table.string('country_short');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('job_location');
};
