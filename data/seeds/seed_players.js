exports.seed = function(knex, Promise) {
  return knex('players').del()
  .then(function () {
    return knex('players').insert([
      {email: 'romanh99@gmail.com', password: 'highlander', first_name: 'Heriberto', last_name: 'Roman', position: '1st base'},
      {email: 'brown@gmail.com', password: 'highlander', first_name: 'Randy', last_name: 'Brown', position: '2nd base'},
      {email: 'bigmac@gmail.com', password: 'highlander', first_name: 'Big', last_name: 'Mac', position: '3rd base'},
      {email: 'ricky@gmail.com', password: 'highlander', first_name: 'Ricardo', last_name: 'Roman', position: 'catcher'}
    ])
  })
}
 
