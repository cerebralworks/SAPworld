exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('employer_profiles', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('email').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name');
    table.string('phone');
    table.string('photo').defaultTo('default.png');
    table.integer('user').unsigned();
    table.string('company');
    table.string('department');
    table.integer('address_line_1');
    table.integer('address_line_2');
    table.integer('city');
    table.string('state');
    table.string('country_code');
    table.integer('zipcode');
    table.string('description');
    table.json('privacy_protection');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('employer_profiles');
};
