exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('invite_status', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name');
    table.string('cancel_url');
    table.string('email');
    table.string('event');
    table.string('reschedule_url');
    table.string('rescheduled');
    table.string('status');
    table.text('questions_and_answers', 'text[]');
    table.string('uri');
    table.boolean('canceled').defaultTo(false);
    table.string('canceled_by');
    table.string('reason');
    table.integer('job_application').unsigned();
    table.json('events');


    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('invite_status');
};
