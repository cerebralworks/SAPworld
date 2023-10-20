exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('countries', function (table) {
    table.string('id').primary(); // Primary key, required
    table.string('name').notNullable();
    table.string('aliases');
    table.string('cca2');
    table.string('ccn3');
    table.string('cca3');
    table.string('cioa');
    table.string('currency');
    table.string('calling_code');
    table.string('capital');
    table.string('alt_spellings');
    table.string('region');
    table.string('sub_region');
    table.string('languages');
    table.string('translations');
    table.string('lat_lng');
    table.string('demonym');
    table.string('landlocked');
    table.string('borders');
    table.string('area');
    table.integer('status').defaultTo(1);


    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('countries');
};
