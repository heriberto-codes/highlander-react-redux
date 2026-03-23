export function appendQueryParam(searchParams, key, value) {
	if (value === undefined || value === null) {
		return;
	}

	if (typeof value === 'string') {
		const trimmedValue = value.trim();
		if (trimmedValue === '') {
			return;
		}
		searchParams.set(key, trimmedValue);
		return;
	}

	searchParams.set(key, value);
}

export function buildRequestUrl(baseUrl, params) {
	const searchParams = new URLSearchParams();

	Object.keys(params).forEach(key => {
		appendQueryParam(searchParams, key, params[key]);
	});

	const queryString = searchParams.toString();
	return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
