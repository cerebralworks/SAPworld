exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('subscription_plans', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.integer('amount').defaultsTo(0); // Decimal column for amount
    table.string('currency').notNullable(); // Required
    table.string('interval').notNullable(); // Required
    table.integer('interval_count').notNullable(); // Required
    table.integer('interval_validity').notNullable(); // Required
    table.string('name').notNullable().unique(); // Required and unique
    table.string('stripe_plan_id').notNullable().unique(); // Required and unique
    table.integer('status').defaultsTo(1); // Default value of 1
    table.string('status_glossary'); // Optional status_glossary

    table.timestamps(true, true); // Adds `created_at` and `updated_at` columns
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('subscription_plans');
};
