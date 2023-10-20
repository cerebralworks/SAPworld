exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('user_profiles', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.string('phone');
    table.string('bio');
    table.string('photo');
    table.string('country');
    table.string('state');
    table.string('city');
    table.string('address_line');
    table.string('zipcode');
    table.json('social_media_link');
    table.json('education_qualification');
    table.integer('experience');
    table.integer('sap_experience');
    table.string('current_employer');
    table.string('current_employer_role');
    table.json('domains_worked');
    table.json('clients_worked');
    table.json('hands_on_experience');
    table.json('skills');
    table.json('programming_skills');
    table.json('other_skills');
    table.json('certification');
    table.json('job_type');
    table.string('job_role');
    table.integer('preferred_location');
    table.integer('availability');
    table.integer('travel');
    table.integer('work_authorization');
    table.boolean('willing_to_relocate');
    table.boolean('remote_only');
    table.integer('end_to_end_implementation');
    table.string('latlng');
    table.string('latlng_text');
    table.json('doc_resume');
    table.integer('status');
    table.string('status_glossary');
    table.json('privacy_protection');
    table.integer('account').unsigned();
    table.string('nationality');
    table.json('previous_employee');
    table.json('authorized_country');
    table.json('language_known');
    table.json('visa_type');
    table.json('reference');
    table.string('employer_role_type');
    table.json('knowledge_on');
    table.json('other_cities');
    table.json('other_countries');
    table.boolean('visa_sponsored');
    table.json('preferred_locations');
    table.json('doc_cover');
    table.json('hands_on_skills');
    table.json('education_degree');
    table.json('language_id');
    table.json('programming_id');
    table.boolean('entry').defaultTo(false);
    table.json('calender_urls');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_profiles');
};
