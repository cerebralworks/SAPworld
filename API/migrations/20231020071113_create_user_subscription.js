exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('user_subscriptions', function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('subscription_plan_id').unsigned().notNullable();
    table.string('stripe_subscription_id').notNullable();
    table.timestamp('expire_date').notNullable();

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_subscriptions');
};
