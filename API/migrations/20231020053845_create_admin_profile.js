exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('admin_profiles', function (table) {
    table.increments('id').primary(); 
    table.string('email').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name');
    table.string('phone');
    table.string('photo').defaultTo('default.png');
    table.integer('user').unsigned();

    table.string('address');
    table.string('name');
    table.string('city');
    table.string('state');
    table.string('country');
    table.integer('zipcode');
    table.string('latlng');
    table.string('latlng_text');
    table.string('description');
    table.string('website');
	table.specificType('social_media_link', 'json[]');
    table.varchar('contact', 255, 'array'); 

    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('admin_profiles');
};
