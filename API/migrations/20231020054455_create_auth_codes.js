exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('auth_codes', function (table) {
    table.increments('id').primary();
    table.string('code');
    table.string('user_id').notNullable();
    table.string('client_id').notNullable();
    table.string('redirect_uri').notNullable();
   
    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('auth_codes');
};
