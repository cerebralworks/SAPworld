exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('user_employments', function (table) {
    table.increments('id').primary(); // Primary key, auto-incrementing
    table.string('title');
    table.string('type');
    table.string('description');
    table.integer('salary_type').defaultTo(0);
    table.string('salary_currency');
    table.integer('salary');
    table.string('availability').defaultTo('no');
    table.boolean('remote').defaultTo(false);
    table.integer('experience').defaultTo(1);
    table.integer('sap_experience').defaultTo(1);
    table.bigint('domain');
    table.json('hands_on_experience');
    table.bigint('skills');
    table.text('programming_skills', 'text[]');
    table.text('optional_skills', 'text[]');
    table.text('certification', 'text[]');
    table.integer('work_authorization');
    table.integer('travel_opportunity');
    table.boolean('visa_sponsorship').defaultTo(false);
    table.boolean('willing_to_relocate').defaultTo(false);
    table.integer('end_to_end_implementation').defaultTo(0);
    table.integer('company').unsigned();
    table.integer('status').defaultTo(1);
    table.json('must_match');
    table.json('match_select');
    table.integer('number_of_positions').defaultTo(1);
    table.json('extra_criteria');
    table.json('screening_process');
    table.string('photo');
    table.integer('contract_duration').defaultTo(0);
    table.json('health_wellness');
    table.json('paid_off');
    table.json('financial_benefits');
    table.json('office_perks');
    table.json('language', 'json[]');
    table.string('education');
    table.string('employer_role_type');
    table.boolean('need_reference').defaultTo(false);
    table.bigint('authorized_to_work', 'bigint[]');
    table.bigint('hands_on_skills', 'bigint[]');
    table.json('others');
    table.bigint('programming_id', 'bigint[]');
    table.boolean('entry').defaultTo(false);
    table.boolean('negotiable');
    table.integer('account').unsigned();
    table.string('min');
    table.string('max');
    table.json('job_locations', 'json[]');
    table.integer('remote_option');


    table.timestamps(true, true); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_employments');
};
