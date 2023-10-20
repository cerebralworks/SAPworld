exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('user_educations', function (table) {
    table.increments('id').primary();
    table.integer('start_year');
    table.integer('end_year');
    table.string('grade').nullable();
    table.string('max_grade').nullable();
    table.string('comments').nullable();

    table.integer('user_id').unsigned();
    table.integer('institution_id').unsigned();
    table.integer('degree_id').unsigned();
    table.integer('field_id').unsigned();

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_educations');
};
