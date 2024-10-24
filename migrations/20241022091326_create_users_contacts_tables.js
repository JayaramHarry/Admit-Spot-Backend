exports.up = function (knex) {
    return knex.schema
      .createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password_hash').notNullable();
        table.boolean('email_verified').defaultTo(false);
        table.timestamps(true, true);
      })
      .createTable('contacts', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('users.id');
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('phone_number');
        table.string('address');
        table.string('timezone');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable(); // For soft delete
      });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('contacts').dropTable('users');
  };
  