"use strict";

function toNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function divide(numerator, denominator) {
        const left = toNumber(numerator);
        const right = toNumber(denominator);

        if (left === null || right === null || right <= 0) {
                return null;
        }

        return left / right;
}

function getStatSeason(stat) {
        if (!stat || !stat._pivot_game_date) {
                return null;
        }

        const date = new Date(stat._pivot_game_date);

        if (Number.isNaN(date.getTime())) {
                return null;
        }

        return date.getUTCFullYear();
}

function filterStatsBySeason(stats, season) {
        if (season === null || season === undefined) {
                return stats || [];
        }

        return (stats || []).filter(function(stat) {
                return getStatSeason(stat) === season;
        });
}

function collectRawStats(stats) {
        return (stats || []).reduce(function(acc, stat) {
                const description = stat.description;
                const howMany = toNumber(stat._pivot_how_many);

                if (description && howMany !== null) {
                        acc[description] = (acc[description] || 0) + howMany;
                }

                return acc;
        }, {});
}

function buildDerivedStats(player, season) {
        const rawStats = collectRawStats(filterStatsBySeason(player.stats, season));
        const hits = rawStats['Hits'];
        const atBats = rawStats['At Bats'];
        const homeRuns = rawStats['Home Runs'];
        const earnedRuns = rawStats['Earned Runs'];
        const inningsPitched = rawStats['Innings Pitched'];
        const strikeouts = rawStats['Strikeouts'];

        return {
                battingAverage: divide(hits, atBats),
                homeRunRate: divide(homeRuns, atBats),
                era: inningsPitched && inningsPitched > 0 ? (earnedRuns !== null && earnedRuns !== undefined ? (earnedRuns * 9) / inningsPitched : null) : null,
                strikeoutsPerInning: divide(strikeouts, inningsPitched)
        };
}

function addDerivedStatsToPlayers(players, season) {
        return (players || []).map(function(player) {
                const filteredStats = filterStatsBySeason(player.stats, season);

                return Object.assign({}, player, {
                        stats: filteredStats,
                        derivedStats: buildDerivedStats(player, season)
                });
        });
}

function addDerivedStatsToCoachPayload(coach) {
        if (!coach) {
                return coach;
        }

        const coachJson = coach.toJSON();

        coachJson.teams = (coachJson.teams || []).map(function(team) {
                return Object.assign({}, team, {
                        players: addDerivedStatsToPlayers(team.players)
                });
        });

        return coachJson;
}

function addDerivedStatsToTeamPayload(team) {
        if (!team) {
                return team;
        }

        const teamJson = team.toJSON();
        teamJson.players = addDerivedStatsToPlayers(teamJson.players);
        return teamJson;
}

module.exports = {
        addDerivedStatsToCoachPayload,
        addDerivedStatsToTeamPayload,
        addDerivedStatsToPlayers,
        buildDerivedStats,
        collectRawStats,
        filterStatsBySeason
};
