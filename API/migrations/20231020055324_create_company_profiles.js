exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('company_profile', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('name');
    table.string('email');
    table.integer('status').defaultTo(1);
    table.string('status_glossary');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('country');
    table.string('zipcode');
    table.string('latlng');
    table.string('latlng_text');
    table.string('description');
    table.string('website');
	table.specificType('social_media_link', 'json[]');
    table.varchar('contact', 255, 'array'); 
    table.integer('user_id').unsigned();
    table.string('invite_url');
    table.boolean('invite_status').defaultTo(false);
    table.json('invite_urls'); 
    table.boolean('calender_status').defaultTo(false);
    table.json('calender_urls'); 

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('company_profile');
};
