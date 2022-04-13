/**
 * Routes to API endpoints
 */
const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	account: () => new URL('/account', routes.base()),
};

/**
 * Get the account information of the authenticated user
 * @returns Account info object if the request was successful, null otherwise
 */
export async function getAccountInfo() {
	try {
		// Send get request to API endpoint
		const response = await fetch(routes.account(), {
			credentials: 'include',
		});

		// Return null if response was not OK
		if (!response.ok) {
			return null;
		}

		// Get account info returned by API
		const accountInfo = await response.json();

		// Return account info
		return accountInfo;
	} catch (err) {
		// Log error
		console.error(err);

		// Return null if an error occurred
		return null;
	}
}

/**
 * Update the authenticated user's account information
 * @param {string} firstName User's new first name
 * @param {string} lastName User's new last name
 * @returns Account info object if the request was successful, null otherwise
 */
export async function updateAccountInfo(firstName, lastName) {
	try {
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

		// Return null if response was not OK
		if (!response.ok) {
			return null;
		}

		// Get account info returned by API
		const accountInfo = await response.json();

		// Return account info
		return accountInfo;
	} catch (err) {
		// Log error
		console.error(err);

		// Return null if an error occurred
		return null;
	}
}
