const bcrypt = require('bcrypt');

const seedPassword = 'highlander';
const saltRounds = 10;

exports.seed = function(knex) {
  return knex('coaches').del()
    .then(function() {
      return bcrypt.hash(seedPassword, saltRounds);
    })
    .then(function(hashedPassword) {
      return knex('coaches').insert([
        {email: 'romanh99@gmail.com', password: hashedPassword, first_name: 'Isaac', last_name: 'Brewman'},
        {email: 'hroman@theknowledgehouse.org', password: hashedPassword, first_name: 'Danny', last_name: 'Diaz'}
      ]);
    });
};
