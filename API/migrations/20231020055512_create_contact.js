exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('contact', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name');
    table.string('email');
    table.string('subject');
    table.string('message');
	
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('contact');
};
