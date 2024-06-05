exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('firstName').nullable();
    table.string('lastName').nullable();
    table.date('dob');
    table.string('address');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};