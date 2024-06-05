exports.up = function(knex) {
  return knex.schema.createTable('ratings', table => {
    table.increments('id').primary();
    table.integer('volcano_id').unsigned().references('id').inTable('data').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ratings');
};