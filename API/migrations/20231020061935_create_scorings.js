exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('scorings', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.integer('job_id').unsigned();
    table.integer('user_id').unsigned();
    table.integer('total_experience');
    table.integer('sap_experience');
    table.integer('hands_on_experience');
    table.integer('job_types');
    table.integer('work_auth');
    table.integer('job_location');
    table.integer('knowledge');
    table.integer('end_to_end_implementation');
    table.integer('education');
    table.integer('job_role');
    table.integer('availability');
    table.integer('programming');
    table.integer('other_skills');
    table.integer('certification');
    table.integer('domain');
    table.integer('remote');
    table.integer('travel');
    table.integer('language');
    table.integer('score');
    table.boolean('mail').defaultTo(false);
    table.integer('location_id').unsigned();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('scorings');
};
