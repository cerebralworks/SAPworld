exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('industries', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name').notNullable().unique();
    table.string('description');
    table.string('photo').defaultTo('default.png');
    table.integer('status').defaultTo(1);

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('industries');
};
