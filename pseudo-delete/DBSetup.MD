#Data Structure

- seed coaches json object
{
  id: number,
  first_name: string,
  last_name: string
}

- table representation of coaches json object
coaches <=== name of table
id    first_name    last_name     email
1     Isaac         Brewman
2     Danny         Diaz

===============================
- seed players json object
{
  id: number,
  first_name: string,
  last_name: string,
  email: string
}

- table representation of players json object
players <=== name of table
id    first_name    last_name     email               
1     Heriberto     Roman         joe@gmail.com                       
2     Randy         Brown         joe@gmail.com        
3     Big           Mac           joe@gmail.com       
4     Ricardo       Roman         joe@gmail.com    

===============================
- seed teams json object
{
  id: number,
  name: string,
  location: string,
  coach_id: number
}

- table representation of teams json object
teams  <=== name of table                                         
id   name         location        coach_id                        
1    Highlander   Bronx, NY       1           
2    Gem Stars    Queens, NY      2                          
3    Warriors     Brooklyn, NY    1                                            
4    Tigers       Bronx, NY       2                               

===============================
- seed team_associations json object
{
  team_id: number,
  player_id: number
}

- table representation of team_associations json object
players_teams <=== name of table
team_id   player_id
1         4         
2         3
3         2
4         4
3         3
1         2

===============================
- seed stat_catalogs json object
{
  id: number,
  description: string
}

- table representation of stats_catalog json object
stat_catalogs <=== name of table
id   description
1    hits
2    atBats
3    homeRuns
4    earnedRuns
5    inningsPitched
6    strikeOuts

===============================                                                                        
- seed stats json object
{
  player_id: number,
  stats_catalog_id: number,
  how_many: number,
  game_date: timestamp
}

- table representation of stats json object
players_stat_catalogs <=== name of table
player_id   stat_catalog_id    how_many    game_date
  1         2                   5           16-06-2017 12:00:00
  1         3                   10          27-02-2017
  1         3                   8           7-03-2017
  1         5                   1           7-03-2017



NOTE:
// this is not a table but rather the computation. i.e sits in route and presented in the front end
stat_catalogs //
  battingAverage
    | hits = SELECT sum(how_many) FROM stats WHERE user_id =1 AND stats_catalog_id=1;
    | atBats = SELECT sum(how_many) FROM stats WHERE user_id =1 AND stats_catalog_id=2;
    | return battingAverage = hits/atBats;
  homeRuns
  earnedRunAverage
  strikeOuts


Query examples

#Get all the players that belongs to the team 1
SELECT * FROM Players_Teams WHERE team_id = 2
[(team_id: 2, player_id: 1),(team_id: 2, player_id: 2)]

#Get all the teams that belongs to the coach
SELECT * FROM Teams WHERE coach_id = coach.id



To-do first
Focus on creating players, coaches, and teams endpoint
and how can I get the relationship between each one.

Register as coach and player and see the relationship between them.
