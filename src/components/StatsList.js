import React from 'react';

import 'bulma/css/bulma.css';
import '../css/style.css';

export default function StatsList(props) {
	const stats = props.stats;
	// const mergeTeamStats = [];

	// the fact that I am setting state for stats here seems dirty.
	let playerStats = stats.map(player => {
		return <tr>
              // eslint-disable-next-line indent
			<th>{player.position}</th>
			<td>{player.first_name} {player.last_name}</td>
			<td>{player.stats["Hits"]}</td>
			<td>{player.stats["At Bats"]}</td>
			<td>{player.stats["Home Runs"]}</td>
			<td>{player.stats["Earned Runs"]}</td>
			<td>{player.stats["Innings Pitched"]}</td>
			<td>{player.stats["Strikeouts"]}</td>
		</tr>
	})
	// mergeTeamStats.push(newPlayerStat);
	// })
	// console.log(mergeTeamStats)

	let nullStatsWarning;
	// if(props.stats.length <= 0){
	//   nullStatsWarning = <div className="notification has-text-centered stats-module-dashboard-message">
	//     You dont have Stats.
	//   </div>
	// }
	return (
		<div className='tile is-parent'>
			<div className='tile is-child box header'>
				<nav className="level dashboard-title">
					<div className="level-left">
						<div className="level-item">
							<span className="icon icon-dasboard-placement">
								<i className="fa fa-list-ol" aria-hidden="true"></i>
							</span>
							<p>
                Stats
							</p>
						</div>
					</div>
					<div className="level-right">
						<span className="level-item">
							<a className="button is-outlined is-primary" href="add-stats.html">
                Add New Stats
							</a>
						</span>
					</div>
				</nav>

				<section>
					{nullStatsWarning}

					<table className="table">
						<thead className="stat-header-details-container">
							<tr>
								<th>
									<abbr title='Position'>Pos</abbr>
								</th>
								<th>
									<abbr title='Name'>Name</abbr>
								</th>
								<th>
									<abbr title='Hits'>Hits</abbr>
								</th>
								<th>
									<abbr title='At Bats'>AB</abbr>
								</th>
								<th>
									<abbr title='Home Runs'>HR</abbr>
								</th>
								<th>
									<abbr title='Earned Runs'>ER</abbr>
								</th>
								<th>
									<abbr title='Inning Pitched'>IP</abbr>
								</th>
								<th>
									<abbr title='Strike Outs'>Strike Outs</abbr>
								</th>
							</tr>
						</thead>
						<tbody className="stat-details-container">
							{ playerStats }
						</tbody>
					</table>
				</section>
			</div>
		</div>
	)
}
