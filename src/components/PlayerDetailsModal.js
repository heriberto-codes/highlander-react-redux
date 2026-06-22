import React, { useEffect, useState } from 'react';
import axios from 'axios';

import StatusMessage from './ui/StatusMessage';

function getStatValue(stat) {
	if (stat._pivot_how_many !== undefined) {
		return stat._pivot_how_many;
	}

	if (stat.how_many !== undefined) {
		return stat.how_many;
	}

	return 0;
}

export default function PlayerDetailsModal({ playerId, onClose }) {
	const [player, setPlayer] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isCurrent = true;

		axios.get(`/api/v1/players/${playerId}/stats`, { withCredentials: true })
			.then(response => {
				if (isCurrent) {
					setPlayer(response.data);
				}
			})
			.catch(requestError => {
				if (isCurrent) {
					setError(requestError);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [playerId]);

	const stats = player && player.stats ? player.stats : [];

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Player Details</p>
					<button className="delete" type="button" aria-label="close" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					{error ? (
						<StatusMessage message="Unable to load player details. Please try again." variant="warning" />
					) : null}
					{!player && !error ? <StatusMessage message="Loading player details..." /> : null}
					{player ? (
						<div>
							<h2 className="title is-4">{player.first_name} {player.last_name}</h2>
							<p><strong>Email:</strong> {player.email}</p>
							<p><strong>Position:</strong> {player.position}</p>
							<hr />
							<h3 className="title is-5">Stats</h3>
							{stats.length > 0 ? (
								<table className="table is-fullwidth">
									<thead>
										<tr>
											<th>Stat</th>
											<th>Total</th>
										</tr>
									</thead>
									<tbody>
										{stats.map((stat, index) => (
											<tr key={stat.id || `${stat.description}-${index}`}>
												<td>{stat.description || `Stat ${stat.id || index + 1}`}</td>
												<td>{getStatValue(stat)}</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<StatusMessage message="No stats have been recorded for this player." />
							)}
						</div>
					) : null}
				</section>
				<footer className="modal-card-foot">
					<button className="button" type="button" onClick={onClose}>Close</button>
				</footer>
			</div>
		</div>
	);
}
