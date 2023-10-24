// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
 var env = require('node-env-file');
env(__dirname + '/../.env');
module.exports = {

   development: {
    client: 'postgresql',
    connection: process.env.db_connection_string,
    migrations: {
      directory: './migrations'
    },
	seeds: {
        directory: './seeds'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
     client: 'postgresql',
    connection: process.env.db_connection_string,
    migrations: {
      directory: './migrations'
    },
	seeds: {
        directory: './seeds'
    }
  }

};
