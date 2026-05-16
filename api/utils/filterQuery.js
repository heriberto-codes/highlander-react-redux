'use strict';

const MAX_FILTER_LENGTH = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;

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

function parsePositiveIntegerQueryParam(value, label, defaultValue) {
	if (value === undefined) {
		return { value: defaultValue };
	}

	if (Array.isArray(value) || typeof value !== 'string') {
		return { error: `Sorry your ${label} is invalid please try again` };
	}

	const trimmedValue = value.trim();
	if (trimmedValue === '') {
		return { value: defaultValue };
	}

	const parsedValue = Number(trimmedValue);
	return Number.isInteger(parsedValue) && parsedValue > 0
		? { value: parsedValue }
		: { error: `Sorry your ${label} is invalid please try again` };
}

function parsePaginationQuery(query, options) {
	const paginationOptions = options || {};
	const pageKey = paginationOptions.pageKey || 'page';
	const limitKey = paginationOptions.limitKey || 'limit';
	const pageLabel = paginationOptions.pageLabel || pageKey;
	const limitLabel = paginationOptions.limitLabel || limitKey;
	const defaultLimit = paginationOptions.defaultLimit || DEFAULT_PAGE_LIMIT;
	const maxLimit = paginationOptions.maxLimit || MAX_PAGE_LIMIT;

	const parsedPage = parsePositiveIntegerQueryParam(
		query && query[pageKey],
		pageLabel,
		DEFAULT_PAGE
	);
	if (parsedPage.error) {
		return parsedPage;
	}

	const parsedLimit = parsePositiveIntegerQueryParam(
		query && query[limitKey],
		limitLabel,
		defaultLimit
	);
	if (parsedLimit.error) {
		return parsedLimit;
	}

	return {
		value: {
			page: parsedPage.value,
			limit: Math.min(parsedLimit.value, maxLimit)
		}
	};
}

function paginateItems(items, pagination) {
	const safeItems = Array.isArray(items) ? items : [];
	const page = pagination && Number.isInteger(pagination.page) && pagination.page > 0
		? pagination.page
		: DEFAULT_PAGE;
	const limit = pagination && Number.isInteger(pagination.limit) && pagination.limit > 0
		? Math.min(pagination.limit, MAX_PAGE_LIMIT)
		: DEFAULT_PAGE_LIMIT;
	const totalItems = safeItems.length;
	const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
	const startIndex = (page - 1) * limit;
	const paginatedItems = safeItems.slice(startIndex, startIndex + limit);

	return {
		items: paginatedItems,
		pagination: {
			page,
			limit,
			totalItems,
			totalPages,
			hasPreviousPage: page > 1,
			hasNextPage: totalPages > 0 && page < totalPages
		}
	};
}

module.exports = {
	parseRequestedSeason,
	parseOptionalFilterText,
	matchesCaseInsensitiveFilter,
	matchesOptionalPositionFilter,
	buildPlayerSearchText,
	parsePaginationQuery,
	paginateItems
};
