"use strict";

const MAX_FILTER_LENGTH = 100;

function parseRequestedSeason(value) {
	if (value === undefined) {
		return { value: undefined };
	}

	if (Array.isArray(value)) {
		return { error: 'Sorry your season is invalid please try again' };
	}

	if (typeof value !== 'string') {
		return { error: 'Sorry your season is invalid please try again' };
	}

	const trimmedValue = value.trim();
	if (trimmedValue === '') {
		return { value: undefined };
	}

	const season = Number(trimmedValue);
	return Number.isInteger(season)
		? { value: season }
		: { error: 'Sorry your season is invalid please try again' };
}

function parseOptionalFilterText(value, label) {
	if (value === undefined) {
		return { value: null };
	}

	if (Array.isArray(value) || typeof value !== 'string') {
		return { error: `Sorry your ${label} is invalid please try again` };
	}

	const trimmedValue = value.trim();
	if (trimmedValue === '') {
		return { value: null };
	}

	if (trimmedValue.length > MAX_FILTER_LENGTH) {
		return { error: `Sorry your ${label} is invalid please try again` };
	}

	return { value: trimmedValue };
}

function matchesCaseInsensitiveFilter(value, filterText) {
	if (filterText === null || filterText === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	return value.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
}

function matchesOptionalPositionFilter(player, positionFilter) {
	if (positionFilter === null || positionFilter === undefined) {
		return true;
	}

	return matchesCaseInsensitiveFilter(player && player.position, positionFilter);
}

function buildPlayerSearchText(player) {
	if (!player) {
		return '';
	}

	return `${player.first_name || ''} ${player.last_name || ''} ${player.email || ''}`;
}

module.exports = {
	parseRequestedSeason,
	parseOptionalFilterText,
	matchesCaseInsensitiveFilter,
	matchesOptionalPositionFilter,
	buildPlayerSearchText
};
