exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('users', function (table) {
    table.increments('id').primary();
    table.string('username');
    table.string('password'); 
    table.integer('status').defaultTo(1);
    table.string('status_glossary');
    table.boolean('verified').defaultTo(false);
     table.specificType('types', 'integer[]');
    table.json('tokens');
    table.timestamp('last_active').defaultTo(knex.fn.now());
    table.string('last_checkin_via').defaultTo('web');
    table.integer('user_profile').unsigned();
    table.integer('admin_profile').unsigned();
    table.integer('employer_profile').unsigned();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
