exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('notifications', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('message');
    table.string('name');
    table.string('title');
    table.integer('status').defaultTo(1);
    table.integer('view').defaultTo(1);
    table.integer('account').unsigned();
    table.integer('user_id').unsigned();
    table.integer('job_id').unsigned();
    table.integer('employer').unsigned();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notifications');
};
