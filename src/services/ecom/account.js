/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	account: () => new URL('/account', routes.base()),
};

/**
 * Get the account information of the authenticated user
 * @returns Account info object if the request was successful
 * @throws Will throw if network response is not OK
 */
export async function getAccountInfo() {
	// Send get request to API endpoint
	const response = await fetch(routes.account(), {
		credentials: 'include',
	});

	// Throw if response was not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.account()} response not OK`);
	}

	// Get account info returned by API
	const accountInfo = await response.json();

	// Return account info
	return accountInfo;
}

/**
 * Update the authenticated user's account information
 * @param {string} firstName User's new first name
 * @param {string} lastName User's new last name
 * @returns Account info object if the request was successful
 * @throws Will throw if network response is not OK
 */
export async function updateAccountInfo(firstName, lastName) {
	// Send put request to API endpoint
	const response = await fetch(routes.account(), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			firstName,
			lastName,
		}),
	});

	// Throw if response was not OK
	if (!response.ok) {
		throw new Error(`PUT ${routes.account()} response not OK`);
	}

	// Get account info returned by API
	const accountInfo = await response.json();

	// Return account info
	return accountInfo;
}
