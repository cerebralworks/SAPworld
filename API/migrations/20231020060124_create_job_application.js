exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('job_applications', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('comments');
    table.integer('status').defaultTo(1);
    table.boolean('short_listed');
    table.boolean('view').defaultTo(false);
    table.string('status_glossary');
    table.integer('user').unsigned();
    table.integer('job_posting').unsigned();
    table.integer('employer').unsigned();
    table.string('user_approach_id');
    table.integer('user_interest');
    table.string('user_resume');
    table.json('application_status');
    table.json('others');
    table.string('invite_url');
    table.boolean('invite_status').defaultTo(false);
    table.string('reschedule_url');
    table.string('cancel_url');
    table.boolean('canceled').defaultTo(false);
    table.boolean('rescheduled').defaultTo(false);
    table.json('events');
    table.integer('job_location').unsigned();

  
    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('job_applications');
};
